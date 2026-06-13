import { App, Editor, HeadingCache, Notice, TFile, TFolder, normalizePath } from "obsidian";
import { ExtractProfile } from "../types";
import { sanitizeFilename, findAvailablePath } from "./filename";
import { applyTemplate, TemplateContext } from "./template";
import { applyFrontmatter } from "./frontmatter";
import { resolveFilename } from "./filename-rule";
import { buildSourceReplacement } from "./extractor-helpers";
import { applyContentTransforms } from "./content-transforms";
import { UndoStack } from "./undo-stack";
import { runTemplaterOnFile } from "../compat/templater";
import { t } from "../i18n";

interface HeadingRange {
	startLine: number;
	/** Raw end line (not trimmed). trimmedEndLine is computed when reading. */
	endLine: number;
	heading: HeadingCache;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function extractHeadingAtCursor(
	app: App,
	profile: ExtractProfile,
	editor: Editor,
	sourceFile: TFile,
	undoStack: UndoStack,
): Promise<TFile | null> {
	const headings = app.metadataCache.getFileCache(sourceFile)?.headings ?? [];
	if (headings.length === 0) {
		new Notice(t("notice.no-headings"));
		return null;
	}
	const cursor = editor.getCursor("from");
	const range = getRangeAtCursor(headings, cursor.line, editor.lineCount());
	if (!range) {
		new Notice(t("notice.cursor-in-heading"));
		return null;
	}
	const basename = await resolveFilename(app, profile, range.heading.heading);
	return doExtract(app, profile, editor, sourceFile, range, headings, basename, undoStack);
}

export async function splitByHeadingLevel(
	app: App,
	profile: ExtractProfile,
	editor: Editor,
	sourceFile: TFile,
	level: 1 | 2 | 3,
	undoStack: UndoStack,
): Promise<TFile[]> {
	const allHeadings =
		app.metadataCache.getFileCache(sourceFile)?.headings ?? [];
	const targets = allHeadings.filter((h) => h.level === level);
	if (targets.length === 0) {
		new Notice(t("notice.no-h-level", { level: String(level) }));
		return [];
	}

	// Snapshot source content before any edits
	const sourceContentBefore = editor.getValue();

	// Snapshot all ranges before any edits (reverse order = bottom-to-top)
	const ranges = targets
		.map((h) => getRangeForHeading(allHeadings, h, editor.lineCount()))
		.reverse();

	const created: TFile[] = [];
	for (const range of ranges) {
		const basename = sanitizeFilename(range.heading.heading);
		// Pass null to skip per-extraction undo pushes; we push a single bulk snapshot below
		const file = await doExtract(
			app,
			profile,
			editor,
			sourceFile,
			range,
			allHeadings,
			basename,
			null,
		);
		if (file) created.unshift(file);
	}

	if (created.length > 0) {
		undoStack.push({
			sourceFilePath: sourceFile.path,
			sourceContentBefore,
			createdFilePaths: created.map((f) => f.path),
		});
		new Notice(
			t("notice.split-count", {
				count: String(created.length),
				notes:
					created.length === 1
						? t("notice.split-notes-singular")
						: t("notice.split-notes-plural"),
			}),
		);
	}
	return created;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getRangeAtCursor(
	headings: HeadingCache[],
	cursorLine: number,
	totalLines: number,
): HeadingRange | null {
	let currentIdx = -1;
	for (let i = 0; i < headings.length; i++) {
		if (headings[i].position.start.line <= cursorLine) {
			currentIdx = i;
		} else {
			break;
		}
	}
	if (currentIdx === -1) return null;
	return getRangeForHeading(headings, headings[currentIdx], totalLines);
}

function getRangeForHeading(
	allHeadings: HeadingCache[],
	heading: HeadingCache,
	totalLines: number,
): HeadingRange {
	const startLine = heading.position.start.line;
	const idx = allHeadings.indexOf(heading);
	let endLine = totalLines - 1;
	for (let i = idx + 1; i < allHeadings.length; i++) {
		if (allHeadings[i].level <= heading.level) {
			endLine = allHeadings[i].position.start.line - 1;
			break;
		}
	}
	return { startLine, endLine, heading };
}

function readRange(
	editor: Editor,
	range: HeadingRange,
): { content: string; effectiveEndLine: number } {
	// Trim trailing blank lines from the range
	let endLine = range.endLine;
	while (endLine > range.startLine && editor.getLine(endLine).trim() === "") {
		endLine--;
	}
	const lines: string[] = [];
	for (let l = range.startLine; l <= endLine; l++) {
		lines.push(editor.getLine(l));
	}
	return { content: lines.join("\n"), effectiveEndLine: endLine };
}

function deleteRange(
	editor: Editor,
	startLine: number,
	endLine: number,
): void {
	const totalLines = editor.lineCount();
	const from = { line: startLine, ch: 0 };
	const to =
		endLine + 1 < totalLines
			? { line: endLine + 1, ch: 0 }
			: { line: endLine, ch: editor.getLine(endLine).length };
	editor.replaceRange("", from, to);
}

function findParentHeading(
	allHeadings: HeadingCache[],
	heading: HeadingCache,
): string {
	const idx = allHeadings.indexOf(heading);
	for (let i = idx - 1; i >= 0; i--) {
		if (allHeadings[i].level < heading.level) {
			return allHeadings[i].heading;
		}
	}
	return "";
}

async function resolveFolder(
	profile: ExtractProfile,
	sourceFile: TFile,
): Promise<string | null> {
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

async function doExtract(
	app: App,
	profile: ExtractProfile,
	editor: Editor,
	sourceFile: TFile,
	range: HeadingRange,
	allHeadings: HeadingCache[],
	basename: string,
	undoStack: UndoStack | null,
): Promise<TFile | null> {
	try {
		const folder = await resolveFolder(profile, sourceFile);
		if (folder === null) return null;
		await ensureFolder(app, folder);

		// Snapshot before any edits (only when not part of a bulk split)
		const sourceContentBefore = undoStack ? editor.getValue() : "";

		const { content, effectiveEndLine } = readRange(editor, range);
		const path = findAvailablePath(app.vault, folder, basename);

		const sourceLink = app.fileManager.generateMarkdownLink(sourceFile, path);
		const transformedContent = applyContentTransforms(content, profile, "heading");
		const ctx: TemplateContext = {
			content: transformedContent,
			title: basename,
			sourceLink,
			sourceTitle: sourceFile.basename,
			sourcePath: sourceFile.path,
			heading: findParentHeading(allHeadings, range.heading),
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
		const replacement = buildSourceReplacement(profile, link, content, basename);

		deleteRange(editor, range.startLine, effectiveEndLine);
		if (replacement) {
			editor.replaceRange(replacement, { line: range.startLine, ch: 0 });
		}

		undoStack?.push({
			sourceFilePath: sourceFile.path,
			sourceContentBefore,
			createdFilePaths: [newFile.path],
		});

		if (profile.afterExtract !== "none") {
			const leaf = app.workspace.getLeaf(
				profile.afterExtract === "open-new-pane" ? "split" : false,
			);
			await leaf.openFile(newFile);
		}

		return newFile;
	} catch (error) {
		new Notice(
			`Extract failed: ${error instanceof Error ? error.message : String(error)}`,
		);
		return null;
	}
}
