import { pluginReact } from '@rsbuild/plugin-react'
import { defineConfig } from '@rslib/core'
import path from 'path'

const isDevelopment = process.env.NODE_ENV === 'development'

const tsconfigDevPath = path.resolve(__dirname, './tsconfig.json')
const tsconfigProdPath = path.resolve(__dirname, './tsconfig.prod.json')

export default defineConfig({
	pluginReact: [pluginReact()],
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
			bundle: false,
		},
	],
	source: {
		tsconfigPath: isDevelopment ? tsconfigDevPath : tsconfigProdPath,
	},
})