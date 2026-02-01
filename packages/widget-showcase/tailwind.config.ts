import type { Config } from 'tailwindcss'

import { colors } from '../widget/src/theme/config'

const content = [
	'./src/**/*.{html,js,ts,jsx,tsx}',
	'../widget/src/**/*.{js,ts,jsx,tsx}',
]

export default {
	content,
	theme: {
		extend: { colors },
	},
	darkMode: 'selector',
	plugins: [],
} satisfies Config
