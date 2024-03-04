/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{js,jsx,ts,tsx}'],
	theme: {
		extend: {
			colors: {
				'accent-light': '#E8F2ED',
				'accent-dark': '#4F966E',
				'primary-dark': '#0D1C12',
				background: '#F7FCFA',
				'background-dark': '#252525',
			},
		},
	},
	plugins: [],
};
