import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import typescript from '@typescript-eslint/eslint-plugin';
import parserTypeScript from '@typescript-eslint/parser';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';

export default defineConfig([
	{
		name: 'app/files-to-lint',
		files: ['**/*.{js,mjs,jsx,ts,mts,tsx,vue}'],
		languageOptions: {
			parser: parserTypeScript,
			parserOptions: {
				// Ensure this matches your real tsconfig file
				project: './tsconfig.json',
				tsconfigRootDir: process.cwd(),
				sourceType: 'module',
				extraFileExtensions: ['.vue']
			},
			globals: {
				...globals.browser,
				...globals.node
			}
		},
		plugins: {
			'@typescript-eslint': typescript
		}
	},

	globalIgnores([
		'**/dist/**',
		'**/dist-ssr/**',
		'**/coverage/**',
		'**/playwright-report/**',
		'./src/lib/*',
		'./src/js/bootstrap/*',
		'./src/css/bootstrap/*',
		'./.vite/**',
		'./out/**'
	]),

	js.configs.recommended,
	...pluginVue.configs['flat/recommended'],
	typescript.configs.recommended,
	skipFormatting,

	{
		rules: {
			'vue/multi-word-component-names': 'off',
			'vue/require-valid-default-prop': 'off',
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
		}
	}
]);
