import { ExtractProfile } from "../types";

export function createDefaultProfile(
	partial?: Partial<ExtractProfile>,
): ExtractProfile {
	return {
		id: "default",
		name: "Default",
		icon: "scissors",
		description: "Plain extraction into the same folder as the source note.",
		templatePath: "",
		destination: { mode: "same-as-source" },
		filenameRule: { mode: "first-line" },
		sourceReplacement: "link",
		extractMode: "move",
		afterExtract: "open",
		frontmatter: { addSourceRef: false },
		target: { mode: "new-note" },
		conflictPolicy: "increment",
		runTemplaterAfter: false,
		noteLinkTemplate: "",
		excludeFirstLine: false,
		firstLineAsHeading: "none",
		normalizeHeadings: false,
		...partial,
	};
}
