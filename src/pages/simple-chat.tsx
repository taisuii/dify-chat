/**
 * 简单聊天测试页面
 *
 * 演示如何使用封装的 DifyChat 组件。
 * 先填写 apiBase、apiKey，连接成功后即渲染 DifyChat。
 *
 * 使用方法：
 * 1. .env 中设置 PUBLIC_DEBUG_MODE=true
 * 2. 访问 http://localhost:5200/dify-chat/simple-chat
 * 3. 填写 API 配置后连接
 *
 * 在其他网站接入时，直接使用 DifyChat 组件，传入 apiBase、apiKey 即可：
 * ```tsx
 * import { DifyChat } from '@/components/dify-chat'
 * <DifyChat apiBase="https://api.dify.ai/v1" apiKey="app-xxx" />
 * ```
 */

import { generateUuidV4, LocalStorageKeys, LocalStorageStore } from '@dify-chat/helpers'
import { ThemeModeEnum } from '@dify-chat/theme'
import { Button, Card, Dropdown, Form, Input, message, Space } from 'antd'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useThemeContext } from '@dify-chat/theme'
import { LucideIcon } from '@/components'

import { DifyChat } from '@/components/dify-chat'

interface Config {
	apiBase: string
	apiKey: string
	user: string
}

export default function SimpleChatPage() {
	const [config, setConfig] = useState<Config | null>(null)
	const [form] = Form.useForm()
	const { themeMode, setThemeMode } = useThemeContext()
	const { i18n } = useTranslation()
	
	// 受控的主题和语言状态（用于 DifyChat）
	const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
	const [language, setLanguage] = useState<'en' | 'zh'>('zh')

	// 初始化时从 localStorage 读取
	useEffect(() => {
		const savedTheme = LocalStorageStore.get(LocalStorageKeys.THEME_MODE) || ThemeModeEnum.SYSTEM
		const savedLang = i18n.language || 'zh'
		setTheme(
			savedTheme === ThemeModeEnum.SYSTEM
				? 'system'
				: savedTheme === ThemeModeEnum.DARK
					? 'dark'
					: 'light',
		)
		setLanguage(savedLang === 'zh' ? 'zh' : 'en')
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const onFinish = (values: Config) => {
		const user = values.user || generateUuidV4()
		LocalStorageStore.set(LocalStorageKeys.USER_ID, user)
		setConfig({
			apiBase: values.apiBase,
			apiKey: values.apiKey,
			user,
		})
		message.success('配置已保存，正在连接…')
	}

	const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
		setTheme(newTheme)
		const themeModeValue =
			newTheme === 'system'
				? ThemeModeEnum.SYSTEM
				: newTheme === 'dark'
					? ThemeModeEnum.DARK
					: ThemeModeEnum.LIGHT
		setThemeMode(themeModeValue)
	}

	const handleLanguageChange = (newLang: 'en' | 'zh') => {
		setLanguage(newLang)
		i18n.changeLanguage(newLang)
	}

	if (!config) {
		return (
			<div className="flex h-screen items-center justify-center bg-gray-50">
				<Card title="Dify Chat 配置" className="w-full max-w-md">
					<Form
						form={form}
						layout="vertical"
						onFinish={onFinish}
						initialValues={{
							apiBase: 'https://ai.sngzs.site/v1',
							user: generateUuidV4(),
						}}
					>
						<Form.Item
							name="apiBase"
							label="API Base"
							rules={[{ required: true, message: '请输入 API Base' }]}
						>
							<Input placeholder=" https://ai.sngzs.site/v1" />
						</Form.Item>
						<Form.Item
							name="apiKey"
							label="API Key"
							rules={[{ required: true, message: '请输入 API Key' }]}
						>
							<Input.Password placeholder="app-xxx" />

						</Form.Item>
						<Form.Item name="user" label="用户 ID（可选）">
							<Input placeholder="不填则自动生成" />
						</Form.Item>
						<Form.Item>
							<Button type="primary" htmlType="submit" block>
								连接
							</Button>
						</Form.Item>
					</Form>
				</Card>
			</div>
		)
	}

	return (
		<div className="flex h-screen flex-col">
			{/* 顶部控制栏：主题和语言切换 */}
			<div className="flex h-16 items-center justify-end border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800">
				<Space size={16}>
					{/* 主题切换 */}
					<Dropdown
						placement="bottomRight"
						menu={{
							selectedKeys: [theme],
							items: [
								{
									key: 'system',
									label: '跟随系统',
									icon: <LucideIcon name="screen-share" size={16} />,
									onClick: () => handleThemeChange('system'),
								},
								{
									key: 'light',
									label: '浅色',
									icon: <LucideIcon name="sun" size={16} />,
									onClick: () => handleThemeChange('light'),
								},
								{
									key: 'dark',
									label: '深色',
									icon: <LucideIcon name="moon-star" size={16} />,
									onClick: () => handleThemeChange('dark'),
								},
							],
						}}
					>
						<div className="flex cursor-pointer items-center">
							<LucideIcon
								name={
									theme === 'dark'
										? 'moon-star'
										: theme === 'light'
											? 'sun'
											: 'screen-share'
								}
								size={20}
							/>
						</div>
					</Dropdown>
					{/* 语言切换 */}
					<Dropdown
						arrow
						placement="bottomRight"
						menu={{
							selectedKeys: [language],
							items: [
								{
									key: 'zh',
									label: '中文',
									onClick: () => handleLanguageChange('zh'),
								},
								{
									key: 'en',
									label: 'English',
									onClick: () => handleLanguageChange('en'),
								},
							],
						}}
					>
						<div className="flex cursor-pointer items-center">
							<LucideIcon
								name="languages"
								size={20}
							/>
						</div>
					</Dropdown>
				</Space>
			</div>
			{/* DifyChat 组件 */}
			<div className="flex-1 overflow-hidden">
				<DifyChat
					apiBase={config.apiBase}
					apiKey={config.apiKey}
					user={config.user || undefined}
					theme={theme}
					language={language}
					onError={e => console.error('DifyChat 连接错误:', e)}
				/>
			</div>
		</div>
	)
}
