import { ThemeContextProvider } from '@dify-chat/theme'
import type { AppProps } from 'next/app'

import '../lib/i18n'
import '../styles/globals.css'

// Widget 依赖的样式（Next.js 禁止从 node_modules 导入 CSS，需在应用入口显式导入）
import 'katex/dist/katex.min.css'
import 'react-photo-view/dist/react-photo-view.css'
import '@dify-chat/widget/markdown-styles.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeContextProvider>
      <Component {...pageProps} />
    </ThemeContextProvider>
  )
}
