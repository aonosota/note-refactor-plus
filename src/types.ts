export type DestinationRule =
	| { mode: "fixed"; path: string }
	| { mode: "same-as-source" }
	| { mode: "prompt" };

export type FilenameRule =
	| { mode: "first-line" }
	| { mode: "prompt" }
	| { mode: "pattern"; pattern: string };

export type SourceReplacement =
	| "link"
	| "embed"
	| "none"
	| "keep-and-append-link";

export type ExtractMode = "move" | "copy";

export type AfterExtract = "open" | "open-new-tab" | "open-new-pane" | "none";

export type ConflictPolicy = "increment" | "append" | "ask";

export type TargetRule =
	| { mode: "new-note" }
	| {
			mode: "append-existing";
			/** Vault path of the target file. Empty string = prompt at runtime. */
			targetPath: string;
			position: "end" | "under-heading";
			/** Required when position is "under-heading". */
			headingName: string;
	  };

export interface FrontmatterRule {
	addSourceRef: boolean;
}

export interface ExtractProfile {
	id: string;
	name: string;
	icon: string;
	description: string;
	/** Path to a .md template file in the vault. Empty string = plain {{content}} extraction. */
	templatePath: string;
	destination: DestinationRule;
	filenameRule: FilenameRule;
	sourceReplacement: SourceReplacement;
	/** When non-empty, overrides sourceReplacement. Variables: {{title}}, {{link}}, {{content}}, {{date}}. */
	noteLinkTemplate: string;
	extractMode: ExtractMode;
	afterExtract: AfterExtract;
	frontmatter: FrontmatterRule;
	target: TargetRule;
	conflictPolicy: ConflictPolicy;
	runTemplaterAfter: boolean;
	/** Remove the first line from the extracted note content. */
	excludeFirstLine: boolean;
	/** Format the first line as a heading in the extracted note. */
	firstLineAsHeading: "none" | "h1" | "h2" | "h3";
	/** Promote heading levels so the highest heading becomes H1. */
	normalizeHeadings: boolean;
}

export interface NrpSettings {
	profiles: ExtractProfile[];
	defaultProfileId: string;
	showContextMenu: boolean;
	contextMenuTopN: number;
	usageCount: Record<string, number>;
	settingsVersion: number;
}
