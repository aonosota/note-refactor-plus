import {
	App,
	Modal,
	Notice,
	Setting,
	TFile,
	TextComponent,
	setIcon,
} from "obsidian";
import {
	ExtractProfile,
	TargetRule,
} from "../types";
import { applyTemplate, expandVariables, TemplateContext } from "../core/template";
import { FileSuggest, FolderSuggest } from "../ui/path-suggest";
import { t } from "../i18n";

export class ProfileEditorModal extends Modal {
	private draft: ExtractProfile;
	private readonly isNew: boolean;
	private readonly onSave: (profile: ExtractProfile) => Promise<void>;

	constructor(
		app: App,
		profile: ExtractProfile,
		isNew: boolean,
		onSave: (profile: ExtractProfile) => Promise<void>,
	) {
		super(app);
		this.draft = structuredClone(profile);
		this.isNew = isNew;
		this.onSave = onSave;
	}

	onOpen(): void {
		const { contentEl, modalEl } = this;
		contentEl.empty();
		modalEl.addClass("nrp-profile-editor-modal");
		this.titleEl.setText(
			this.isNew ? t("profile.title.new") : t("profile.title.edit"),
		);

		this.renderBasicSection(contentEl);
		this.renderExtractionSection(contentEl);
		this.renderFilenameSection(contentEl);
		this.renderContentTransformsSection(contentEl);
		this.renderDestinationSection(contentEl);
		this.renderTargetSection(contentEl);
		this.renderTemplateSection(contentEl);
		this.renderActions(contentEl);
	}

	onClose(): void {
		this.contentEl.empty();
	}

	// -------------------------------------------------------------------------

	private sectionHeading(parent: HTMLElement, key: Parameters<typeof t>[0]): void {
		new Setting(parent)
			.setName(t(key))
			.setHeading()
			.settingEl.addClass("nrp-section-heading");
	}

	private renderBasicSection(el: HTMLElement): void {
		this.sectionHeading(el, "profile.section.basic");

		new Setting(el)
			.setName(t("profile.name"))
			.setDesc(t("profile.name-desc"))
			.addText((txt) =>
				txt.setValue(this.draft.name).onChange((v) => {
					this.draft.name = v;
				}),
			);

		let iconPreview: HTMLElement;
		const iconSetting = new Setting(el)
			.setName(t("profile.icon"))
			.setDesc(t("profile.icon-desc"))
			.addText((txt) =>
				txt.setValue(this.draft.icon).onChange((v) => {
					this.draft.icon = v;
					iconPreview.empty();
					try {
						setIcon(iconPreview, v || "file-text");
					} catch {
						setIcon(iconPreview, "help-circle");
					}
				}),
			);
		iconPreview = iconSetting.controlEl.createDiv("nrp-icon-preview");
		try {
			setIcon(iconPreview, this.draft.icon || "file-text");
		} catch {
			setIcon(iconPreview, "help-circle");
		}

		new Setting(el)
			.setName(t("profile.description"))
			.addText((txt) =>
				txt.setValue(this.draft.description).onChange((v) => {
					this.draft.description = v;
				}),
			);
	}

