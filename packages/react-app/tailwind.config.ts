import type { Config } from 'tailwindcss'

import { colors } from './src/theme/config'

const minWidth = {
	/**
	 * 聊天卡片最小宽度
	 */
	'chat-card': '28rem',
}

const content = ['./src/**/*.{html,js,ts,jsx,tsx}']

const config: Config = {
	content,
	theme: {
		extend: {
			colors,
			minWidth,
		},
	},
	darkMode: 'selector',
	plugins: [],
}

export default config
