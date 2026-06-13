export const en = {
	// ── Conflict resolution modal ────────────────────────────────────────────
	"conflict.title": "Note already exists",
	"conflict.desc": "A note named \"{name}.md\" already exists. What would you like to do?",
	"conflict.increment": "Append number",
	"conflict.append": "Append to existing",
	"conflict.cancel": "Cancel",

	// ── Context menu ────────────────────────────────────────────────────────
	"ctx.extract-with": "Extract: {name}",
	"ctx.choose-profile": "Extract: choose profile…",

	// ── Settings tab ─────────────────────────────────────────────────────────
	"settings.global-heading": "Global settings",
	"settings.show-context-menu": "Show context menu",
	"settings.show-context-menu-desc":
		"Add extract options to the editor right-click menu.",
	"settings.context-menu-items": "Context menu items",
	"settings.context-menu-items-desc":
		"Number of profiles shown directly in the context menu.",
	"settings.compat-heading": "Compatibility",
	"settings.import-nr": "Import from Note Refactor",
	"settings.import-nr-desc":
		"Create a new profile from the Note Refactor plugin's saved settings.",
	"settings.import-nr-btn": "Import",
	"settings.profiles-heading": "Profiles",
	"settings.add-profile": "Add profile",
	"settings.new-profile-name": "New Profile",
	"settings.set-default": "Set default",
	"settings.default-active": "✓ Default",
	"settings.default-badge": "default",
	"settings.edit": "Edit",
	"settings.duplicate": "Duplicate",
	"settings.delete": "Delete",
	"settings.copy-suffix": " (copy)",

	// ── Notices ──────────────────────────────────────────────────────────────
	"notice.import-success": "Imported Note Refactor settings as a new profile.",
	"notice.import-not-found":
		"Note Refactor data.json not found. Is the plugin installed?",
	"notice.import-failed": "Failed to import Note Refactor settings.",
	"notice.import-template-note":
		"Note Refactor template: {template} — create a .md file with this content and set it as the Template file in the profile.",
	"notice.extracted-to": "Extracted to {path}",
	"notice.split-to": "Split to {path}",
	"notice.appended-to": "Appended to {path}",
	"notice.split-count": "Split into {count} {notes}.",
	"notice.split-notes-singular": "note",
	"notice.split-notes-plural": "notes",
	"notice.select-text": "Select some text to extract.",
	"notice.no-content-below-cursor": "No content below cursor to split.",
	"notice.no-headings": "No headings found in this note.",
	"notice.cursor-in-heading": "Place the cursor inside a heading section.",
	"notice.no-h-level": "No H{level} headings found in this note.",
	"notice.extract-failed": "Extract failed: {error}",
	"notice.split-failed": "Split failed: {error}",
	"notice.target-not-found": "Target file not found: {path}",
	"notice.profile-name-required": "Profile name is required.",
	"notice.pattern-empty": "Filename pattern cannot be empty.",
	"notice.template-not-found": "Warning: template file not found: {path}",

	// ── Commands ─────────────────────────────────────────────────────────────
	"cmd.extract-with-profile": "Extract selection (choose profile…)",
	"cmd.extract-with-default-profile": "Extract selection (default profile)",
	"cmd.extract-heading-with-profile": "Extract heading (choose profile…)",
	"cmd.extract-heading-with-default-profile":
		"Extract heading (default profile)",
	"cmd.split-by-heading": "Split by H{level} headings (choose profile…)",
	"cmd.split-from-cursor": "Split from cursor (choose profile…)",
	"cmd.split-from-cursor-default": "Split from cursor (default profile)",
	"cmd.undo-last-extract": "Undo last extract",
	"cmd.extract-profile": "Extract: {name}",

	// ── Profile editor — modal titles ────────────────────────────────────────
	"profile.title.new": "New profile",
	"profile.title.edit": "Edit profile",

	// ── Profile editor — section headings ────────────────────────────────────
	"profile.section.basic": "Basic",
	"profile.section.extraction": "Extraction",
	"profile.section.filename": "Filename",
	"profile.section.content-transforms": "Content transforms",
	"profile.section.destination": "Destination folder",
	"profile.section.target": "Target",
	"profile.section.template": "Template & frontmatter",

	// ── Profile editor — basic ────────────────────────────────────────────────
	"profile.name": "Name",
	"profile.name-desc":
		"Required. Shown in the command palette and profile picker.",
	"profile.icon": "Icon",
	"profile.icon-desc": "Lucide icon name — e.g. scissors, file-text, archive",
	"profile.description": "Description",

	// ── Profile editor — extraction ───────────────────────────────────────────
	"profile.extract-mode": "Extract mode",
	"profile.extract-mode.move": "Move (remove from source)",
	"profile.extract-mode.copy": "Copy (keep in source)",
	"profile.source-replacement": "Source replacement",
	"profile.source-replacement-desc":
		"What replaces the extracted text in the source note. Ignored when Note link template is set.",
	"profile.source-replacement.link": "Link",
	"profile.source-replacement.embed": "Embed",
	"profile.source-replacement.none": "Nothing",
	"profile.source-replacement.keep-and-append-link":
		"Keep text and append link",
	"profile.note-link-template": "Note link template",
	"profile.note-link-template-desc":
		"Custom template for what is left in the source note after extraction. When set, overrides Source replacement — including when Extract mode is Copy. Variables: {{title}}, {{source_link}} (link to new note), {{content}}, {{date:YYYYMMDD}}. Leave empty to use Source replacement.",
	"profile.note-link-template-placeholder": "[[{{title}}]]  or leave empty",
	"profile.after-extract": "After extract",
	"profile.after-extract.open": "Open new note",
	"profile.after-extract.open-new-tab": "Open in new tab",
	"profile.after-extract.open-new-pane": "Open in new pane",
	"profile.after-extract.none": "Do nothing",
	"profile.conflict-policy": "Conflict policy",
	"profile.conflict-policy-desc":
		"What to do when a note with the same name already exists.",
	"profile.conflict-policy.increment": "Append number (note 2, note 3…)",
	"profile.conflict-policy.append": "Append to existing note",
	"profile.conflict-policy.ask": "Ask each time",

	// ── Profile editor — filename ─────────────────────────────────────────────
	"profile.filename-rule": "Filename rule",
	"profile.filename-rule.first-line": "First line of content",
	"profile.filename-rule.prompt": "Prompt at runtime",
	"profile.filename-rule.pattern": "Pattern",
	"profile.pattern": "Pattern",
	"profile.pattern-desc":
		"Variables: {{title}}, {{date:YYYYMMDD}}, {{time:HHmm}}",
	"profile.pattern-placeholder": "{{date:YYYYMMDD}}-{{title}}",

	// ── Profile editor — content transforms ──────────────────────────────────
	"profile.exclude-first-line": "Exclude first line",
	"profile.exclude-first-line-desc":
		"Remove the first line from the extracted note content. Most useful with 'First line' filename rule so the title is not duplicated.",
	"profile.first-line-as-heading": "Include first line as heading",
	"profile.first-line-as-heading-desc":
		"Format the first line (original, before exclusion) as a Markdown heading in the new note. Enable 'Exclude first line' together to avoid duplicating the first line in the body.",
	"profile.first-line-as-heading.none": "None",
	"profile.first-line-as-heading.h1": "H1 (#)",
	"profile.first-line-as-heading.h2": "H2 (##)",
	"profile.first-line-as-heading.h3": "H3 (###)",
	"profile.normalize-headings": "Normalize heading levels",
	"profile.normalize-headings-desc":
		"Promote heading levels in the extracted note so the shallowest heading becomes H1. E.g. if the content starts with ##, it becomes # and all sub-headings shift accordingly.",

	// ── Profile editor — destination ──────────────────────────────────────────
	"profile.destination": "Destination",
	"profile.destination.same-as-source": "Same folder as source note",
	"profile.destination.fixed": "Fixed folder",
	"profile.folder-path": "Folder path",
	"profile.folder-path-desc":
		"Path relative to vault root. Leave empty for vault root.",
	"profile.folder-path-placeholder": "folder/subfolder",

	// ── Profile editor — target ───────────────────────────────────────────────
	"profile.target": "Target",
	"profile.target.new-note": "New note",
	"profile.target.append-existing": "Append to existing note",
	"profile.target-file": "Target file",
	"profile.target-file-desc": "Leave empty to prompt at runtime.",
	"profile.target-file-placeholder": "notes/my-note.md",
	"profile.append-position": "Append position",
	"profile.append-position.end": "End of file",
	"profile.append-position.under-heading": "Under heading",
	"profile.heading-name": "Heading name",
	"profile.heading-name-desc": "Exact heading text (without # prefix).",

	// ── Profile editor — template & frontmatter ───────────────────────────────
	"profile.template-file": "Template file",
	"profile.template-file-desc":
		"Leave empty to use plain extraction (content only). Variables: {{content}}, {{title}}, {{source_link}}, {{date:YYYYMMDD}}",
	"profile.template-file-placeholder": "templates/extract.md",
	"profile.run-templater": "Run Templater after creation",
	"profile.run-templater-desc": "Requires the Templater plugin.",
	// ── Profile editor — actions ──────────────────────────────────────────────
	"profile.action.preview": "Preview",
	"profile.action.cancel": "Cancel",
	"profile.action.save": "Save",

	// ── Preview modal ─────────────────────────────────────────────────────────
	"preview.title": "Extract preview",
	"preview.filename-label": "Filename",
	"preview.content-label": "Content",
	"preview.filename-prompt-suffix": " ← prompted at runtime",
} as const;

/** Union of all valid i18n keys. */
export type StringKey = keyof typeof en;