	private renderExtractionSection(el: HTMLElement): void {
		this.sectionHeading(el, "profile.section.extraction");

		new Setting(el)
			.setName(t("profile.extract-mode"))
			.addDropdown((dd) =>
				dd
					.addOption("move", t("profile.extract-mode.move"))
					.addOption("copy", t("profile.extract-mode.copy"))
					.setValue(this.draft.extractMode)
					.onChange((v) => {
						this.draft.extractMode = v as "move" | "copy";
					}),
			);

		new Setting(el)
			.setName(t("profile.source-replacement"))
			.setDesc(t("profile.source-replacement-desc"))
			.addDropdown((dd) =>
				dd
					.addOption("link", t("profile.source-replacement.link"))
					.addOption("embed", t("profile.source-replacement.embed"))
					.addOption("none", t("profile.source-replacement.none"))
					.addOption(
						"keep-and-append-link",
						t("profile.source-replacement.keep-and-append-link"),
					)
					.setValue(this.draft.sourceReplacement)
					.onChange((v) => {
						this.draft.sourceReplacement =
							v as typeof this.draft.sourceReplacement;
					}),
			);

		new Setting(el)
			.setName(t("profile.note-link-template"))
			.setDesc(t("profile.note-link-template-desc"))
			.addText((txt) =>
				txt
					.setPlaceholder(t("profile.note-link-template-placeholder"))
					.setValue(this.draft.noteLinkTemplate)
					.onChange((v) => {
						this.draft.noteLinkTemplate = v;
					}),
			);

		new Setting(el)
			.setName(t("profile.after-extract"))
			.addDropdown((dd) =>
				dd
					.addOption("open", t("profile.after-extract.open"))
					.addOption("open-new-tab", t("profile.after-extract.open-new-tab"))
					.addOption("open-new-pane", t("profile.after-extract.open-new-pane"))
					.addOption("none", t("profile.after-extract.none"))
					.setValue(this.draft.afterExtract)
					.onChange((v) => {
						this.draft.afterExtract = v as typeof this.draft.afterExtract;
					}),
			);

		new Setting(el)
			.setName(t("profile.conflict-policy"))
			.setDesc(t("profile.conflict-policy-desc"))
			.addDropdown((dd) =>
				dd
					.addOption("increment", t("profile.conflict-policy.increment"))
					.addOption("append", t("profile.conflict-policy.append"))
					.addOption("ask", t("profile.conflict-policy.ask"))
					.setValue(this.draft.conflictPolicy)
					.onChange((v) => {
						this.draft.conflictPolicy = v as typeof this.draft.conflictPolicy;
					}),
			);
	}

	private renderFilenameSection(el: HTMLElement): void {
		this.sectionHeading(el, "profile.section.filename");

		let patternEl!: HTMLElement;
		let patternInput!: TextComponent;

		new Setting(el)
			.setName(t("profile.filename-rule"))
			.addDropdown((dd) =>
				dd
					.addOption("first-line", t("profile.filename-rule.first-line"))
					.addOption("prompt", t("profile.filename-rule.prompt"))
					.addOption("pattern", t("profile.filename-rule.pattern"))
					.setValue(this.draft.filenameRule.mode)
					.onChange((mode) => {
						if (mode === "pattern") {
							const prev =
								this.draft.filenameRule.mode === "pattern"
									? this.draft.filenameRule.pattern
									: "";
							this.draft.filenameRule = { mode: "pattern", pattern: prev };
							patternInput.setValue(prev);
						} else {
							this.draft.filenameRule = {
								mode: mode as "first-line" | "prompt",
							};
						}
						patternEl.toggleClass("nrp-hidden", mode !== "pattern");
					}),
			);

		const initPattern =
			this.draft.filenameRule.mode === "pattern"
				? this.draft.filenameRule.pattern
				: "";

		patternEl = new Setting(el)
			.setName(t("profile.pattern"))
			.setDesc(t("profile.pattern-desc"))
			.addText((txt) => {
				patternInput = txt;
				txt
					.setPlaceholder(t("profile.pattern-placeholder"))
					.setValue(initPattern)
					.onChange((v) => {
						this.draft.filenameRule = { mode: "pattern", pattern: v };
					});
			}).settingEl;
		patternEl.toggleClass(
			"nrp-hidden",
			this.draft.filenameRule.mode !== "pattern",
		);
	}

	private renderContentTransformsSection(el: HTMLElement): void {
		this.sectionHeading(el, "profile.section.content-transforms");

		new Setting(el)
			.setName(t("profile.exclude-first-line"))
			.setDesc(t("profile.exclude-first-line-desc"))
			.addToggle((tog) =>
				tog.setValue(this.draft.excludeFirstLine).onChange((v) => {
					this.draft.excludeFirstLine = v;
				}),
			);

		new Setting(el)
			.setName(t("profile.first-line-as-heading"))
			.setDesc(t("profile.first-line-as-heading-desc"))
			.addDropdown((dd) =>
				dd
					.addOption("none", t("profile.first-line-as-heading.none"))
					.addOption("h1", t("profile.first-line-as-heading.h1"))
					.addOption("h2", t("profile.first-line-as-heading.h2"))
					.addOption("h3", t("profile.first-line-as-heading.h3"))
					.setValue(this.draft.firstLineAsHeading)
					.onChange((v) => {
						this.draft.firstLineAsHeading =
							v as typeof this.draft.firstLineAsHeading;
					}),
			);

		new Setting(el)
			.setName(t("profile.normalize-headings"))
			.setDesc(t("profile.normalize-headings-desc"))
			.addToggle((tog) =>
				tog.setValue(this.draft.normalizeHeadings).onChange((v) => {
					this.draft.normalizeHeadings = v;
				}),
			);
	}

