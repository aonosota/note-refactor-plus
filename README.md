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

- Obsidian **1.11.0** or later
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
| After extract | Open / Open in new pane / Do nothing | What happens to the new note after creation |
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

---

# Note Refactor Plus — 日本語ドキュメント

選択範囲や見出しセクションを新規ノートに抽出するプラグインです。**プロファイル**（テンプレート・フォルダ・ファイル名ルール・リンク形式などの設定セット）を複数作成して切り替えて使えます。

## 主な機能

- **選択範囲抽出** — ハイライトしたテキストを新規ノートに切り出す
- **見出し抽出** — カーソルのある見出しセクションをまとめて切り出す
- **見出しレベル一括分割** — ノート全体を H1/H2/H3 で一括分割
- **カーソル以降分割** — カーソル位置から末尾までを新規ノートに分割
- **複数プロファイル** — プロファイルごとに異なるフォルダ・テンプレート・ファイル名ルールを設定
- **コマンドパレット / ホットキー** — プロファイルごとにコマンドが登録され、個別にホットキーを割り当て可能
- **エディタコンテキストメニュー** — 右クリックから直接抽出プロファイルを選択
- **抽出の取り消し** — 最後の抽出を1ステップで元に戻す（ソースノートを復元＋作成ファイルを削除）
- **Templater 連携** — 新規ノート作成直後に Templater を実行
- **Note Refactor インポート** — 既存の Note Refactor 設定を1クリックでプロファイルに変換
- **日英 UI** — Obsidian のロケール設定に従い自動で日本語/英語を切り替え

## 動作要件

- Obsidian **1.11.0** 以上
- デスクトップ・モバイルの両方に対応

## はじめに

1. Obsidian コミュニティプラグインブラウザからインストール（または `.obsidian/plugins/note-refactor-plus/` にリリースファイルをコピー）。
2. **設定 → コミュニティプラグイン** でプラグインを有効化。
3. **設定 → Note Refactor Plus** でプロファイルを設定。
4. ノートでテキストを選択し、コマンドパレットから **「選択範囲を抽出（プロファイルを選択…）」** を実行。

## コマンド一覧

| コマンド | 説明 |
|---|---|
| 選択範囲を抽出（プロファイルを選択…） | プロファイル選択画面を開いてから選択範囲を抽出 |
| 選択範囲を抽出（デフォルトプロファイル） | デフォルトプロファイルで選択範囲を抽出 |
| 見出しを抽出（プロファイルを選択…） | カーソル位置の見出しセクションを抽出 |
| 見出しを抽出（デフォルトプロファイル） | デフォルトプロファイルで見出しセクションを抽出 |
| H1/H2/H3 見出しで分割（プロファイルを選択…） | 指定レベルの全見出しでノートを一括分割 |
| カーソル以降を分割（プロファイルを選択…） | カーソル以降を新規ノートに分割 |
| カーソル以降を分割（デフォルトプロファイル） | デフォルトプロファイルで分割 |
| 抽出: {プロファイル名} | プロファイルごとの直接実行コマンド（ホットキー割り当て可） |
| 最後の抽出を元に戻す | ソースノートを復元し最後に作成したファイルを削除 |

## プロファイル設定

### 基本設定

