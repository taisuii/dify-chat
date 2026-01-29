import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

export default defineConfig(({ mode }) => {
  // 演示模式：用于开发和测试
  if (mode === 'demo') {
    return {
      plugins: [react()],
      root: './demo',
      envDir: './demo', // 从 demo 目录加载环境变量文件
      server: {
        port: 3000,
        open: true,
      },
      resolve: {
        // 在 demo 模式下直接从源码导入，而不是使用构建后的 dist
        alias: [
          {
            find: /^dify-chat-widget$/,
            replacement: resolve(__dirname, 'src/index.ts'),
          },
        ],
      },
    }
  }

  // 构建模式：用于打包库文件
  return {
    plugins: [
      react({
        jsxImportSource: 'react',
        babel: {
          plugins: ['@babel/plugin-transform-react-jsx']
        }
      }),
      dts({
        insertTypesEntry: true,
        rollupTypes: true,
      }),
    ],
    build: {
      lib: {
        entry: 'src/library.ts',
        name: 'DifyChatWidget',
        formats: ['es', 'cjs'],
        fileName: (format) => `index.${format === 'es' ? 'es.js' : 'js'}`,
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'jsxRuntime',
          },
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'style.css') {
              return 'dify-chat-widget.css'
            }
            return assetInfo.name!
          },
        },
      },
    },
  }
})