	private renderDestinationSection(el: HTMLElement): void {
		this.sectionHeading(el, "profile.section.destination");

		let fixedPathEl!: HTMLElement;
		const initFixed =
			this.draft.destination.mode === "fixed" ? this.draft.destination.path : "";

		new Setting(el)
			.setName(t("profile.destination"))
			.addDropdown((dd) =>
				dd
					.addOption(
						"same-as-source",
						t("profile.destination.same-as-source"),
					)
					.addOption("fixed", t("profile.destination.fixed"))
					.setValue(this.draft.destination.mode)
					.onChange((mode) => {
						if (mode === "fixed") {
							this.draft.destination = {
								mode: "fixed",
								path: fixedPathInput.getValue(),
							};
						} else {
							this.draft.destination = {
								mode: mode as "same-as-source",
							};
						}
						fixedPathEl.toggleClass("nrp-hidden", mode !== "fixed");
					}),
			);

		let fixedPathInput!: TextComponent;
		fixedPathEl = new Setting(el)
			.setName(t("profile.folder-path"))
			.setDesc(t("profile.folder-path-desc"))
			.addText((txt) => {
				fixedPathInput = txt;
				txt
					.setPlaceholder(t("profile.folder-path-placeholder"))
					.setValue(initFixed)
					.onChange((v) => {
						this.draft.destination = { mode: "fixed", path: v };
					});
				new FolderSuggest(this.app, txt.inputEl);
			}).settingEl;
		fixedPathEl.toggleClass(
			"nrp-hidden",
			this.draft.destination.mode !== "fixed",
		);
	}

	private renderTargetSection(el: HTMLElement): void {
		this.sectionHeading(el, "profile.section.target");

		let appendDetailsEl!: HTMLElement;
		let headingNameEl!: HTMLElement;

		const initIsAppend = this.draft.target.mode === "append-existing";
		const initAppend: Extract<TargetRule, { mode: "append-existing" }> =
			initIsAppend
				? (this.draft.target as Extract<TargetRule, { mode: "append-existing" }>)
				: {
						mode: "append-existing",
						targetPath: "",
						position: "end",
						headingName: "",
					};

		new Setting(el)
			.setName(t("profile.target"))
			.addDropdown((dd) =>
				dd
					.addOption("new-note", t("profile.target.new-note"))
					.addOption("append-existing", t("profile.target.append-existing"))
					.setValue(this.draft.target.mode)
					.onChange((mode) => {
						if (mode === "new-note") {
							this.draft.target = { mode: "new-note" };
						} else {
							const cur =
								this.draft.target.mode === "append-existing"
									? this.draft.target
									: initAppend;
							this.draft.target = { ...cur, mode: "append-existing" };
						}
						appendDetailsEl.toggleClass(
							"nrp-hidden",
							mode !== "append-existing",
						);
					}),
			);

		appendDetailsEl = el.createDiv("nrp-setting-group");
		appendDetailsEl.toggleClass("nrp-hidden", !initIsAppend);

		new Setting(appendDetailsEl)
			.setName(t("profile.target-file"))
			.setDesc(t("profile.target-file-desc"))
			.addText((txt) => {
				txt
					.setPlaceholder(t("profile.target-file-placeholder"))
					.setValue(initAppend.targetPath)
					.onChange((v) => {
						if (this.draft.target.mode === "append-existing") {
							this.draft.target.targetPath = v;
						}
					});
				new FileSuggest(this.app, txt.inputEl);
			});

		new Setting(appendDetailsEl)
			.setName(t("profile.append-position"))
			.addDropdown((dd) =>
				dd
					.addOption("end", t("profile.append-position.end"))
					.addOption("under-heading", t("profile.append-position.under-heading"))
					.setValue(initAppend.position)
					.onChange((pos) => {
						if (this.draft.target.mode === "append-existing") {
							this.draft.target.position = pos as "end" | "under-heading";
						}
						headingNameEl.toggleClass(
							"nrp-hidden",
							pos !== "under-heading",
						);
					}),
			);

		headingNameEl = new Setting(appendDetailsEl)
			.setName(t("profile.heading-name"))
			.setDesc(t("profile.heading-name-desc"))
			.addText((txt) =>
				txt.setValue(initAppend.headingName).onChange((v) => {
					if (this.draft.target.mode === "append-existing") {
						this.draft.target.headingName = v;
					}
				}),
			).settingEl;
		headingNameEl.toggleClass(
			"nrp-hidden",
			initAppend.position !== "under-heading",
		);
	}

