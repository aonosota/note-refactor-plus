import { ExtractProfile } from "../types";

/**
 * Context for content transforms:
 *  - "selection": text selected by the user — all transforms apply
 *  - "heading":  a heading section extracted via heading-extractor — only
 *                normalizeHeadings applies; excludeFirstLine and
 *                firstLineAsHeading are skipped because the first line IS
 *                the heading itself and manipulating it would be confusing.
 */
export type TransformContext = "selection" | "heading";

/**
 * Applies profile-level content transformations to the extracted text before
 * it is written to the new note.
 *
 * Order (designed to avoid unwanted interactions):
 *  1. excludeFirstLine  — remove the first line from the body
 *  2. normalizeHeadings — promote heading levels so the shallowest is H1
 *  3. firstLineAsHeading — prepend the (original) first line as a heading
 *
 * Steps 1 and 3 are only executed in "selection" context.
 * This ordering ensures the custom heading added in step 3 is never
 * re-normalized by step 2.
 */
export function applyContentTransforms(
	content: string,
	profile: ExtractProfile,
	ctx: TransformContext = "selection",
): string {
	const lines = content.split("\n");
	const firstLine = lines[0] ?? "";
	let body = content;

	// Step 1: exclude first line (selection only)
	if (ctx === "selection" && profile.excludeFirstLine) {
		const rest = lines.slice(1).join("\n");
		body = rest.replace(/^\n+/, "");
	}

	// Step 2: normalize heading levels (both contexts)
	if (profile.normalizeHeadings) {
		body = normalizeHeadingLevels(body);
	}

	// Step 3: prepend first line as heading (selection only, applied after
	// normalization so the chosen level is immune to promotion)
	if (ctx === "selection" && profile.firstLineAsHeading !== "none") {
		const prefix = headingPrefix[profile.firstLineAsHeading];
		const headingText = firstLine.replace(/^#+\s*/, "").trim();
		if (headingText) {
			body = body
				? `${prefix} ${headingText}\n${body}`
				: `${prefix} ${headingText}`;
		}
	}

	return body;
}

const headingPrefix: Record<"h1" | "h2" | "h3", string> = {
	h1: "#",
	h2: "##",
	h3: "###",
};

/**
 * Promotes all headings so the shallowest heading in the content becomes H1.
 * E.g. if the minimum level is H2, every heading is shifted up by one level.
 */
function normalizeHeadingLevels(content: string): string {
	const headingRe = /^(#{1,6})\s/gm;
	const matches = [...content.matchAll(headingRe)];
	if (matches.length === 0) return content;

	const minLevel = Math.min(...matches.map((m) => m[1].length));
	if (minLevel <= 1) return content;

	const shift = minLevel - 1;
	return content.replace(headingRe, (_, hashes: string) => {
		const newLevel = Math.max(1, hashes.length - shift);
		return `${"#".repeat(newLevel)} `;
	});
}
