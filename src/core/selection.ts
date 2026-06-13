import { Editor } from "obsidian";

export interface SelectionInfo {
	content: string;
	firstLine: string;
	/** Nearest heading above the selection start, or undefined if none. */
	heading?: string;
}

const LEADING_MARKERS = /^(?:#{1,6}\s+|[-*+]\s+|>\s*|\d+\.\s+)+/;
const HEADING_LINE = /^#{1,6}\s+(.+)/;

export function getSelectionInfo(editor: Editor): SelectionInfo | null {
	const content = editor.getSelection();
	if (!content.trim()) {
		return null;
	}
	const rawFirstLine =
		content.split("\n").find((line) => line.trim().length > 0) ?? "";
	const firstLine = rawFirstLine.replace(LEADING_MARKERS, "").trim();

	const heading = findNearestHeading(editor);
	return { content, firstLine, heading };
}

/**
 * Scans upward from the selection start to find the nearest markdown heading.
 * Uses the editor line API rather than metadataCache so it works on unsaved buffers too.
 */
function findNearestHeading(editor: Editor): string | undefined {
	const cursor = editor.getCursor("from");
	for (let line = cursor.line; line >= 0; line--) {
		const text = editor.getLine(line);
		const m = HEADING_LINE.exec(text);
		if (m) {
			return m[1].trim();
		}
	}
	return undefined;
}
