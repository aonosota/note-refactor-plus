import {
	App,
	Notice,
	PluginSettingTab,
	Setting,
	SettingDefinitionItem,
	SettingGroupItem,
	setIcon,
} from "obsidian";
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

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			this.buildGlobalSettingsGroup(),
			this.buildCompatibilityGroup(),
			this.buildProfileList(),
		];
	}

	// -------------------------------------------------------------------------

	private async persist(): Promise<void> {
		await saveSettings(this.nrpPlugin, this.nrpPlugin.settings);
	}

	private buildGlobalSettingsGroup(): SettingDefinitionItem {
		return {
			type: "group",
			heading: t("settings.global-heading"),
			items: [
				{
					name: t("settings.show-context-menu"),
					desc: t("settings.show-context-menu-desc"),
					control: {
						type: "toggle",
						key: "showContextMenu",
					},
				},
				{
					name: t("settings.context-menu-items"),
					desc: t("settings.context-menu-items-desc"),
					control: {
						type: "slider",
						key: "contextMenuTopN",
						min: 1,
						max: 10,
						step: 1,
					},
				},
			],
		};
	}

	private buildCompatibilityGroup(): SettingDefinitionItem {
		return {
			type: "group",
			heading: t("settings.compat-heading"),
			items: [
				{
					name: t("settings.import-nr"),
					desc: t("settings.import-nr-desc"),
					render: (setting) => {
						setting.addButton((btn) =>
							btn.setButtonText(t("settings.import-nr-btn")).onClick(async () => {
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
								await this.persist();
								registerProfileCommand(this.nrpPlugin, result.profile);
								if (result.templateContent) {
									new Notice(
										t("notice.import-template-note", {
											template: result.templateContent,
										}),
									);
								}
								new Notice(t("notice.import-success"));
								this.update();
							}),
						);
					},
				},
			],
		};
	}

	private buildProfileList(): SettingDefinitionItem {
		const profiles = this.nrpPlugin.settings.profiles;
		return {
			type: "list",
			heading: t("settings.profiles-heading"),
			onReorder: (oldIndex, newIndex) => {
				const [moved] = this.nrpPlugin.settings.profiles.splice(oldIndex, 1);
				this.nrpPlugin.settings.profiles.splice(newIndex, 0, moved);
				void this.persist();
				this.update();
			},
			onDelete: (index) => {
				const list = this.nrpPlugin.settings.profiles;
				if (list.length <= 1) {
					new Notice(t("notice.cannot-delete-last-profile"));
					this.update();
					return;
				}
				const [removed] = list.splice(index, 1);
				if (this.nrpPlugin.settings.defaultProfileId === removed.id) {
					this.nrpPlugin.settings.defaultProfileId = list[0].id;
				}
				removeProfileCommand(this.nrpPlugin, removed.id);
				void this.persist();
				this.update();
			},
			addItem: {
				name: t("settings.add-profile"),
				action: () => {
					const newProfile = createDefaultProfile({
						id: crypto.randomUUID(),
						name: t("settings.new-profile-name"),
						description: "",
					});
					new ProfileEditorModal(this.app, newProfile, true, async (saved) => {
						this.nrpPlugin.settings.profiles.push(saved);
						await this.persist();
						registerProfileCommand(this.nrpPlugin, saved);
						this.update();
					}).open();
				},
			},
			items: profiles.map((profile, index) => this.buildProfileItem(profile, index)),
		};
	}

	private buildProfileItem(profile: ExtractProfile, index: number): SettingGroupItem {
		const isDefault = profile.id === this.nrpPlugin.settings.defaultProfileId;
		return {
			name: profile.name,
			render: (setting: Setting) => {
				setting.nameEl.empty();
				const iconEl = setting.nameEl.createSpan("nrp-profile-icon");
				try {
					setIcon(iconEl, profile.icon || "file-text");
				} catch {
					setIcon(iconEl, "file-text");
				}
				setting.nameEl.createSpan({ text: profile.name });
				if (isDefault) {
					setting.nameEl.createSpan({
						text: ` ${t("settings.default-badge")}`,
						cls: "nrp-default-badge",
					});
				}
				setting.setDesc(profile.description);

				setting.addButton((btn) => {
					btn.setButtonText(
						isDefault ? t("settings.default-active") : t("settings.set-default"),
					);
					if (isDefault) {
						btn.setDisabled(true);
					} else {
						btn.onClick(async () => {
							this.nrpPlugin.settings.defaultProfileId = profile.id;
							await this.persist();
							this.update();
						});
					}
				});

				setting.addExtraButton((btn) =>
					btn
						.setIcon("pencil")
						.setTooltip(t("settings.edit"))
						.onClick(() => {
							new ProfileEditorModal(this.app, profile, false, async (saved) => {
								this.nrpPlugin.settings.profiles[index] = saved;
								await this.persist();
								// addCommand with the same id overwrites the previous
								// registration, so this also picks up a renamed profile.
								registerProfileCommand(this.nrpPlugin, saved);
								this.update();
							}).open();
						}),
				);

				setting.addExtraButton((btn) =>
					btn
						.setIcon("copy")
						.setTooltip(t("settings.duplicate"))
						.onClick(async () => {
							const copy = structuredClone(profile);
							copy.id = crypto.randomUUID();
							copy.name = `${profile.name}${t("settings.copy-suffix")}`;
							this.nrpPlugin.settings.profiles.splice(index + 1, 0, copy);
							await this.persist();
							registerProfileCommand(this.nrpPlugin, copy);
							this.update();
						}),
				);
			},
		};
	}
}
