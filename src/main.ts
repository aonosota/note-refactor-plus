import { Plugin } from "obsidian";
import { NrpSettings } from "./types";
import { loadSettings, saveSettings } from "./settings/settings";
import { registerCommands } from "./commands";
import { UndoStack } from "./core/undo-stack";
import { NrpSettingsTab } from "./settings/settings-tab";
import { registerContextMenu } from "./ui/context-menu";

export default class NoteRefactorPlusPlugin extends Plugin {
	settings!: NrpSettings;
	undoStack = new UndoStack();

	async onload(): Promise<void> {
		this.settings = await loadSettings(this);
		registerCommands(this);
		registerContextMenu(this);
		this.addSettingTab(new NrpSettingsTab(this.app, this));
	}

	onunload(): void {
		void saveSettings(this, this.settings);
	}
}
