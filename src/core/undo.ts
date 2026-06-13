import { App, Notice, TFile } from "obsidian";
import { UndoStack } from "./undo-stack";

export async function undoLastExtract(app: App, undoStack: UndoStack): Promise<void> {
	const snapshot = undoStack.pop();
	if (!snapshot) {
		new Notice("Nothing to undo.");
		return;
	}

	try {
		// Restore source file
		const sourceFile = app.vault.getAbstractFileByPath(snapshot.sourceFilePath);
		if (!(sourceFile instanceof TFile)) {
			new Notice(`Undo failed: source file not found (${snapshot.sourceFilePath})`);
			return;
		}
		await app.vault.modify(sourceFile, snapshot.sourceContentBefore);

		// Delete files created during extraction
		for (const path of snapshot.createdFilePaths) {
			const file = app.vault.getAbstractFileByPath(path);
			if (file instanceof TFile) {
				await app.vault.delete(file);
			}
		}

		// For append-existing: restore target file
		if (snapshot.targetFilePath && snapshot.targetContentBefore !== undefined) {
			const targetFile = app.vault.getAbstractFileByPath(snapshot.targetFilePath);
			if (targetFile instanceof TFile) {
				await app.vault.modify(targetFile, snapshot.targetContentBefore);
			}
		}

		const count = snapshot.createdFilePaths.length;
		const detail = count > 0 ? ` (deleted ${count} note${count > 1 ? "s" : ""})` : "";
		new Notice(`Undo last extract: restored${detail}.`);
	} catch (error) {
		new Notice(
			`Undo failed: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