| 項目 | 説明 |
|---|---|
| 名前 | コマンドパレットおよびプロファイル選択画面に表示 |
| アイコン | [Lucide](https://lucide.dev) アイコン名（例: `scissors`, `file-text`） |
| 説明 | 選択画面のサブタイトルとして表示 |

### 抽出

| 項目 | 選択肢 | 説明 |
|---|---|---|
| 抽出モード | 移動 / コピー | 移動はソースからテキストを削除、コピーは残す |
| ソース置換 | リンク / 埋め込み / なし / テキストを残してリンク追記 | 抽出後にソースノートの該当箇所をどう置き換えるか |
| Note link テンプレート | テンプレート文字列 | ソースノートに残すテキストのカスタムテンプレート。設定するとソース置換より優先。変数: `{{title}}`, `{{source_link}}`, `{{content}}`, `{{date:YYYYMMDD}}` |
| 抽出後の動作 | 開く / 新しいタブで開く / 新しいペインで開く / 何もしない | 新規ノート作成後の動作 |
| 競合ポリシー | 番号付加 / 既存ノートに追記 / 毎回確認 | 同名ノートが存在する場合の処理 |

### ファイル名

| 項目 | 説明 |
|---|---|
| ファイル名ルール | コンテンツの1行目 / 実行時に入力 / パターン |
| パターン | 変数: `{{title}}`, `{{date:YYYYMMDD}}`, `{{time:HHmm}}` |

### コンテンツ変換

| 項目 | 説明 |
|---|---|
| 1行目を除外 | 抽出ノートの本文から1行目を取り除く（ファイル名ルール「1行目」との組み合わせでタイトル重複を防止） |
| 1行目を見出しとして付与 | 元の1行目を H1/H2/H3 見出しとして先頭に付与（「1行目を除外」との併用を推奨） |
| 見出しレベルを正規化 | 最も浅い見出しが H1 になるよう全見出しを昇格 |

### 保存先フォルダ

| 項目 | 説明 |
|---|---|
| 保存先 | ソースノートと同じフォルダ / 固定フォルダ |
| フォルダパス | 固定フォルダ選択時に指定（Vault ルートからの相対パス） |

### ターゲット

| 項目 | 説明 |
|---|---|
| ターゲット | 新規ノート / 既存ノートに追記 |
| 対象ファイル | 追記先のファイル（空欄で実行時に選択） |
| 追記位置 | ファイルの末尾 / 見出しの配下 |
| 見出し名 | 「見出しの配下」選択時に指定する見出しテキスト |

### テンプレートと Frontmatter

| 項目 | 説明 |
|---|---|
| テンプレートファイル | 新規ノートの本文に使う `.md` テンプレートファイル（空欄でコンテンツのみ） |
| 作成後に Templater を実行 | 新規ノート作成直後に [Templater](https://github.com/SilentVoid13/Templater) を実行（Templater プラグインが必要） |

> Frontmatter プロパティ（タグ・ソース参照・カスタムキーなど）を追加したい場合は、テンプレートファイルに YAML frontmatter ブロックを記述してください。

## テンプレート変数

テンプレートファイルおよび Note link テンプレートで使用できる変数:

| 変数 | 説明 |
|---|---|
| `{{content}}` | 抽出されたテキスト |
| `{{title}}` / `{{new_note_title}}` | 新規ノートのファイル名（拡張子なし） |
| `{{source_link}}` | ソースノートへの Markdown リンク（Vault のリンク形式設定に従う） |
| `{{source_title}}` | ソースノートのファイル名（拡張子なし） |
| `{{source_path}}` | ソースノートの Vault 内フルパス |
| `{{heading}}` | カーソル直近の見出し（選択抽出時） |
| `{{date:FORMAT}}` | 現在の日付。FORMAT: `YYYY`, `MM`, `DD`。例: `{{date:YYYYMMDD}}` |
| `{{time:FORMAT}}` | 現在の時刻。FORMAT: `HH`, `mm`, `ss`。例: `{{time:HHmm}}` |

## コンテキストメニュー

グローバル設定の **「コンテキストメニューを表示」** を有効にすると、エディタの右クリックメニューに抽出オプションが追加されます。使用頻度上位 N 件のプロファイルが直接表示され、N 件を超えるプロファイルがある場合は「プロファイルを選択…」項目が末尾に追加されます。

**「コンテキストメニューの表示件数」** スライダーで N を変更できます（デフォルト: 3）。

## Note Refactor からのインポート

[Note Refactor](https://github.com/lynchjames/note-refactor-obsidian) を使用していた場合、1クリックで設定を移行できます:

1. Note Refactor がインストールされていることを確認（有効化は不要）。
2. **設定 → Note Refactor Plus → 互換性** を開く。
3. **「インポート」** をクリック。

Note Refactor の `data.json` を読み込み、対応するプロファイルが新規作成されます。インラインテンプレートが設定されていた場合は、その内容が Notice で表示されるので、`.md` ファイルに保存してテンプレートファイルに設定してください。
