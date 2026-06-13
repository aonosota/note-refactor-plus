import { App, FuzzySuggestModal, FuzzyMatch } from "obsidian";
import { ExtractProfile } from "../types";
import { t } from "../i18n";

export class ProfileSuggester extends FuzzySuggestModal<ExtractProfile> {
	private readonly profiles: ExtractProfile[];
	private readonly onChoose: (profile: ExtractProfile) => void;

	constructor(
		app: App,
		profiles: ExtractProfile[],
		onChoose: (profile: ExtractProfile) => void,
	) {
		super(app);
		this.profiles = profiles;
		this.onChoose = onChoose;
		this.setPlaceholder(t("suggester.profile-placeholder"));
	}

	getItems(): ExtractProfile[] {
		return this.profiles;
	}

	getItemText(profile: ExtractProfile): string {
		return profile.name;
	}

	renderSuggestion(
		match: FuzzyMatch<ExtractProfile>,
		el: HTMLElement,
	): void {
		const profile = match.item;
		el.createEl("div", { text: profile.name, cls: "nrp-suggester-title" });
		if (profile.description) {
			el.createEl("small", {
				text: profile.description,
				cls: "nrp-suggester-desc",
			});
		}
	}

	onChooseItem(profile: ExtractProfile): void {
		this.onChoose(profile);
	}
}
