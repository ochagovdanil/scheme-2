import { defineConfig } from 'vite';
import * as path from 'path';

// https://vitejs.dev/config
export default defineConfig({
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src')
		}
	}
});
