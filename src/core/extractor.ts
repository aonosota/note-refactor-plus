import { App, Editor, Notice, TFile, TFolder, normalizePath } from "obsidian";
import { ExtractProfile } from "../types";
import { findAvailablePath } from "./filename";
import { getSelectionInfo } from "./selection";
import { applyTemplate, TemplateContext } from "./template";
import { resolveFilename } from "./filename-rule";
import { applyFrontmatter } from "./frontmatter";
import { buildSourceReplacement } from "./extractor-helpers";
import { applyContentTransforms } from "./content-transforms";
import { appendToEnd, appendUnderHeading } from "./append";
import { pickFile } from "../ui/file-suggester";
import { UndoStack } from "./undo-stack";
import { runTemplaterOnFile } from "../compat/templater";
import { t } from "../i18n";

export async function extractSelection(
	app: App,
	profile: ExtractProfile,
	editor: Editor,
	sourceFile: TFile,
	undoStack: UndoStack,
): Promise<TFile | null> {
	const selection = getSelectionInfo(editor);
	if (!selection) {
		new Notice(t("notice.select-text"));
		return null;
	}

	try {
		const folder = resolveDestinationFolder(profile, sourceFile);
		if (folder === null) return null;
		await ensureFolder(app, folder);

		const basename = await resolveFilename(app, profile, selection.firstLine);
		const sourceContentBefore = await app.vault.read(sourceFile);

		if (profile.target.mode === "append-existing") {
			return appendSelectionToExisting(
				app,
				profile,
				editor,
				sourceFile,
				selection.content,
				basename,
				sourceContentBefore,
				undoStack,
			);
		}

		const path = findAvailablePath(app.vault, folder, basename);
		const sourceLink = app.fileManager.generateMarkdownLink(sourceFile, path);
		const transformedContent = applyContentTransforms(selection.content, profile);
		const ctx: TemplateContext = {
			content: transformedContent,
			title: basename,
			sourceLink,
			sourceTitle: sourceFile.basename,
			sourcePath: sourceFile.path,
			heading: selection.heading ?? "",
		};
		const body = await applyTemplate(app, profile.templatePath, ctx);
		const newFile = await app.vault.create(path, body);

		if (profile.frontmatter.addSourceRef) {
			await applyFrontmatter(app, newFile, profile.frontmatter, sourceFile);
		}

		if (profile.runTemplaterAfter) {
			await runTemplaterOnFile(app, newFile);
		}

		const link = app.fileManager.generateMarkdownLink(newFile, sourceFile.path);
		editor.replaceSelection(
			buildSourceReplacement(profile, link, selection.content, basename),
		);

		undoStack.push({
			sourceFilePath: sourceFile.path,
			sourceContentBefore,
			createdFilePaths: [newFile.path],
		});

		await openAfterExtract(app, profile, newFile);
		new Notice(t("notice.extracted-to", { path: newFile.path }));
		return newFile;
	} catch (error) {
		new Notice(
			t("notice.extract-failed", {
				error: error instanceof Error ? error.message : String(error),
			}),
		);
		return null;
	}
}

export async function splitFromCursor(
	app: App,
	profile: ExtractProfile,
	editor: Editor,
	sourceFile: TFile,
	undoStack: UndoStack,
): Promise<TFile | null> {
	const cursorLine = editor.getCursor("from").line;
	const totalLines = editor.lineCount();

	// Collect lines from cursor to end, trim trailing blank lines
	const lines: string[] = [];
	for (let l = cursorLine; l < totalLines; l++) {
		lines.push(editor.getLine(l));
	}
	while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
		lines.pop();
	}
	const rawContent = lines.join("\n");

	if (!rawContent.trim()) {
		new Notice(t("notice.no-content-below-cursor"));
		return null;
	}

	// Helper: replace cursor-to-end with the given text
	const replaceInSource = (text: string): void => {
		const lastLine = totalLines - 1;
		editor.replaceRange(
			text,
			{ line: cursorLine, ch: 0 },
			{ line: lastLine, ch: editor.getLine(lastLine).length },
		);
	};

	try {
		const basename = await resolveFilename(app, profile, lines[0]);
		const sourceContentBefore = await app.vault.read(sourceFile);

		// append-existing branch
		if (profile.target.mode === "append-existing") {
			return appendSelectionToExisting(
				app,
				profile,
				editor,
				sourceFile,
				rawContent,
				basename,
				sourceContentBefore,
				undoStack,
				replaceInSource,
			);
		}

		const folder = resolveDestinationFolder(profile, sourceFile);
		if (folder === null) return null;
		await ensureFolder(app, folder);

		const path = findAvailablePath(app.vault, folder, basename);
		const sourceLink = app.fileManager.generateMarkdownLink(sourceFile, path);
		const transformedContent = applyContentTransforms(rawContent, profile);
		const ctx: TemplateContext = {
			content: transformedContent,
			title: basename,
			sourceLink,
			sourceTitle: sourceFile.basename,
			sourcePath: sourceFile.path,
			heading: "",
		};
		const body = await applyTemplate(app, profile.templatePath, ctx);
		const newFile = await app.vault.create(path, body);

		if (profile.frontmatter.addSourceRef) {
			await applyFrontmatter(app, newFile, profile.frontmatter, sourceFile);
		}

		if (profile.runTemplaterAfter) {
			await runTemplaterOnFile(app, newFile);
		}

		const link = app.fileManager.generateMarkdownLink(newFile, sourceFile.path);
		replaceInSource(buildSourceReplacement(profile, link, rawContent, basename));

		undoStack.push({
			sourceFilePath: sourceFile.path,
			sourceContentBefore,
			createdFilePaths: [newFile.path],
		});

		await openAfterExtract(app, profile, newFile);
		new Notice(t("notice.split-to", { path: newFile.path }));
		return newFile;
	} catch (error) {
		new Notice(
			t("notice.split-failed", {
				error: error instanceof Error ? error.message : String(error),
			}),
		);
		return null;
	}
}

