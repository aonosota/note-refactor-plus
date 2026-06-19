import { App, Modal, Setting, TFile } from "obsidian";
import { ConflictPolicy } from "../types";
import { joinNotePath, findAvailablePath } from "./filename";
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
 */
export async function resolveConflict(
	app: App,
	folder: string,
	basename: string,
	policy: ConflictPolicy,
	fallbackToIncrement = false,
): Promise<ConflictResolution> {
	const candidatePath = joinNotePath(folder, basename);
	const existing = app.vault.getAbstractFileByPath(candidatePath);

	if (!(existing instanceof TFile)) {
		return { action: "create", path: candidatePath };
	}

	const effectivePolicy = fallbackToIncrement ? "increment" : policy;

	switch (effectivePolicy) {
		case "increment":
			return {
				action: "create",
				path: findAvailablePath(app.vault, folder, basename),
			};

		case "append": {
			const originalContent = await app.vault.read(existing);
			return { action: "append", file: existing, originalContent };
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
			onIncrement: () => {
				resolve({
					action: "create",
					path: findAvailablePath(app.vault, folder, basename),
				});
			},
			onAppend: async () => {
				const abstractFile = app.vault.getAbstractFileByPath(
					joinNotePath(folder, basename),
				);
				if (!(abstractFile instanceof TFile)) return;
				const originalContent = await app.vault.read(abstractFile);
				resolve({ action: "append", file: abstractFile, originalContent });
			},
			onCancel: () => resolve({ action: "cancel" }),
		}).open();
	});
}

interface ConflictHandlers {
	onIncrement: () => void;
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
					.onClick(() => {
						this.close();
						this.handlers.onIncrement();
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