	private renderTemplateSection(el: HTMLElement): void {
		this.sectionHeading(el, "profile.section.template");

		new Setting(el)
			.setName(t("profile.template-file"))
			.setDesc(t("profile.template-file-desc"))
			.addText((txt) => {
				txt
					.setPlaceholder(t("profile.template-file-placeholder"))
					.setValue(this.draft.templatePath)
					.onChange((v) => {
						this.draft.templatePath = v;
					});
				new FileSuggest(this.app, txt.inputEl);
			});

		new Setting(el)
			.setName(t("profile.run-templater"))
			.setDesc(t("profile.run-templater-desc"))
			.addToggle((tog) =>
				tog.setValue(this.draft.runTemplaterAfter).onChange((v) => {
					this.draft.runTemplaterAfter = v;
				}),
			);

	}

	private renderActions(el: HTMLElement): void {
		el.createDiv("nrp-editor-actions", (div) => {
			new Setting(div)
				.addButton((btn) =>
					btn.setButtonText(t("profile.action.preview")).onClick(() =>
						this.runPreview(),
					),
				)
				.addButton((btn) =>
					btn
						.setButtonText(t("profile.action.cancel"))
						.onClick(() => this.close()),
				)
				.addButton((btn) =>
					btn
						.setButtonText(t("profile.action.save"))
						.setCta()
						.onClick(() => this.save()),
				);
		});
	}

	private async save(): Promise<void> {
		const name = this.draft.name.trim();
		if (!name) {
			new Notice(t("notice.profile-name-required"));
			return;
		}
		if (
			this.draft.filenameRule.mode === "pattern" &&
			!this.draft.filenameRule.pattern.trim()
		) {
			new Notice(t("notice.pattern-empty"));
			return;
		}
		if (this.draft.templatePath) {
			const tplFile = this.app.vault.getAbstractFileByPath(
				this.draft.templatePath,
			);
			if (!(tplFile instanceof TFile)) {
				new Notice(t("notice.template-not-found", { path: this.draft.templatePath }));
				return;
			}
			const raw = await this.app.vault.read(tplFile);
			if (!raw.includes("{{content}}")) {
				new Notice(t("notice.template-no-content-var"));
				// Save proceeds — applyTemplate will append content automatically.
			}
		}
		this.draft.name = name;
		await this.onSave(this.draft);
		this.close();
	}

	private async runPreview(): Promise<void> {
		const now = new Date();
		const dummyContent = "This is sample content.\nSecond line of content.";
		const dummyTitle = "Sample Heading";
		const ctx: TemplateContext = {
			content: dummyContent,
			title: dummyTitle,
			sourceLink: "[[Source Note]]",
			sourceTitle: "Source Note",
			sourcePath: "notes/Source Note.md",
			heading: "Parent Heading",
		};

		let filename: string;
		switch (this.draft.filenameRule.mode) {
			case "first-line":
				filename = dummyTitle;
				break;
			case "prompt":
				filename = `${dummyTitle}${t("preview.filename-prompt-suffix")}`;
				break;
			case "pattern":
				filename = expandVariables(this.draft.filenameRule.pattern, ctx, now);
				break;
		}

		let body: string;
		try {
			body = await applyTemplate(this.app, this.draft.templatePath, ctx);
		} catch (e) {
			body = `Template error: ${e instanceof Error ? e.message : String(e)}`;
		}

		new PreviewModal(this.app, filename, body).open();
	}
}

// ---------------------------------------------------------------------------

class PreviewModal extends Modal {
	constructor(
		app: App,
		private readonly filename: string,
		private readonly body: string,
	) {
		super(app);
	}

	onOpen(): void {
		this.titleEl.setText(t("preview.title"));
		const { contentEl } = this;
		contentEl.addClass("nrp-preview-modal");

		contentEl.createEl("p", {
			text: t("preview.filename-label"),
			cls: "nrp-preview-label",
		});
		contentEl.createEl("code", {
			text: `${this.filename}.md`,
			cls: "nrp-preview-filename",
		});

		contentEl.createEl("p", {
			text: t("preview.content-label"),
			cls: "nrp-preview-label",
		});
		contentEl.createEl("pre", { text: this.body, cls: "nrp-preview-body" });
	}

	onClose(): void {
		this.contentEl.empty();
	}
}
