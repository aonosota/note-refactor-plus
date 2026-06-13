import { Vault, normalizePath } from "obsidian";

/**
 * Characters that are invalid in note filenames or break wiki links:
 * OS-invalid (\ / : ? * " < >) plus Obsidian link syntax (# | ^ [ ]).
 */
const FORBIDDEN_CHARS = /[\\/:#|^[\]?*"<>]/g;

export function sanitizeFilename(raw: string): string {
	const cleaned = raw
		.replace(FORBIDDEN_CHARS, " ")
		.replace(/\s+/g, " ")
		.trim();
	return cleaned || "Untitled";
}

export function joinNotePath(folder: string, basename: string): string {
	const dir = folder && folder !== "/" ? `${folder}/` : "";
	return normalizePath(`${dir}${basename}.md`);
}

/**
 * Returns a vault path that does not collide with an existing file,
 * appending " 1", " 2", ... when needed (conflict policy: increment).
 */
export function findAvailablePath(
	vault: Vault,
	folder: string,
	basename: string,
): string {
	let candidate = joinNotePath(folder, basename);
	let counter = 1;
	while (vault.getAbstractFileByPath(candidate)) {
		candidate = joinNotePath(folder, `${basename} ${counter}`);
		counter++;
	}
	return candidate;
}
