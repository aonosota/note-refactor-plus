import { App, TFile } from "obsidian";
import { FrontmatterRule } from "../types";

export async function applyFrontmatter(
	app: App,
	file: TFile,
	rule: FrontmatterRule,
	sourceFile: TFile,
): Promise<void> {
	await app.fileManager.processFrontMatter(file, (fm) => {
		if (rule.addSourceRef) {
			fm["source"] = `[[${sourceFile.basename}]]`;
		}
	});
}
