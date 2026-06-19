import { Editor, MarkdownFileInfo, MarkdownView, Menu } from "obsidian";
import { NrpPlugin } from "../commands";
import {
	profilesSortedByUsage,
	incrementUsage,
	saveSettings,
} from "../settings/settings";
import { extractSelection } from "../core/extractor";
import { ProfileSuggester } from "./profile-suggester";
import { t } from "../i18n";

export function registerContextMenu(plugin: NrpPlugin): void {
	plugin.registerEvent(
		plugin.app.workspace.on(
			"editor-menu",
			(menu: Menu, editor: Editor, info: MarkdownView | MarkdownFileInfo) => {
				if (!plugin.settings.showContextMenu) return;

				const file = info.file;
				if (!file) return;

				const sorted = profilesSortedByUsage(plugin.settings);
				if (sorted.length === 0) return;

				menu.addSeparator();

				const topN = sorted.slice(0, plugin.settings.contextMenuTopN);
				for (const profile of topN) {
					menu.addItem((item) => {
						item
							.setTitle(t("ctx.extract-with", { name: profile.name }))
							.setIcon(profile.icon || "scissors")
							.onClick(async () => {
								incrementUsage(plugin.settings, profile.id);
								await saveSettings(plugin, plugin.settings);
								await extractSelection(
									plugin.app,
									profile,
									editor,
									file,
									plugin.undoStack,
								);
							});
					});
				}

				if (sorted.length > plugin.settings.contextMenuTopN) {
					menu.addItem((item) => {
						item
							.setTitle(t("ctx.choose-profile"))
							.setIcon("list")
							.onClick(() => {
								new ProfileSuggester(
									plugin.app,
									sorted,
									async (profile) => {
										incrementUsage(plugin.settings, profile.id);
										await saveSettings(plugin, plugin.settings);
										await extractSelection(
											plugin.app,
											profile,
											editor,
											file,
											plugin.undoStack,
										);
									},
								).open();
							});
					});
				}
			},
		),
	);
}
