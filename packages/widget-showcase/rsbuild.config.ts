import { defineConfig } from '@rsbuild/core'
import { pluginLess } from '@rsbuild/plugin-less'
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginSourceBuild } from '@rsbuild/plugin-source-build'
import path from 'path'
import tailwindcss from 'tailwindcss'

export default defineConfig({
	source: {
		tsconfigPath: path.resolve(__dirname, './tsconfig.json'),
		include: [{ not: /[\\/]core-js[\\/]/ }],
		define: {
			'process.env.PUBLIC_DEBUG_MODE': JSON.stringify(process.env.PUBLIC_DEBUG_MODE ?? ''),
		},
	},
	output: {
		polyfill: 'entry',
	},
	html: {
		template: path.resolve(__dirname, './public/template.html'),
		favicon: path.resolve(__dirname, './public/logo.png'),
	},
	plugins: [
		pluginSourceBuild(),
		pluginReact(),
		pluginLess({
			lessLoaderOptions: {
				lessOptions: {
					plugins: [],
					javascriptEnabled: true,
				},
			},
		}),
	],
	server: {
		compress: false,
		base: '/widget-showcase',
		port: 5300,
		host: '0.0.0.0',
	},
	tools: {
		postcss: {
			postcssOptions: {
				plugins: [tailwindcss()],
			},
		},
	},
})
