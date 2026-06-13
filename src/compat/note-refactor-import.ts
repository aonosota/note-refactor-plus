import { App, normalizePath } from "obsidian";
import { ExtractProfile } from "../types";
import { createDefaultProfile } from "../settings/defaults";

interface NoteRefactorData {
	fileNameTemplate?: string;
	noteContentTemplate?: string;
	overwriteExistingNote?: boolean;
	noteLocation?: "default" | "root" | "custom";
	customFolder?: string;
	newFileFolderPath?: string;
}

export interface NoteRefactorImportResult {
	profile: ExtractProfile;
	/** Non-empty when Note Refactor had a custom note content template. */
	templateContent?: string;
}

export async function importNoteRefactorSettings(
	app: App,
): Promise<NoteRefactorImportResult | null> {
	const dataPath = normalizePath(
		".obsidian/plugins/note-refactor-obsidian/data.json",
	);

	let raw: string;
	try {
		raw = await app.vault.adapter.read(dataPath);
	} catch {
		return null;
	}

	let data: NoteRefactorData;
	try {
		data = JSON.parse(raw) as NoteRefactorData;
	} catch {
		return null;
	}

	return convertToProfile(data);
}

function convertToProfile(data: NoteRefactorData): NoteRefactorImportResult {
	const partial: Partial<ExtractProfile> = {
		id: crypto.randomUUID(),
		name: "Imported from Note Refactor",
		description: "Imported from Note Refactor plugin.",
		icon: "scissors",
	};

	// Filename rule
	const fnTemplate = (data.fileNameTemplate ?? "{{title}}").trim();
	if (fnTemplate === "" || fnTemplate === "{{title}}") {
		partial.filenameRule = { mode: "first-line" };
	} else {
		partial.filenameRule = { mode: "pattern", pattern: fnTemplate };
	}

	// Destination
	const loc = data.noteLocation ?? "default";
	const folder = (data.customFolder || data.newFileFolderPath || "").trim();
	if (loc === "custom" && folder) {
		partial.destination = { mode: "fixed", path: folder };
	} else if (loc === "root") {
		partial.destination = { mode: "fixed", path: "" };
	} else {
		partial.destination = { mode: "same-as-source" };
	}

	// Conflict policy
	partial.conflictPolicy = data.overwriteExistingNote ? "append" : "increment";

	const profile = createDefaultProfile(partial);

	// If Note Refactor had a custom template content, surface it separately
	const noteTemplate = (data.noteContentTemplate ?? "").trim();
	const templateContent =
		noteTemplate && noteTemplate !== "{{content}}" ? noteTemplate : undefined;

	return { profile, templateContent };
}
