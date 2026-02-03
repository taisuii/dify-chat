import { pluginReact } from '@rsbuild/plugin-react'
import { defineConfig } from '@rslib/core'
import path from 'path'

const isDevelopment = process.env.NODE_ENV === 'development'

const tsconfigDevPath = path.resolve(__dirname, './tsconfig.json')
const tsconfigProdPath = path.resolve(__dirname, './tsconfig.prod.json')

export default defineConfig({
	pluginReact: [
		pluginReact({
			swcReactOptions: { runtime: 'automatic' },
		}),
	],
	output: {
		copy: [
			{
				from: './src/components/markdown-renderer/index.css',
				to: 'assets/markdown-renderer.css',
			},
			{
				from: './src/theme-default.css',
				to: 'assets/theme-default.css',
			},
			{
				from: './declarations/index.d.ts',
				to: 'index.d.ts',
			},
		],
	},
	lib: [
		{
			format: 'esm',
			syntax: 'es2021',
			dts: false,
			bundle: false,
		},
		{
			format: 'cjs',
			syntax: 'es2021',
			bundle: true,
			autoExternal: {
				dependencies: false,
				peerDependencies: true,
			},
			output: {
				externals: [
					'@dify-chat/api',
					'@dify-chat/core',
					'@dify-chat/helpers',
					'@dify-chat/theme',
				],
				// 将 CJS 及 chunk 输出到 dist/cjs/，避免 require("./"+chunkId) 的 context 匹配到 CSS、.d.ts
				distPath: {
					js: 'cjs',
					jsAsync: 'cjs',
				},
			},
		},
	],
	source: {
		tsconfigPath: isDevelopment ? tsconfigDevPath : tsconfigProdPath,
	},
})