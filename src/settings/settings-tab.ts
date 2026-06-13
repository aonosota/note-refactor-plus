import { App, Notice, PluginSettingTab, Setting, setIcon } from "obsidian";
import { ExtractProfile } from "../types";
import { NrpPlugin, registerProfileCommand, removeProfileCommand } from "../commands";
import { saveSettings } from "./settings";
import { createDefaultProfile } from "./defaults";
import { ProfileEditorModal } from "./profile-editor";
import { t } from "../i18n";
import { importNoteRefactorSettings } from "../compat/note-refactor-import";

export class NrpSettingsTab extends PluginSettingTab {
	private readonly nrpPlugin: NrpPlugin;

	constructor(app: App, plugin: NrpPlugin) {
		super(app, plugin);
		this.nrpPlugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		this.renderGlobalSettings(containerEl);
		this.renderCompatibilitySection(containerEl);
		this.renderProfileList(containerEl);
	}

	// -------------------------------------------------------------------------

	private renderGlobalSettings(el: HTMLElement): void {
		new Setting(el).setName(t("settings.global-heading")).setHeading();

		new Setting(el)
			.setName(t("settings.show-context-menu"))
			.setDesc(t("settings.show-context-menu-desc"))
			.addToggle((tog) =>
				tog
					.setValue(this.nrpPlugin.settings.showContextMenu)
					.onChange(async (v) => {
						this.nrpPlugin.settings.showContextMenu = v;
						await saveSettings(this.nrpPlugin, this.nrpPlugin.settings);
					}),
			);

		new Setting(el)
			.setName(t("settings.context-menu-items"))
			.setDesc(t("settings.context-menu-items-desc"))
			.addSlider((s) =>
				s
					.setLimits(1, 10, 1)
					.setValue(this.nrpPlugin.settings.contextMenuTopN)
					.setDynamicTooltip()
					.onChange(async (v) => {
						this.nrpPlugin.settings.contextMenuTopN = v;
						await saveSettings(this.nrpPlugin, this.nrpPlugin.settings);
					}),
			);
	}

	private renderCompatibilitySection(el: HTMLElement): void {
		new Setting(el).setName(t("settings.compat-heading")).setHeading();

		new Setting(el)
			.setName(t("settings.import-nr"))
			.setDesc(t("settings.import-nr-desc"))
			.addButton((btn) =>
				btn
					.setButtonText(t("settings.import-nr-btn"))
					.onClick(async () => {
						let result: Awaited<ReturnType<typeof importNoteRefactorSettings>>;
						try {
							result = await importNoteRefactorSettings(this.app);
						} catch {
							new Notice(t("notice.import-failed"));
							return;
						}
						if (!result) {
							new Notice(t("notice.import-not-found"));
							return;
						}
						this.nrpPlugin.settings.profiles.push(result.profile);
						await saveSettings(this.nrpPlugin, this.nrpPlugin.settings);
						registerProfileCommand(this.nrpPlugin, result.profile);
						if (result.templateContent) {
							new Notice(
								t("notice.import-template-note", {
									template: result.templateContent,
								}),
							);
						}
						new Notice(t("notice.import-success"));
						this.display();
					}),
			);
	}

	private renderProfileList(el: HTMLElement): void {
		new Setting(el)
			.setName(t("settings.profiles-heading"))
			.setHeading()
			.addButton((btn) =>
				btn
					.setButtonText(t("settings.add-profile"))
					.setCta()
					.onClick(() => {
						const newProfile = createDefaultProfile({
							id: crypto.randomUUID(),
							name: t("settings.new-profile-name"),
							description: "",
						});
						new ProfileEditorModal(
							this.app,
							newProfile,
							true,
							async (saved) => {
								this.nrpPlugin.settings.profiles.push(saved);
								await saveSettings(this.nrpPlugin, this.nrpPlugin.settings);
								registerProfileCommand(this.nrpPlugin, saved);
								this.display();
							},
						).open();
					}),
			);

		const listEl = el.createDiv("nrp-profile-list");
		let dragFromIndex: number | null = null;

		this.nrpPlugin.settings.profiles.forEach((profile, i) => {
			this.renderProfileItem(listEl, profile, i, {
				onDragStart: () => {
					dragFromIndex = i;
				},
				onDrop: async () => {
					if (dragFromIndex === null || dragFromIndex === i) return;
					const [moved] = this.nrpPlugin.settings.profiles.splice(dragFromIndex, 1);
					this.nrpPlugin.settings.profiles.splice(i, 0, moved);
					dragFromIndex = null;
					await saveSettings(this.nrpPlugin, this.nrpPlugin.settings);
					this.display();
				},
				onMoveUp: async () => {
					if (i === 0) return;
					const p = this.nrpPlugin.settings.profiles;
					[p[i - 1], p[i]] = [p[i], p[i - 1]];
					await saveSettings(this.nrpPlugin, this.nrpPlugin.settings);
					this.display();
				},
				onMoveDown: async () => {
					const p = this.nrpPlugin.settings.profiles;
					if (i >= p.length - 1) return;
					[p[i], p[i + 1]] = [p[i + 1], p[i]];
					await saveSettings(this.nrpPlugin, this.nrpPlugin.settings);
					this.display();
				},
				onSetDefault: async () => {
					this.nrpPlugin.settings.defaultProfileId = profile.id;
					await saveSettings(this.nrpPlugin, this.nrpPlugin.settings);
					this.display();
				},
				onEdit: () => {
					new ProfileEditorModal(
						this.app,
						profile,
						false,
						async (saved) => {
							this.nrpPlugin.settings.profiles[i] = saved;
							await saveSettings(this.nrpPlugin, this.nrpPlugin.settings);
							this.display();
						},
					).open();
				},
				onDuplicate: async () => {
					const copy = structuredClone(profile);
					copy.id = crypto.randomUUID();
					copy.name = `${profile.name}${t("settings.copy-suffix")}`;
					this.nrpPlugin.settings.profiles.splice(i + 1, 0, copy);
					await saveSettings(this.nrpPlugin, this.nrpPlugin.settings);
					registerProfileCommand(this.nrpPlugin, copy);
					this.display();
				},
				onDelete: async () => {
					if (this.nrpPlugin.settings.profiles.length <= 1) return;
					this.nrpPlugin.settings.profiles.splice(i, 1);
					if (this.nrpPlugin.settings.defaultProfileId === profile.id) {
						this.nrpPlugin.settings.defaultProfileId =
							this.nrpPlugin.settings.profiles[0].id;
					}
					removeProfileCommand(this.nrpPlugin, profile.id);
					await saveSettings(this.nrpPlugin, this.nrpPlugin.settings);
					this.display();
				},
			});
		});
	}

