import { ThemeContextProvider } from '@dify-chat/theme'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './libs/i18n'
import './theme-vars.css'

// Widget 依赖的样式（Next.js 等禁止从 node_modules 导入 CSS 的框架需在应用入口显式导入）
import 'katex/dist/katex.min.css'
import 'react-photo-view/dist/react-photo-view.css'
import '@dify-chat/widget/markdown-styles.css'

const root = document.getElementById('root')
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ThemeContextProvider>
        <App />
      </ThemeContextProvider>
    </React.StrictMode>,
  )
}
