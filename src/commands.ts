import { Plugin, Editor } from "obsidian";
import { NrpSettings, ExtractProfile } from "./types";
import { extractSelection, splitFromCursor } from "./core/extractor";
import { extractHeadingAtCursor, splitByHeadingLevel } from "./core/heading-extractor";
import { ProfileSuggester } from "./ui/profile-suggester";
import {
	getProfileById,
	incrementUsage,
	profilesSortedByUsage,
	saveSettings,
} from "./settings/settings";
import { UndoStack } from "./core/undo-stack";
import { undoLastExtract } from "./core/undo";
import { t } from "./i18n";

export type NrpPlugin = Plugin & {
	settings: NrpSettings;
	undoStack: UndoStack;
};

export function registerCommands(plugin: NrpPlugin): void {
	// --- Selection commands ---

	plugin.addCommand({
		id: "extract-with-profile",
		name: t("cmd.extract-with-profile"),
		editorCallback: (editor: Editor, ctx) => {
			if (!ctx.file) return;
			const sorted = profilesSortedByUsage(plugin.settings);
			if (sorted.length === 0) return;
			new ProfileSuggester(plugin.app, sorted, async (profile) => {
				if (!ctx.file) return;
				incrementUsage(plugin.settings, profile.id);
				await saveSettings(plugin, plugin.settings);
				await extractSelection(plugin.app, profile, editor, ctx.file, plugin.undoStack);
			}).open();
		},
	});

	plugin.addCommand({
		id: "extract-with-default-profile",
		name: t("cmd.extract-with-default-profile"),
		editorCallback: async (editor: Editor, ctx) => {
			if (!ctx.file) return;
			const profile = getProfileById(
				plugin.settings,
				plugin.settings.defaultProfileId,
			);
			if (!profile) return;
			incrementUsage(plugin.settings, profile.id);
			await saveSettings(plugin, plugin.settings);
			await extractSelection(plugin.app, profile, editor, ctx.file, plugin.undoStack);
		},
	});

	// --- Heading commands ---

	plugin.addCommand({
		id: "extract-heading-with-profile",
		name: t("cmd.extract-heading-with-profile"),
		editorCallback: (editor: Editor, ctx) => {
			if (!ctx.file) return;
			const sorted = profilesSortedByUsage(plugin.settings);
			if (sorted.length === 0) return;
			new ProfileSuggester(plugin.app, sorted, async (profile) => {
				if (!ctx.file) return;
				incrementUsage(plugin.settings, profile.id);
				await saveSettings(plugin, plugin.settings);
				await extractHeadingAtCursor(
					plugin.app,
					profile,
					editor,
					ctx.file,
					plugin.undoStack,
				);
			}).open();
		},
	});

	plugin.addCommand({
		id: "extract-heading-with-default-profile",
		name: t("cmd.extract-heading-with-default-profile"),
		editorCallback: async (editor: Editor, ctx) => {
			if (!ctx.file) return;
			const profile = getProfileById(
				plugin.settings,
				plugin.settings.defaultProfileId,
			);
			if (!profile) return;
			incrementUsage(plugin.settings, profile.id);
			await saveSettings(plugin, plugin.settings);
			await extractHeadingAtCursor(plugin.app, profile, editor, ctx.file, plugin.undoStack);
		},
	});

	// --- Bulk split commands ---

	for (const level of [1, 2, 3] as const) {
		plugin.addCommand({
			id: `split-by-heading-${level}`,
			name: t("cmd.split-by-heading", { level: String(level) }),
			editorCallback: (editor: Editor, ctx) => {
				if (!ctx.file) return;
				const sorted = profilesSortedByUsage(plugin.settings);
				if (sorted.length === 0) return;
				new ProfileSuggester(plugin.app, sorted, async (profile) => {
					if (!ctx.file) return;
					incrementUsage(plugin.settings, profile.id);
					await saveSettings(plugin, plugin.settings);
					await splitByHeadingLevel(
						plugin.app,
						profile,
						editor,
						ctx.file,
						level,
						plugin.undoStack,
					);
				}).open();
			},
		});
	}

	// --- Split from cursor commands ---

	plugin.addCommand({
		id: "split-from-cursor",
		name: t("cmd.split-from-cursor"),
		editorCallback: (editor: Editor, ctx) => {
			if (!ctx.file) return;
			const sorted = profilesSortedByUsage(plugin.settings);
			if (sorted.length === 0) return;
			new ProfileSuggester(plugin.app, sorted, async (profile) => {
				if (!ctx.file) return;
				incrementUsage(plugin.settings, profile.id);
				await saveSettings(plugin, plugin.settings);
				await splitFromCursor(plugin.app, profile, editor, ctx.file, plugin.undoStack);
			}).open();
		},
	});

	plugin.addCommand({
		id: "split-from-cursor-default",
		name: t("cmd.split-from-cursor-default"),
		editorCallback: async (editor: Editor, ctx) => {
			if (!ctx.file) return;
			const profile = getProfileById(
				plugin.settings,
				plugin.settings.defaultProfileId,
			);
			if (!profile) return;
			incrementUsage(plugin.settings, profile.id);
			await saveSettings(plugin, plugin.settings);
			await splitFromCursor(plugin.app, profile, editor, ctx.file, plugin.undoStack);
		},
	});

	// --- Undo command ---
	plugin.addCommand({
		id: "undo-last-extract",
		name: t("cmd.undo-last-extract"),
		callback: async () => {
			await undoLastExtract(plugin.app, plugin.undoStack);
		},
	});

	// --- Per-profile commands ---
	syncProfileCommands(plugin);
}

export function syncProfileCommands(plugin: NrpPlugin): void {
	for (const profile of plugin.settings.profiles) {
		registerProfileCommand(plugin, profile);
	}
}

export function registerProfileCommand(
	plugin: NrpPlugin,
	profile: ExtractProfile,
): void {
	plugin.addCommand({
		id: `extract-profile-${profile.id}`,
		name: t("cmd.extract-profile", { name: profile.name }),
		editorCallback: async (editor: Editor, ctx) => {
			if (!ctx.file) return;
			incrementUsage(plugin.settings, profile.id);
			await saveSettings(plugin, plugin.settings);
			await extractSelection(plugin.app, profile, editor, ctx.file, plugin.undoStack);
		},
	});
}

export function removeProfileCommand(plugin: NrpPlugin, profileId: string): void {
	plugin.removeCommand(`extract-profile-${profileId}`);
}
