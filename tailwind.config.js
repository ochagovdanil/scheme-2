/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				// For components and elements on the page
				primary: '#002430',
				secondary: {
					DEFAULT: '#FF6F3C',
					dark: '#f3581f'
				},
				tertiary: {
					DEFAULT: '#6B4CD6',
					dark: '#573db6'
				},
				// For title and subtitle (=primary color)
				content: '#002430',
				subcontent: '#4f5253'
			},
			container: {
				center: true
			}
		}
	},
	plugins: []
};
