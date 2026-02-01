import { ThemeModeEnum, ThemeModeLabelEnum, useThemeContext } from '@dify-chat/theme'
import { DifyChat } from '@dify-chat/widget'
import { Select } from 'antd'
import { useTranslation } from 'react-i18next'

const languageOptions = [
	{ value: 'zh', label: '中文' },
	{ value: 'en', label: 'English' },
]

const themeOptions = [
	{ value: ThemeModeEnum.SYSTEM, label: ThemeModeLabelEnum.SYSTEM },
	{ value: ThemeModeEnum.LIGHT, label: ThemeModeLabelEnum.LIGHT },
	{ value: ThemeModeEnum.DARK, label: ThemeModeLabelEnum.DARK },
]

export default function ShowcasePage() {
	const { themeMode, setThemeMode } = useThemeContext()
	const { i18n } = useTranslation()

	return (
		<div style={{ height: '100vh', padding: '20px' }}>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					marginBottom: '20px',
					gap: '16px',
				}}
			>
				<h1 style={{ margin: 0 }}>DifyChat Widget 使用展示</h1>
				<div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
					<Select
						value={(i18n.language || 'en').startsWith('zh') ? 'zh' : 'en'}
						options={languageOptions}
						onChange={(v) => i18n.changeLanguage(v)}
						style={{ width: 120 }}
					/>
					<Select
						value={themeMode}
						options={themeOptions}
						onChange={(v) => setThemeMode(v as ThemeModeEnum)}
						style={{ width: 120 }}
					/>
				</div>
			</div>
			<div
				style={{
					height: 'calc(100vh - 100px)',
					border: '1px solid #d9d9d9',
					borderRadius: '8px',
					overflow: 'hidden',
				}}
			>
				<DifyChat
					apiBase="https://ai.sngzs.site/v1"
					apiKey="app-abiD8xtMKIhzusCd7Sh8QRpF"
					user="showcase-user"
				/>
			</div>
		</div>
	)
}
