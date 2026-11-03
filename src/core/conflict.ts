import { App, Modal, Notice, Setting, TFile } from "obsidian";
import { ConflictPolicy } from "../types";
import { joinNotePath, findAvailablePath, findExistingFile } from "./filename";
import { t } from "../i18n";

export type ConflictResolution =
	| { action: "create"; path: string }
	| { action: "append"; file: TFile; originalContent: string }
	| { action: "cancel" };

/**
 * Resolves a filename collision based on the profile's conflict policy.
 * Pass `fallbackToIncrement = true` in bulk operations to avoid modal prompts
 * for every heading and to keep bulk-undo snapshots consistent (they only
 * delete newly created files, not appended-to files).
 *
 * Collisions are detected the way the filesystem sees them (see
 * {@link findExistingFile}), so on a case-insensitive OS an existing `Todo.md`
 * counts as a collision for `todo.md`.
 */
export async function resolveConflict(
	app: App,
	folder: string,
	basename: string,
	policy: ConflictPolicy,
	fallbackToIncrement = false,
): Promise<ConflictResolution> {
	const candidatePath = joinNotePath(folder, basename);
	const existing = await findExistingFile(app.vault, candidatePath);

	if (existing === null) {
		return { action: "create", path: candidatePath };
	}

	// Only a note can be appended to. If the path is occupied by a folder, or by
	// something the vault index cannot resolve, the only safe option is a new name.
	const existingFile = existing.file;
	if (fallbackToIncrement || !(existingFile instanceof TFile)) {
		return {
			action: "create",
			path: await findAvailablePath(app.vault, folder, basename),
		};
	}

	switch (policy) {
		case "increment":
			return {
				action: "create",
				path: await findAvailablePath(app.vault, folder, basename),
			};

		case "append": {
			const originalContent = await app.vault.read(existingFile);
			return { action: "append", file: existingFile, originalContent };
		}

		case "ask":
			return promptConflict(app, basename, folder);
	}
}

function promptConflict(
	app: App,
	basename: string,
	folder: string,
): Promise<ConflictResolution> {
	return new Promise((resolve) => {
		new ConflictModal(app, basename, {
			onIncrement: async () => {
				resolve({
					action: "create",
					path: await findAvailablePath(app.vault, folder, basename),
				});
			},
			onAppend: async () => {
				const path = joinNotePath(folder, basename);
				const existing = await findExistingFile(app.vault, path);
				const file = existing?.file;
				if (!(file instanceof TFile)) {
					new Notice(t("notice.target-not-found", { path }));
					resolve({ action: "cancel" });
					return;
				}
				const originalContent = await app.vault.read(file);
				resolve({ action: "append", file, originalContent });
			},
			onCancel: () => resolve({ action: "cancel" }),
		}).open();
	});
}

interface ConflictHandlers {
	onIncrement: () => Promise<void>;
	onAppend: () => Promise<void>;
	onCancel: () => void;
}

class ConflictModal extends Modal {
	constructor(
		app: App,
		private readonly basename: string,
		private readonly handlers: ConflictHandlers,
	) {
		super(app);
	}

	onOpen(): void {
		this.titleEl.setText(t("conflict.title"));
		const { contentEl } = this;

		contentEl.createEl("p", {
			text: t("conflict.desc", { name: this.basename }),
		});

		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText(t("conflict.increment"))
					.onClick(async () => {
						this.close();
						await this.handlers.onIncrement();
					}),
			)
			.addButton((btn) =>
				btn
					.setButtonText(t("conflict.append"))
					.setCta()
					.onClick(async () => {
						this.close();
						await this.handlers.onAppend();
					}),
			)
			.addButton((btn) =>
				btn
					.setButtonText(t("conflict.cancel"))
					.onClick(() => {
						this.close();
						this.handlers.onCancel();
					}),
			);
	}

	onClose(): void {
		this.contentEl.empty();
	}
}
