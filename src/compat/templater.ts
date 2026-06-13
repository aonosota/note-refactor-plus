import { App, TFile } from "obsidian";

interface TemplaterInternals {
	templater?: {
		overwrite_file_commands(file: TFile): Promise<void>;
	};
}

export function isTemplaterAvailable(app: App): boolean {
	const plugins = (app as unknown as { plugins?: { plugins?: Record<string, unknown> } })
		.plugins?.plugins;
	return plugins != null && "templater-obsidian" in plugins;
}

export async function runTemplaterOnFile(app: App, file: TFile): Promise<void> {
	try {
		const plugins = (
			app as unknown as { plugins?: { plugins?: Record<string, TemplaterInternals> } }
		).plugins?.plugins;
		const templater = plugins?.["templater-obsidian"];
		if (typeof templater?.templater?.overwrite_file_commands === "function") {
			await templater.templater.overwrite_file_commands(file);
		}
	} catch {
		// Templater integration is best-effort; silently continue on failure
	}
}
