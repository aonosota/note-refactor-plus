import { NrpSettings, ExtractProfile } from "../types";
import { createDefaultProfile } from "./defaults";

export const SETTINGS_VERSION = 1;

export function buildDefaultSettings(): NrpSettings {
	const defaultProfile = createDefaultProfile({ id: "default" });
	return {
		profiles: [defaultProfile],
		defaultProfileId: "default",
		showContextMenu: true,
		contextMenuTopN: 3,
		usageCount: {},
		settingsVersion: SETTINGS_VERSION,
	};
}

export async function loadSettings(
	plugin: { loadData(): Promise<unknown> },
): Promise<NrpSettings> {
	const saved = (await plugin.loadData()) as Partial<NrpSettings> | null;
	if (!saved) {
		return buildDefaultSettings();
	}
	const defaults = buildDefaultSettings();
	const merged = { ...defaults, ...saved };
	// Migrate individual profiles: ensure new fields get default values.
	merged.profiles = (saved.profiles ?? defaults.profiles).map((p) => ({
		...createDefaultProfile(),
		...(p as Partial<ExtractProfile>),
	}));
	return merged;
}

export async function saveSettings(
	plugin: { saveData(data: unknown): Promise<void> },
	settings: NrpSettings,
): Promise<void> {
	await plugin.saveData(settings);
}

export function getProfileById(
	settings: NrpSettings,
	id: string,
): ExtractProfile | undefined {
	return settings.profiles.find((p) => p.id === id);
}

export function incrementUsage(settings: NrpSettings, profileId: string): void {
	settings.usageCount[profileId] = (settings.usageCount[profileId] ?? 0) + 1;
}

export function profilesSortedByUsage(settings: NrpSettings): ExtractProfile[] {
	return [...settings.profiles].sort(
		(a, b) =>
			(settings.usageCount[b.id] ?? 0) - (settings.usageCount[a.id] ?? 0),
	);
}
