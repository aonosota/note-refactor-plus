import type { StringKey } from "./en";

export const ja: Partial<Record<StringKey, string>> = {
	// ── Context menu ────────────────────────────────────────────────────────
	"ctx.extract-with": "抽出: {name}",
	"ctx.choose-profile": "抽出: プロファイルを選択…",

	// ── Settings tab ─────────────────────────────────────────────────────────
	"settings.global-heading": "グローバル設定",
	"settings.show-context-menu": "コンテキストメニューを表示",
	"settings.show-context-menu-desc":
		"エディタの右クリックメニューに抽出オプションを追加します。",
	"settings.context-menu-items": "コンテキストメニューの表示件数",
	"settings.context-menu-items-desc":
		"コンテキストメニューに直接表示するプロファイルの最大件数。",
	"settings.compat-heading": "互換性",
	"settings.import-nr": "Note Refactor からインポート",
	"settings.import-nr-desc":
		"Note Refactor プラグインの保存済み設定から新規プロファイルを作成します。",
	"settings.import-nr-btn": "インポート",
	"settings.profiles-heading": "プロファイル",
	"settings.add-profile": "プロファイルを追加",
	"settings.new-profile-name": "新しいプロファイル",
	"settings.set-default": "デフォルトに設定",
	"settings.default-active": "✓ デフォルト",
	"settings.default-badge": "デフォルト",
	"settings.edit": "編集",
	"settings.duplicate": "複製",
	"settings.delete": "削除",
	"settings.copy-suffix": " (コピー)",

	// ── Notices ──────────────────────────────────────────────────────────────
	"notice.import-success":
		"Note Refactor の設定をプロファイルとしてインポートしました。",
	"notice.import-not-found":
		"Note Refactor の data.json が見つかりません。プラグインがインストールされているか確認してください。",
	"notice.import-failed": "Note Refactor 設定のインポートに失敗しました。",
	"notice.import-template-note":
		"Note Refactor のテンプレート: {template} — この内容で .md ファイルを作成し、プロファイルの「テンプレートファイル」に設定してください。",
	"notice.extracted-to": "{path} に抽出しました",
	"notice.split-to": "{path} に分割しました",
	"notice.appended-to": "{path} に追記しました",
	"notice.split-count": "{count} 件のノートに分割しました。",
	"notice.split-notes-singular": "件",
	"notice.split-notes-plural": "件",
	"notice.select-text": "抽出するテキストを選択してください。",
	"notice.no-content-below-cursor": "カーソル以降に分割するコンテンツがありません。",
	"notice.no-headings": "このノートに見出しが見つかりません。",
	"notice.cursor-in-heading": "見出しセクション内にカーソルを置いてください。",
	"notice.no-h-level": "このノートに H{level} の見出しが見つかりません。",
	"notice.extract-failed": "抽出に失敗しました: {error}",
	"notice.split-failed": "分割に失敗しました: {error}",
	"notice.target-not-found": "対象ファイルが見つかりません: {path}",
	"notice.destination-not-implemented":
		"実行時プロンプトによる保存先指定は未実装です。",
	"notice.profile-name-required": "プロファイル名は必須です。",
	"notice.pattern-empty": "ファイル名パターンを入力してください。",
	"notice.template-not-found":
		"警告: テンプレートファイルが見つかりません: {path}",

	// ── Commands ─────────────────────────────────────────────────────────────
	"cmd.extract-with-profile": "選択範囲を抽出（プロファイルを選択…）",
	"cmd.extract-with-default-profile": "選択範囲を抽出（デフォルトプロファイル）",
	"cmd.extract-heading-with-profile": "見出しを抽出（プロファイルを選択…）",
	"cmd.extract-heading-with-default-profile":
		"見出しを抽出（デフォルトプロファイル）",
	"cmd.split-by-heading": "H{level} 見出しで分割（プロファイルを選択…）",
	"cmd.split-from-cursor": "カーソル以降を分割（プロファイルを選択…）",
	"cmd.split-from-cursor-default":
		"カーソル以降を分割（デフォルトプロファイル）",
	"cmd.undo-last-extract": "最後の抽出を元に戻す",
	"cmd.extract-profile": "抽出: {name}",

	// ── Profile editor — modal titles ────────────────────────────────────────
	"profile.title.new": "新しいプロファイル",
	"profile.title.edit": "プロファイルを編集",

	// ── Profile editor — section headings ────────────────────────────────────
	"profile.section.basic": "基本設定",
	"profile.section.extraction": "抽出",
	"profile.section.filename": "ファイル名",
	"profile.section.content-transforms": "コンテンツ変換",
	"profile.section.destination": "保存先フォルダ",
	"profile.section.target": "ターゲット",
	"profile.section.template": "テンプレートと Frontmatter",

	// ── Profile editor — basic ────────────────────────────────────────────────
	"profile.name": "名前",
	"profile.name-desc": "必須。コマンドパレットおよびプロファイル選択画面に表示されます。",
	"profile.icon": "アイコン",
	"profile.icon-desc":
		"Lucide アイコン名（例: scissors, file-text, archive）",
	"profile.description": "説明",

	// ── Profile editor — extraction ───────────────────────────────────────────
	"profile.extract-mode": "抽出モード",
	"profile.extract-mode.move": "移動（ソースから削除）",
	"profile.extract-mode.copy": "コピー（ソースに残す）",
	"profile.source-replacement": "ソース置換",
	"profile.source-replacement-desc":
		"抽出後にソースノートの該当箇所を置き換えるテキスト。Note link template が設定されている場合は無視されます。",
	"profile.source-replacement.link": "リンク",
	"profile.source-replacement.embed": "埋め込み",
	"profile.source-replacement.none": "なし",
	"profile.source-replacement.keep-and-append-link": "テキストを残してリンクを追記",
	"profile.note-link-template": "Note link テンプレート",
	"profile.note-link-template-desc":
		"抽出後にソースノートに残るテキストのカスタムテンプレート。設定すると Source replacement より優先されます（Extract mode が Copy の場合も同様）。変数: {{title}}, {{source_link}}（新規ノートへのリンク）, {{content}}, {{date:YYYYMMDD}}。空欄の場合は Source replacement を使用。",
	"profile.note-link-template-placeholder": "[[{{title}}]]  or leave empty",
	"profile.after-extract": "抽出後の動作",
	"profile.after-extract.open": "新規ノートを開く",
	"profile.after-extract.open-new-tab": "新しいタブで開く",
	"profile.after-extract.open-new-pane": "新しいペインで開く",
	"profile.after-extract.none": "何もしない",
	"profile.conflict-policy": "競合ポリシー",
	"profile.conflict-policy-desc":
		"同名のノートが既に存在する場合の動作。",
	"profile.conflict-policy.increment": "番号を付加（note 2, note 3…）",
	"profile.conflict-policy.append": "既存ノートに追記",
	"profile.conflict-policy.ask": "毎回確認",

	// ── Profile editor — filename ─────────────────────────────────────────────
	"profile.filename-rule": "ファイル名ルール",
	"profile.filename-rule.first-line": "コンテンツの1行目",
	"profile.filename-rule.prompt": "実行時に入力",
	"profile.filename-rule.pattern": "パターン",
	"profile.pattern": "パターン",
	"profile.pattern-desc":
		"変数: {{title}}, {{date:YYYYMMDD}}, {{time:HHmm}}",
	"profile.pattern-placeholder": "{{date:YYYYMMDD}}-{{title}}",

	// ── Profile editor — content transforms ──────────────────────────────────
	"profile.exclude-first-line": "1行目を除外",
	"profile.exclude-first-line-desc":
		"抽出ノートのコンテンツから1行目を除去します。ファイル名ルールが「1行目」の場合にタイトルの重複を防ぐのに便利です。",
	"profile.first-line-as-heading": "1行目を見出しとして付与",
	"profile.first-line-as-heading-desc":
		"元の1行目（除外前）を Markdown 見出しとして新規ノートの先頭に付与します。本文の重複を防ぐには「1行目を除外」と合わせて使用してください。",
	"profile.first-line-as-heading.none": "なし",
	"profile.first-line-as-heading.h1": "H1 (#)",
	"profile.first-line-as-heading.h2": "H2 (##)",
	"profile.first-line-as-heading.h3": "H3 (###)",
	"profile.normalize-headings": "見出しレベルを正規化",
	"profile.normalize-headings-desc":
		"抽出ノートの見出しレベルを昇格させ、最も浅い見出しが H1 になるように調整します。例: ## から始まるコンテンツは # に変換され、以降の見出しも同様にシフトします。",

	// ── Profile editor — destination ──────────────────────────────────────────
	"profile.destination": "保存先",
	"profile.destination.same-as-source": "ソースノートと同じフォルダ",
	"profile.destination.fixed": "固定フォルダ",
	"profile.destination.prompt": "実行時に入力",
	"profile.folder-path": "フォルダパス",
	"profile.folder-path-desc":
		"Vault ルートからの相対パス。空欄の場合は Vault ルートに保存。",
	"profile.folder-path-placeholder": "folder/subfolder",

	// ── Profile editor — target ───────────────────────────────────────────────
	"profile.target": "ターゲット",
	"profile.target.new-note": "新規ノート",
	"profile.target.append-existing": "既存ノートに追記",
	"profile.target-file": "対象ファイル",
	"profile.target-file-desc": "空欄の場合は実行時にファイルを選択します。",
	"profile.target-file-placeholder": "notes/my-note.md",
	"profile.append-position": "追記位置",
	"profile.append-position.end": "ファイルの末尾",
	"profile.append-position.under-heading": "見出しの配下",
	"profile.heading-name": "見出し名",
	"profile.heading-name-desc": "正確な見出しテキスト（# プレフィックスなし）。",

	// ── Profile editor — template & frontmatter ───────────────────────────────
	"profile.template-file": "テンプレートファイル",
	"profile.template-file-desc":
		"空欄の場合はコンテンツのみをそのまま抽出します。変数: {{content}}, {{title}}, {{source_link}}, {{date:YYYYMMDD}}",
	"profile.template-file-placeholder": "templates/extract.md",
	"profile.run-templater": "作成後に Templater を実行",
	"profile.run-templater-desc": "Templater プラグインが必要です。",
	// ── Profile editor — actions ──────────────────────────────────────────────
	"profile.action.preview": "プレビュー",
	"profile.action.cancel": "キャンセル",
	"profile.action.save": "保存",

	// ── Preview modal ─────────────────────────────────────────────────────────
	"preview.title": "抽出プレビュー",
	"preview.filename-label": "ファイル名",
	"preview.content-label": "コンテンツ",
	"preview.filename-prompt-suffix": " ← 実行時に入力",
};
