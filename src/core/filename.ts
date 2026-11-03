import { TAbstractFile, Vault, normalizePath } from "obsidian";

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
 * Result of {@link findExistingFile}.
 *  - `null`: nothing exists at the path — safe to create.
 *  - `{ file }`: an existing vault entry occupies the path. `file` is the exact
 *    match when there is one, otherwise the entry whose path differs only in
 *    letter case (on a case-insensitive filesystem the OS treats it as the same
 *    file, so creating `path` would fail).
 *  - `{ file: null }`: the OS reports that something exists at the path but the
 *    vault index has no matching entry (e.g. not yet indexed). Treat it as
 *    occupied, but there is no TFile to append to.
 */
export type ExistingFile = { file: TAbstractFile | null } | null;

/**
 * Checks whether `path` is already taken, the way the underlying filesystem
 * sees it. `Vault.getAbstractFileByPath` is an exact, case-sensitive lookup,
 * so on macOS/Windows it misses `Todo.md` when probing for `todo.md` and the
 * later `vault.create` fails with "file already exists". `adapter.exists` asks
 * the OS instead, so the case-insensitive fallback only kicks in where the
 * filesystem would actually collide — on a case-sensitive filesystem the two
 * names remain distinct files.
 */
export async function findExistingFile(
	vault: Vault,
	path: string,
): Promise<ExistingFile> {
	const exact = vault.getAbstractFileByPath(path);
	if (exact) return { file: exact };

	if (!(await vault.adapter.exists(path))) return null;

	const lower = path.toLowerCase();
	const caseVariant =
		vault.getAllLoadedFiles().find((f) => f.path.toLowerCase() === lower) ??
		null;
	return { file: caseVariant };
}

/**
 * Returns a vault path that does not collide with an existing file,
 * appending " 1", " 2", ... when needed (conflict policy: increment).
 */
export async function findAvailablePath(
	vault: Vault,
	folder: string,
	basename: string,
): Promise<string> {
	let candidate = joinNotePath(folder, basename);
	let counter = 1;
	while (await findExistingFile(vault, candidate)) {
		candidate = joinNotePath(folder, `${basename} ${counter}`);
		counter++;
	}
	return candidate;
}