async function appendSelectionToExisting(
	app: App,
	profile: ExtractProfile,
	editor: Editor,
	sourceFile: TFile,
	content: string,
	basename: string,
	sourceContentBefore: string,
	undoStack: UndoStack,
	replaceInSource?: (text: string) => void,
): Promise<TFile | null> {
	const rule = profile.target as Extract<
		typeof profile.target,
		{ mode: "append-existing" }
	>;

	let targetFile: TFile;
	if (rule.targetPath) {
		const found = app.vault.getAbstractFileByPath(rule.targetPath);
		if (!(found instanceof TFile)) {
			new Notice(t("notice.target-not-found", { path: rule.targetPath }));
			return null;
		}
		targetFile = found;
	} else {
		try {
			targetFile = await pickFile(app);
		} catch {
			return null; // user cancelled
		}
	}

	const targetContentBefore = await app.vault.read(targetFile);

	const sourceLink = app.fileManager.generateMarkdownLink(
		sourceFile,
		targetFile.path,
	);
	const transformedContent = applyContentTransforms(content, profile);
	const ctx: TemplateContext = {
		content: transformedContent,
		title: basename,
		sourceLink,
		sourceTitle: sourceFile.basename,
		sourcePath: sourceFile.path,
		heading: "",
	};
	const body = await applyTemplate(app, profile.templatePath, ctx);

	if (rule.position === "under-heading" && rule.headingName) {
		await appendUnderHeading(app, targetFile, rule.headingName, body);
	} else {
		await appendToEnd(app, targetFile, body);
	}

	const link = app.fileManager.generateMarkdownLink(targetFile, sourceFile.path);
	const replacement = buildSourceReplacement(profile, link, content, basename);
	if (replaceInSource) {
		replaceInSource(replacement);
	} else {
		editor.replaceSelection(replacement);
	}

	undoStack.push({
		sourceFilePath: sourceFile.path,
		sourceContentBefore,
		createdFilePaths: [],
		targetFilePath: targetFile.path,
		targetContentBefore,
	});

	new Notice(t("notice.appended-to", { path: targetFile.path }));
	return targetFile;
}

function resolveDestinationFolder(
	profile: ExtractProfile,
	sourceFile: TFile,
): string | null {
	switch (profile.destination.mode) {
		case "fixed":
			return normalizePath(profile.destination.path);
		case "same-as-source": {
			const parent = sourceFile.parent?.path ?? "";
			return parent === "/" ? "" : parent;
		}
		case "prompt":
			new Notice(t("notice.destination-not-implemented"));
			return null;
	}
}

async function ensureFolder(app: App, folder: string): Promise<void> {
	if (!folder) return;
	const existing = app.vault.getAbstractFileByPath(folder);
	if (existing instanceof TFolder) return;
	if (existing) throw new Error(`"${folder}" is a file, not a folder.`);
	await app.vault.createFolder(folder);
}

async function openAfterExtract(
	app: App,
	profile: ExtractProfile,
	file: TFile,
): Promise<void> {
	if (profile.afterExtract === "none") return;
	const leafType =
		profile.afterExtract === "open-new-pane"
			? "split"
			: profile.afterExtract === "open-new-tab"
				? "tab"
				: false;
	const leaf = app.workspace.getLeaf(leafType);
	await leaf.openFile(file);
}
