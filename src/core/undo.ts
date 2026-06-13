import { App, Notice, TFile } from "obsidian";
import { UndoStack } from "./undo-stack";
import { t } from "../i18n";

export async function undoLastExtract(app: App, undoStack: UndoStack): Promise<void> {
	const snapshot = undoStack.pop();
	if (!snapshot) {
		new Notice(t("undo.nothing"));
		return;
	}

	try {
		// Restore source file
		const sourceFile = app.vault.getAbstractFileByPath(snapshot.sourceFilePath);
		if (!(sourceFile instanceof TFile)) {
			new Notice(t("undo.source-not-found", { path: snapshot.sourceFilePath }));
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

		// For append-existing or conflict-append: restore target file
		if (snapshot.targetFilePath && snapshot.targetContentBefore !== undefined) {
			const targetFile = app.vault.getAbstractFileByPath(snapshot.targetFilePath);
			if (targetFile instanceof TFile) {
				await app.vault.modify(targetFile, snapshot.targetContentBefore);
			}
		}

		const count = snapshot.createdFilePaths.length;
		if (count === 0) {
			new Notice(t("undo.restored"));
		} else if (count === 1) {
			new Notice(t("undo.restored-deleted", { count: String(count) }));
		} else {
			new Notice(t("undo.restored-deleted-plural", { count: String(count) }));
		}
	} catch (error) {
		new Notice(
			t("undo.failed", { error: error instanceof Error ? error.message : String(error) }),
		);
	}
}
