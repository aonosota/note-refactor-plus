**English** | [日本語](README.ja.md)

# Note Refactor Plus

Extract selected text or entire heading sections into new notes — using configurable **profiles** that control filename rules, destination folders, template files, frontmatter, and more.

## Features

- **Selection extraction** — extract highlighted text into a new note
- **Heading extraction** — extract the section under the cursor's heading
- **Bulk split by heading level** — split an entire note at every H1, H2, or H3
- **Split from cursor** — move everything from the cursor position to the end of the note into a new note
- **Multiple profiles** — each profile is a preset combining all extraction settings; switch between them per operation
- **Command palette and hotkeys** — a command is registered for each profile so you can assign hotkeys
- **Editor context menu** — right-click to extract with a profile directly from the editor
- **Undo last extract** — one-step undo that restores the source note and deletes the created file
- **Templater integration** — optionally run Templater on the new note right after creation
- **Note Refactor import** — import your existing Note Refactor settings as a starting profile
- **Bilingual UI** — English and Japanese (follows Obsidian's locale setting)

## Requirements

- Obsidian **1.13.1** or later
- Desktop and mobile supported

## Getting started

1. Install the plugin through the Obsidian community plugin browser (or copy the release files into `.obsidian/plugins/note-refactor-plus/`).
2. Enable the plugin in **Settings → Community plugins**.
3. Open **Settings → Note Refactor Plus** and configure at least one profile.
4. Select some text in a note, open the command palette, and run **Extract selection (choose profile…)**.

## Commands

| Command | Description |
|---|---|
| Extract selection (choose profile…) | Opens a profile picker, then extracts the selection |
| Extract selection (default profile) | Extracts the selection using the default profile |
| Extract heading (choose profile…) | Extracts the heading section at the cursor |
| Extract heading (default profile) | Same, using the default profile |
| Split by H1/H2/H3 headings (choose profile…) | Splits the whole note at every heading of the given level |
| Split from cursor (choose profile…) | Moves from the cursor to the end of the note into a new note |
| Split from cursor (default profile) | Same, using the default profile |
| Extract: {profile name} | One command per profile for direct hotkey assignment |
| Undo last extract | Restores the source note and deletes the most recently created file |

## Profile settings

Each profile configures the following:

### Basic

| Setting | Description |
|---|---|
| Name | Displayed in the command palette and profile picker |
| Icon | [Lucide](https://lucide.dev) icon name (e.g. `scissors`, `file-text`) |
| Description | Optional subtitle shown in the picker |

### Extraction

| Setting | Values | Description |
|---|---|---|
| Extract mode | Move / Copy | Move removes the text from the source; Copy keeps it |
| Source replacement | Link / Embed / Nothing / Keep and append link | What replaces the extracted text in the source note |
| Note link template | Template string | Custom replacement for the source note. Overrides Source replacement when set. Variables: `{{title}}`, `{{source_link}}`, `{{content}}`, `{{date:YYYYMMDD}}` |
| After extract | Open / Open in new tab / Open in new pane / Do nothing | What happens to the new note after creation |
| Conflict policy | Append number / Append to existing / Ask | How to handle a filename collision |

### Filename

| Setting | Values | Description |
|---|---|---|
| Filename rule | First line / Prompt / Pattern | How the new note's filename is determined |
| Pattern | Template string | Used when rule is Pattern. Variables: `{{title}}`, `{{date:YYYYMMDD}}`, `{{time:HHmm}}` |

### Content transforms

| Setting | Description |
|---|---|
| Exclude first line | Removes the first line from the extracted content. Useful with the First line filename rule to avoid duplicating the title. |
| Include first line as heading | Prepends the original first line as a Markdown heading (H1, H2, or H3) in the new note. Best combined with Exclude first line. |
| Normalize heading levels | Promotes all heading levels in the extracted content so the shallowest heading becomes H1. |

### Destination folder

| Setting | Values | Description |
|---|---|---|
| Destination | Same as source / Fixed folder | Where the new note is saved |
| Folder path | Vault-relative path | Used when Destination is Fixed folder. Empty = vault root. |

### Target

| Setting | Values | Description |
|---|---|---|
| Target | New note / Append to existing note | Create a new file or append to one that already exists |
| Target file | Vault-relative path | The file to append to. Empty = prompt at runtime. |
| Append position | End of file / Under heading | Where in the target file the content is appended |
| Heading name | Exact heading text | Required when Append position is Under heading |

### Template & frontmatter

| Setting | Description |
|---|---|
| Template file | Path to a `.md` file used as the body template for the new note. Leave empty for plain content extraction. |
| Run Templater after creation | Passes the new note through the [Templater](https://github.com/SilentVoid13/Templater) plugin immediately after creation. Requires Templater to be installed and enabled. |

> To add frontmatter properties (tags, source reference, custom keys) to extracted notes, include a YAML front matter block in your template file.

## Template variables

The following variables can be used in template files and Note link template:

| Variable | Description |
|---|---|
| `{{content}}` | The extracted text |
| `{{title}}` / `{{new_note_title}}` | The new note's filename (without extension) |
| `{{source_link}}` | A Markdown link to the source note (respects vault link format) |
| `{{source_title}}` | The source note's filename without extension |
| `{{source_path}}` | The source note's full vault-relative path |
| `{{heading}}` | The nearest heading above the cursor (for selection extractions) |
| `{{date:FORMAT}}` | Current date. FORMAT uses `YYYY`, `MM`, `DD` tokens. Example: `{{date:YYYYMMDD}}` |
| `{{time:FORMAT}}` | Current time. FORMAT uses `HH`, `mm`, `ss` tokens. Example: `{{time:HHmm}}` |

## Context menu

When **Show context menu** is enabled in global settings, right-clicking in the editor shows extract options directly. The top N most-used profiles appear as direct items; if you have more profiles than N, a "choose profile…" item appears at the bottom.

The **Context menu items** slider controls N (default: 3).

## Importing from Note Refactor

If you were using the [Note Refactor](https://github.com/lynchjames/note-refactor-obsidian) plugin, you can import its settings as a starting profile:

1. Make sure Note Refactor is installed (it does not need to be enabled).
2. Open **Settings → Note Refactor Plus → Compatibility**.
3. Click **Import**.

The importer reads Note Refactor's `data.json` and creates a new profile with equivalent settings. If Note Refactor had an inline note template (not a template file), the content is shown in a notice so you can create a `.md` file and assign it as the Template file in the new profile.

## CSS classes

All CSS classes used by this plugin are prefixed with `nrp-`. You can override them with a CSS snippet.

| Class | Element |
|---|---|
| `.nrp-profile-list` | Container for the profile list in settings |
| `.nrp-profile-item` | Individual profile row |
| `.nrp-profile-item.nrp-dragging` | Profile row being dragged |
| `.nrp-profile-item.nrp-drag-over` | Profile row that is the drop target |
| `.nrp-drag-handle` | Drag handle icon on the left of each profile row |
| `.nrp-profile-icon` | Profile icon |
| `.nrp-profile-info` | Name + description container |
| `.nrp-profile-name` | Profile name text |
| `.nrp-profile-desc` | Profile description text |
| `.nrp-default-badge` | "default" badge shown on the default profile |
| `.nrp-reorder-btns` | Up/down button container |
| `.nrp-profile-actions` | Action buttons container (set default, edit, duplicate, delete) |
| `.nrp-btn-default-active` | "Default" button when the profile is already default |
| `.nrp-profile-editor-modal` | Profile editor modal |
| `.nrp-section-heading` | Section headings inside the profile editor |
| `.nrp-icon-preview` | Live icon preview next to the icon name input |
| `.nrp-setting-group` | Indented group of related settings (e.g. append-to-existing details) |
| `.nrp-editor-actions` | Bottom action bar (Preview / Cancel / Save) |
| `.nrp-preview-modal` | Template preview modal |
| `.nrp-preview-label` | Section label inside the preview modal |
| `.nrp-preview-filename` | Filename preview block |
| `.nrp-preview-body` | Note body preview block |

## License

MIT
