import { App, Modal, Setting, TFile } from "obsidian";
import { ExtractProfile } from "../types";
import { sanitizeFilename } from "./filename";
import { expandVariables, TemplateContext } from "./template";
import { t } from "../i18n";

export interface ResolveFilenameOptions {
	/** Source note; enables {{source_title}} / {{source_path}} in Pattern. */
	sourceFile?: TFile;
	/** Nearest/parent heading; enables {{heading}} in Pattern. */
	heading?: string;
	/**
	 * Bulk operations (split by heading level) must not open a modal per
	 * section, so `mode: "prompt"` falls back to the first-line behaviour.
	 */
	bulk?: boolean;
}

/**
 * Resolves the basename (no extension) for the new note based on the profile's
 * filenameRule. May open a prompt modal for `mode: "prompt"`.
 * Returns null if the user cancels the prompt (no error — just abort silently).
 */
export async function resolveFilename(
	app: App,
	profile: ExtractProfile,
	firstLine: string,
	options: ResolveFilenameOptions = {},
): Promise<string | null> {
	switch (profile.filenameRule.mode) {
		case "first-line":
			return sanitizeFilename(firstLine);
		case "pattern": {
			const now = new Date();
			const ctx: TemplateContext = {
				content: "",
				title: sanitizeFilename(firstLine),
				sourceLink: "",
				sourceTitle: options.sourceFile?.basename ?? "",
				sourcePath: options.sourceFile?.path ?? "",
				heading: options.heading ?? "",
			};
			const raw = expandVariables(profile.filenameRule.pattern, ctx, now);
			return sanitizeFilename(raw);
		}
		case "prompt":
			if (options.bulk) return sanitizeFilename(firstLine);
			return promptFilename(app, sanitizeFilename(firstLine));
	}
}

function promptFilename(app: App, defaultValue: string): Promise<string | null> {
	return new Promise((resolve) => {
		new FilenamePromptModal(app, defaultValue, resolve, () => resolve(null)).open();
	});
}

class FilenamePromptModal extends Modal {
	private value: string;
	private readonly onSubmit: (name: string) => void;
	private readonly onCancel: () => void;

	constructor(
		app: App,
		defaultValue: string,
		onSubmit: (name: string) => void,
		onCancel: () => void,
	) {
		super(app);
		this.value = defaultValue;
		this.onSubmit = onSubmit;
		this.onCancel = onCancel;
	}

	onOpen(): void {
		this.titleEl.setText(t("filename-prompt.title"));
		new Setting(this.contentEl)
			.setName(t("filename-prompt.label"))
			.addText((text) => {
				text.setValue(this.value).onChange((v) => {
					this.value = v;
				});
				text.inputEl.addEventListener("keydown", (e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						this.submit();
					}
				});
				window.setTimeout(() => text.inputEl.focus(), 0);
			});

		new Setting(this.contentEl)
			.addButton((btn) =>
				btn
					.setButtonText(t("filename-prompt.create"))
					.setCta()
					.onClick(() => this.submit()),
			)
			.addButton((btn) =>
				btn.setButtonText(t("filename-prompt.cancel")).onClick(() => this.cancel()),
			);
	}

	onClose(): void {
		// If closed without submit (e.g. Escape), cancel
		if (!this._submitted) {
			this.onCancel();
		}
	}

	private _submitted = false;

	private submit(): void {
		this._submitted = true;
		const name = sanitizeFilename(this.value.trim());
		this.close();
		this.onSubmit(name || "Untitled");
	}

	private cancel(): void {
		this._submitted = true;
		this.close();
		this.onCancel();
	}
}
