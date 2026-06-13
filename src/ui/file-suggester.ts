import { App, FuzzySuggestModal, TFile } from "obsidian";

class FileSuggesterModal extends FuzzySuggestModal<TFile> {
	private readonly resolve: (file: TFile) => void;
	private readonly reject: (reason: unknown) => void;
	private chosen = false;

	constructor(
		app: App,
		resolve: (file: TFile) => void,
		reject: (reason: unknown) => void,
	) {
		super(app);
		this.resolve = resolve;
		this.reject = reject;
		this.setPlaceholder("Choose a note to append to…");
	}

	getItems(): TFile[] {
		return this.app.vault.getMarkdownFiles().sort((a, b) =>
			a.path.localeCompare(b.path),
		);
	}

	getItemText(file: TFile): string {
		return file.path;
	}

	onChooseItem(file: TFile): void {
		this.chosen = true;
		this.resolve(file);
	}

	onClose(): void {
		super.onClose();
		if (!this.chosen) {
			this.reject(new Error("File selection cancelled"));
		}
	}
}

export function pickFile(app: App): Promise<TFile> {
	return new Promise((resolve, reject) => {
		new FileSuggesterModal(app, resolve, reject).open();
	});
}
