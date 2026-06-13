import { ExtractProfile } from "../types";
import { expandVariables, TemplateContext } from "./template";

/**
 * Builds the text that replaces the extracted selection in the source note.
 *
 * Priority:
 *  1. If profile.noteLinkTemplate is non-empty, expand it as a template.
 *     This always takes precedence — including when extractMode is "copy".
 *     Available variables: {{title}} / {{new_note_title}}, {{source_link}}
 *     (link to the new note), {{content}} / {{new_note_content}},
 *     {{date:YYYYMMDD}}, {{time:HHmm}}.
 *  2. Otherwise fall back to the sourceReplacement enum.
 */
export function buildSourceReplacement(
	profile: ExtractProfile,
	link: string,
	original: string,
	title: string,
): string {
	if (profile.noteLinkTemplate) {
		const ctx: TemplateContext = {
			content: original,
			title,
			sourceLink: link, // {{source_link}} = the generated link to the new note
			sourceTitle: "",
			sourcePath: "",
			heading: "",
		};
		return expandVariables(profile.noteLinkTemplate, ctx);
	}

	if (profile.extractMode === "copy") {
		return profile.sourceReplacement === "keep-and-append-link"
			? `${original}\n\n${link}`
			: original;
	}
	switch (profile.sourceReplacement) {
		case "link":
			return link;
		case "embed":
			return `!${link}`;
		case "none":
			return "";
		case "keep-and-append-link":
			return `${original}\n\n${link}`;
	}
}
