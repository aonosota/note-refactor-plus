import tseslint from "typescript-eslint";

export default tseslint.config(
	...tseslint.configs.recommended,
	{
		ignores: ["main.js", "node_modules/", "*.mjs"],
	},
	{
		rules: {
			"@typescript-eslint/no-unused-vars": ["error", { args: "none" }],
		},
	},
);
