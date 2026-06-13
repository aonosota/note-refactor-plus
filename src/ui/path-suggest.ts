import { AbstractInputSuggest, App, TFile, TFolder } from "obsidian";

export class FileSuggest extends AbstractInputSuggest<TFile> {
	private readonly el: HTMLInputElement | HTMLDivElement;

	constructor(app: App, inputEl: HTMLInputElement | HTMLDivElement) {
		super(app, inputEl);
		this.el = inputEl;
	}

	getSuggestions(query: string): TFile[] {
		const q = query.toLowerCase();
		return this.app.vault
			.getMarkdownFiles()
			.filter((f) => f.path.toLowerCase().includes(q))
			.slice(0, 20);
	}

	renderSuggestion(file: TFile, el: HTMLElement): void {
		el.setText(file.path);
	}

	selectSuggestion(file: TFile, _evt: MouseEvent | KeyboardEvent): void {
		this.setValue(file.path);
		this.el.dispatchEvent(new Event("input"));
		this.close();
	}
}

export class FolderSuggest extends AbstractInputSuggest<TFolder> {
	private readonly el: HTMLInputElement | HTMLDivElement;

	constructor(app: App, inputEl: HTMLInputElement | HTMLDivElement) {
		super(app, inputEl);
		this.el = inputEl;
	}

	getSuggestions(query: string): TFolder[] {
		const q = query.toLowerCase();
		const results: TFolder[] = [];
		const walk = (folder: TFolder): void => {
			if (folder.path.toLowerCase().includes(q)) results.push(folder);
			for (const child of folder.children) {
				if (child instanceof TFolder) walk(child);
			}
		};
		walk(this.app.vault.getRoot());
		return results.slice(0, 20);
	}

	renderSuggestion(folder: TFolder, el: HTMLElement): void {
		el.setText(folder.path || "(vault root)");
	}

	selectSuggestion(folder: TFolder, _evt: MouseEvent | KeyboardEvent): void {
		this.setValue(folder.path);
		this.el.dispatchEvent(new Event("input"));
		this.close();
	}
}
