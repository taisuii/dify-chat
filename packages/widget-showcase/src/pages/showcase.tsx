import { ThemeModeEnum, ThemeModeLabelEnum, useThemeContext } from '@dify-chat/theme'
import { DifyChat } from '@dify-chat/widget'
import { Button, Modal, Select } from 'antd'
import { useState } from 'react'
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

const DIFY_CONFIG = {
	apiBase: 'https://ai.sngzs.site/v1',
	apiKey: 'app-abiD8xtMKIhzusCd7Sh8QRpF',
	user: 'showcase-user',
}

export default function ShowcasePage() {
	const { themeMode, setThemeMode } = useThemeContext()
	const { i18n } = useTranslation()
	const [modalOpen, setModalOpen] = useState(false)

	return (
		<div style={{ height: '100vh', padding: '20px' }}>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					marginBottom: '20px',
					gap: '16px',
					flexWrap: 'wrap',
				}}
			>
				<h1 style={{ margin: 0 }}>DifyChat Widget 使用展示</h1>
				<div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
					<Button type="primary" onClick={() => setModalOpen(true)}>
						{i18n.language?.startsWith('zh') ? '弹窗对话' : 'Open Chat Modal'}
					</Button>
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
					overflow: 'hidden',
				}}
			>
				<DifyChat {...DIFY_CONFIG} />
			</div>

			{/* 弹窗对接方式：小窗口需传 layout */}
			<Modal
				title={i18n.language?.startsWith('zh') ? 'AI 对话' : 'AI Chat'}
				open={modalOpen}
				onCancel={() => setModalOpen(false)}
				footer={null}
				width={800}
				rootClassName="dify-chat-modal-no-radius"
				styles={{
					body: { height: '70vh', padding: 0 },
				}}
				destroyOnClose
			>
				<div style={{ height: '70vh', minHeight: 480 }}>
					<DifyChat
						{...DIFY_CONFIG}
						layout={{
							containerMinHeight: '100%',
							sidebarCollapsedByDefault: true,
						}}
					/>
				</div>
			</Modal>
		</div>
	)
}
