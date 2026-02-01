import { initResponsiveConfig } from '@dify-chat/helpers'
import { useThemeContext } from '@dify-chat/theme'
import { theme as antdTheme, ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import enUS from 'antd/es/locale/en_US'
import { useTranslation } from 'react-i18next'

import './App.css'
import ShowcasePage from './pages/showcase'
import '@/libs/i18n'

initResponsiveConfig()

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
