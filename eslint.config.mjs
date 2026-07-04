import tseslint from "typescript-eslint";

export default tseslint.config(
	...tseslint.configs.recommendedTypeChecked,
	{
		ignores: ["main.js", "node_modules/", "*.mjs"],
	},
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			"@typescript-eslint/no-unused-vars": ["error", { args: "none" }],
		},
	},
);
