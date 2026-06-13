import { moment } from "obsidian";
import { en } from "./en";
import type { StringKey } from "./en";
import { ja } from "./ja";

const catalogs: Record<string, Partial<Record<StringKey, string>>> = {
	en: en as Record<StringKey, string>,
	ja,
};

export function t(key: StringKey, vars?: Record<string, string>): string {
	const lang = (moment.locale() || "en").split("-")[0];
	const catalog = catalogs[lang] ?? {};
	let str = catalog[key] ?? (en[key] as string);
	if (vars) {
		for (const [k, v] of Object.entries(vars)) {
			str = str.replace(`{${k}}`, v);
		}
	}
	return str;
}
