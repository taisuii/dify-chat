import { ThemeModeEnum, ThemeModeLabelEnum, useThemeContext } from '@dify-chat/theme'
import { DifyChat } from '@dify-chat/widget'
import { theme as antdTheme, ConfigProvider, Select } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import enUS from 'antd/es/locale/en_US'
import { useTranslation } from 'react-i18next'

const themeOptions = [
	{ value: ThemeModeEnum.SYSTEM, label: ThemeModeLabelEnum.SYSTEM },
	{ value: ThemeModeEnum.LIGHT, label: ThemeModeLabelEnum.LIGHT },
	{ value: ThemeModeEnum.DARK, label: ThemeModeLabelEnum.DARK },
]

/**
 * 最小集成：仅渲染 DifyChat，用于验证 tgz 安装后能否正常构建与运行。
 * 与 widget-showcase 一致：ConfigProvider 使用 antd 深色算法 + 语言包，保证深色下弹窗/按钮等与展示效果一致。
 */
export default function App() {
	const { themeMode, setThemeMode, isDark } = useThemeContext()
	const { i18n } = useTranslation()

	return (
		<ConfigProvider
			locale={(i18n.language || 'en').startsWith('zh') ? zhCN : enUS}
			theme={{
				algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
			}}
		>
			<div
				style={{
					height: '100vh',
					padding: 16,
					background: 'var(--theme-bg-color)',
					color: 'var(--theme-text-color)',
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						marginBottom: 16,
						gap: 16,
					}}
				>
					<h2 style={{ margin: 0 }}>tgz-consumer · 安装验证</h2>
					<Select
						value={themeMode}
						options={themeOptions}
						onChange={(v: ThemeModeEnum) => setThemeMode(v)}
						style={{ width: 120 }}
					/>
				</div>
				<div style={{ height: 'calc(100vh - 80px)' }}>
					<DifyChat
						apiBase="https://ai.sngzs.site/v1"
						apiKey="app-abiD8xtMKIhzusCd7Sh8QRpF"
						user="showcase-user"
					/>
				</div>
			</div>
		</ConfigProvider>
	)
}
