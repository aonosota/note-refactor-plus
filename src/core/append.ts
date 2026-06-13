import { App, TFile } from "obsidian";

/**
 * Appends content to the end of an existing note.
 * Ensures a blank separator line before the new content.
 */
export async function appendToEnd(
	app: App,
	file: TFile,
	content: string,
): Promise<void> {
	await app.vault.process(file, (existing) => {
		const trimmed = existing.trimEnd();
		const separator = trimmed.length > 0 ? "\n\n" : "";
		return `${trimmed}${separator}${content}`;
	});
}

/**
 * Appends content at the end of a named heading's section.
 * If the heading is not found, falls back to appending at the end of the file.
 */
export async function appendUnderHeading(
	app: App,
	file: TFile,
	headingName: string,
	content: string,
): Promise<void> {
	await app.vault.process(file, (existing) => {
		const lines = existing.split("\n");
		const insertLine = findHeadingSectionEnd(lines, headingName);
		if (insertLine === null) {
			// Heading not found — append at end
			const trimmed = existing.trimEnd();
			const separator = trimmed.length > 0 ? "\n\n" : "";
			return `${trimmed}${separator}${content}`;
		}
		// Insert after the heading's section (before the next heading or EOF)
		const before = lines.slice(0, insertLine);
		const after = lines.slice(insertLine);
		const separator =
			before.length > 0 && before[before.length - 1].trim() !== "" ? "\n" : "";
		return [...before, separator + content, ...after].join("\n");
	});
}

/**
 * Returns the line index where new content should be inserted (the line just
 * before the next same-or-higher heading, or the trimmed end of the heading's
 * section). Returns null if the heading was not found.
 */
function findHeadingSectionEnd(
	lines: string[],
	headingName: string,
): number | null {
	const HEADING_RE = /^(#{1,6})\s+(.+)/;

	let sectionLevel = 0;
	let inSection = false;
	let sectionEnd = lines.length;

	for (let i = 0; i < lines.length; i++) {
		const m = HEADING_RE.exec(lines[i]);
		if (!m) continue;

		const level = m[1].length;
		const text = m[2].trim();

		if (!inSection) {
			if (text === headingName) {
				inSection = true;
				sectionLevel = level;
				continue;
			}
		} else {
			if (level <= sectionLevel) {
				// Next same-or-higher heading found; trim trailing blanks
				sectionEnd = i;
				while (
					sectionEnd > 0 &&
					lines[sectionEnd - 1].trim() === ""
				) {
					sectionEnd--;
				}
				return sectionEnd;
			}
		}
	}

	if (!inSection) return null;

	// Reached end of file; trim trailing blanks
	while (sectionEnd > 0 && lines[sectionEnd - 1].trim() === "") {
		sectionEnd--;
	}
	return sectionEnd;
}
