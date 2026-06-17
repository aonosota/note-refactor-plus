import { App, TFile } from "obsidian";

export interface TemplateContext {
	content: string;
	title: string;
	sourceLink: string;
	sourceTitle: string;
	sourcePath: string;
	heading: string;
}

/**
 * Variable token: {{name}} or {{name:format}}
 * Supported names: content, title, new_note_title, source_link, source_title,
 *                  source_path, date, time, heading
 */
const TOKEN_RE = /\{\{(\w+)(?::([^}]*))?\}\}/g;

export function expandVariables(
	template: string,
	ctx: TemplateContext,
	now = new Date(),
): string {
	return template.replace(TOKEN_RE, (_match, name: string, format?: string) => {
		switch (name) {
			case "content":
				return ctx.content;
			case "title":
			case "new_note_title":
				return ctx.title;
			case "source_link":
				return ctx.sourceLink;
			case "source_title":
				return ctx.sourceTitle;
			case "source_path":
				return ctx.sourcePath;
			case "heading":
				return ctx.heading;
			case "date":
				return formatDate(now, format ?? "YYYY-MM-DD");
			case "time":
				return formatDate(now, format ?? "HH:mm");
			default:
				return _match;
		}
	});
}

/**
 * Reads the template file from the vault and expands variables.
 * Falls back to plain `{{content}}` if templatePath is empty.
 *
 * If the template contains no `{{content}}` placeholder the extracted text is
 * appended after the template body so it is never silently discarded.
 */
export async function applyTemplate(
	app: App,
	templatePath: string,
	ctx: TemplateContext,
): Promise<string> {
	if (!templatePath) {
		return ctx.content;
	}
	const file = app.vault.getAbstractFileByPath(templatePath);
	if (!(file instanceof TFile)) {
		throw new Error(`Template file not found: ${templatePath}`);
	}
	const raw = await app.vault.read(file);
	const expanded = expandVariables(raw, ctx);

	if (!raw.includes("{{content}}") && ctx.content) {
		return expanded.trimEnd() + "\n\n" + ctx.content;
	}

	return expanded;
}

/**
 * Minimal date formatter supporting: YYYY MM DD HH mm ss
 */
function formatDate(d: Date, fmt: string): string {
	return fmt
		.replace("YYYY", String(d.getFullYear()))
		.replace("MM", pad(d.getMonth() + 1))
		.replace("DD", pad(d.getDate()))
		.replace("HH", pad(d.getHours()))
		.replace("mm", pad(d.getMinutes()))
		.replace("ss", pad(d.getSeconds()));
}

function pad(n: number): string {
	return String(n).padStart(2, "0");
}
