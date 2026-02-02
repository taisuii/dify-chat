import { useThemeContext } from '@dify-chat/theme'
import { theme as antdTheme, ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import enUS from 'antd/es/locale/en_US'
import { useTranslation } from 'react-i18next'
import ShowcasePage from './pages/showcase'
import './App.css'

import '@/libs/i18n'

// Widget 依赖的样式（Next.js 等禁止从 node_modules 导入 CSS 的框架需在应用入口显式导入）
import 'katex/dist/katex.min.css'
import 'react-photo-view/dist/react-photo-view.css'
import '@dify-chat/widget/markdown-styles.css'

/**
 * DifyChat Widget Showcase - 展示 DifyChat 组件的使用效果
 */
export default function App() {
	const { isDark } = useThemeContext()
	const { i18n } = useTranslation()

	return (
		<ConfigProvider
			locale={i18n.language === 'en' ? enUS : zhCN}
			theme={{
				algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
			}}
		>
			<ShowcasePage />
		</ConfigProvider>
	)
}