	private renderProfileItem(
		listEl: HTMLElement,
		profile: ExtractProfile,
		index: number,
		handlers: {
			onDragStart: () => void;
			onDrop: () => Promise<void>;
			onMoveUp: () => Promise<void>;
			onMoveDown: () => Promise<void>;
			onSetDefault: () => Promise<void>;
			onEdit: () => void;
			onDuplicate: () => Promise<void>;
			onDelete: () => Promise<void>;
		},
	): void {
		const isDefault =
			profile.id === this.nrpPlugin.settings.defaultProfileId;
		const isFirst = index === 0;
		const isLast =
			index === this.nrpPlugin.settings.profiles.length - 1;
		const isOnly = this.nrpPlugin.settings.profiles.length === 1;

		const item = listEl.createDiv({ cls: "nrp-profile-item" });
		item.setAttribute("draggable", "true");

		// Drag handle
		const handle = item.createDiv("nrp-drag-handle");
		setIcon(handle, "grip-vertical");

		// Drag events
		item.addEventListener("dragstart", (e) => {
			handlers.onDragStart();
			if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
			item.classList.add("nrp-dragging");
		});
		item.addEventListener("dragend", () => {
			item.classList.remove("nrp-dragging");
			listEl
				.querySelectorAll(".nrp-drag-over")
				.forEach((el) => el.classList.remove("nrp-drag-over"));
		});
		item.addEventListener("dragover", (e) => {
			e.preventDefault();
			if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
			item.classList.add("nrp-drag-over");
		});
		item.addEventListener("dragleave", () => {
			item.classList.remove("nrp-drag-over");
		});
		item.addEventListener("drop", (e) => {
			e.preventDefault();
			item.classList.remove("nrp-drag-over");
			handlers.onDrop();
		});

		// Profile icon
		const iconEl = item.createDiv("nrp-profile-icon");
		try {
			setIcon(iconEl, profile.icon || "file-text");
		} catch {
			setIcon(iconEl, "file-text");
		}

		// Info
		const info = item.createDiv("nrp-profile-info");
		const nameEl = info.createEl("span", {
			text: profile.name,
			cls: "nrp-profile-name",
		});
		if (isDefault) {
			nameEl.createEl("span", {
				text: ` ${t("settings.default-badge")}`,
				cls: "nrp-default-badge",
			});
		}
		info.createEl("span", {
			text: profile.description,
			cls: "nrp-profile-desc",
		});

		// Up / down buttons
		const reorder = item.createDiv("nrp-reorder-btns");
		const upBtn = reorder.createEl("button", {
			cls: "clickable-icon",
		});
		setIcon(upBtn, "chevron-up");
		if (isFirst) upBtn.setAttribute("disabled", "true");
		else upBtn.addEventListener("click", () => handlers.onMoveUp());

		const downBtn = reorder.createEl("button", {
			cls: "clickable-icon",
		});
		setIcon(downBtn, "chevron-down");
		if (isLast) downBtn.setAttribute("disabled", "true");
		else downBtn.addEventListener("click", () => handlers.onMoveDown());

		// Action buttons
		const actions = item.createDiv("nrp-profile-actions");

		const defaultBtn = actions.createEl("button", {
			text: isDefault ? t("settings.default-active") : t("settings.set-default"),
			cls: isDefault ? "nrp-btn-default-active" : "",
		});
		if (!isDefault) {
			defaultBtn.addEventListener("click", () => handlers.onSetDefault());
		}

		const editBtn = actions.createEl("button", {
			cls: "clickable-icon",
			attr: { "aria-label": t("settings.edit") },
		});
		setIcon(editBtn, "pencil");
		editBtn.addEventListener("click", () => handlers.onEdit());

		const dupBtn = actions.createEl("button", {
			cls: "clickable-icon",
			attr: { "aria-label": t("settings.duplicate") },
		});
		setIcon(dupBtn, "copy");
		dupBtn.addEventListener("click", () => handlers.onDuplicate());

		const delBtn = actions.createEl("button", {
			cls: "clickable-icon mod-warning",
			attr: { "aria-label": t("settings.delete") },
		});
		setIcon(delBtn, "trash-2");
		if (isOnly) delBtn.setAttribute("disabled", "true");
		else delBtn.addEventListener("click", () => handlers.onDelete());
	}
}
