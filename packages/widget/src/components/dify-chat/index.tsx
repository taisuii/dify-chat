/**
 * DifyChat - 封装的 Dify 对话组件（复用官方 MainLayout + ChatLayout + ChatboxWrapper）
 *
 * 只需传入 apiBase、apiKey 即可使用，体验与官网一致（含丝滑 suggestion、开场白等），
 * 无应用切换、无 Debug，适合嵌入其他网站。
 *
 * 使用示例：
 * ```tsx
 * import { DifyChat } from '@dify-chat/widget'
 * 
 * // 基础用法
 * <DifyChat apiBase="https://api.dify.ai/v1" apiKey="app-xxx" />
 * 
 * // 带用户ID
 * <DifyChat apiBase="..." apiKey="..." user="user-123" />
 * 
 * // 非受控模式：设置初始值，内部切换时通知外部
 * <DifyChat
 *   apiBase="..."
 *   apiKey="..."
 *   initialTheme="dark"
 *   initialLanguage="zh"
 *   onThemeChange={(theme) => {
 *     // 组件内部切换主题时，同步到网站
 *     console.log('主题切换:', theme)
 *   }}
 *   onLanguageChange={(lang) => {
 *     // 组件内部切换语言时，同步到网站
 *     console.log('语言切换:', lang)
 *   }}
 * />
 * 
 * // 受控模式：网站切换时，组件同步（推荐用于嵌入场景）
 * const [theme, setTheme] = useState('dark')
 * const [language, setLanguage] = useState('zh')
 * 
 * // 网站切换主题时
 * const handleWebsiteThemeChange = (newTheme) => {
 *   setTheme(newTheme) // DifyChat 会自动同步
 * }
 * 
 * <DifyChat
 *   apiBase="..."
 *   apiKey="..."
 *   theme={theme}        // 受控：网站改变时组件同步
 *   language={language}   // 受控：网站改变时组件同步
 *   onThemeChange={(theme) => {
 *     // 组件内部切换时，同步到网站
 *     setTheme(theme)
 *   }}
 *   onLanguageChange={(lang) => {
 *     // 组件内部切换时，同步到网站
 *     setLanguage(lang)
 *   }}
 * />
 * ```
 */

import { createDifyApiInstance } from '@dify-chat/api'
import {
	AppContextProvider,
	DEFAULT_APP_SITE_SETTING,
	type ICurrentApp,
	type IDifyAppItem,
} from '@dify-chat/core'
import { generateUuidV4, LocalStorageKeys, LocalStorageStore } from '@dify-chat/helpers'
import { ThemeModeEnum } from '@dify-chat/theme'
import { Button, Empty, message, Spin } from 'antd'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useThemeContext } from '@dify-chat/theme'

import MainLayout from '../../layout/main-layout'
import type { ChatLayoutConfig } from '../../layout/chat-layout'
import { useGlobalStore } from '../../store'
import type { IGetAppParametersResponse } from '@dify-chat/api'

export interface DifyChatProps {
	apiBase: string
	apiKey: string
	user?: string
	/** 初始主题模式（非受控，仅在挂载时设置一次） */
	initialTheme?: 'light' | 'dark' | 'system'
	/** 初始语言（非受控，仅在挂载时设置一次） */
	initialLanguage?: 'en' | 'zh'
	/** 受控主题模式（外部可随时改变，组件会同步） */
	theme?: 'light' | 'dark' | 'system'
	/** 受控语言（外部可随时改变，组件会同步） */
	language?: 'en' | 'zh'
	/** 主题变化回调（组件内部切换时通知外部） */
	onThemeChange?: (theme: 'light' | 'dark' | 'system') => void
	/** 语言变化回调（组件内部切换时通知外部） */
	onLanguageChange?: (language: 'en' | 'zh') => void
	onError?: (error: Error) => void
	/**
	 * 小窗口/嵌入场景布局配置。
	 * 悬浮抽屉、侧边栏、弹窗等非全屏场景下，建议传入以正确适配。
	 */
	layout?: ChatLayoutConfig
}

export function DifyChat(props: DifyChatProps) {
	const {
		apiBase,
		apiKey,
		user: userProp,
		initialTheme,
		initialLanguage,
		theme: controlledTheme,
		language: controlledLanguage,
		onThemeChange,
		onLanguageChange,
		onError,
		layout,
	} = props
	const [defaultUser] = useState(() => generateUuidV4())
	const user = userProp ?? defaultUser

	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [currentApp, setCurrentApp] = useState<ICurrentApp | undefined>(undefined)
	const [isInitialized, setIsInitialized] = useState(false)

	const { setDifyApi: setGlobalDifyApi } = useGlobalStore()
	const { themeMode, setThemeMode } = useThemeContext()
	const { i18n } = useTranslation()
	const onErrorRef = useRef(onError)
	const onThemeChangeRef = useRef(onThemeChange)
	const onLanguageChangeRef = useRef(onLanguageChange)
	const lastControlledThemeRef = useRef(controlledTheme)
	const lastControlledLanguageRef = useRef(controlledLanguage)
	onErrorRef.current = onError
	onThemeChangeRef.current = onThemeChange
	onLanguageChangeRef.current = onLanguageChange

	// 设置初始主题和语言（非受控模式，仅在挂载时执行一次）
	useEffect(() => {
		if (isInitialized) return
		if (initialTheme !== undefined && controlledTheme === undefined) {
			const themeModeValue =
				initialTheme === 'system'
					? ThemeModeEnum.SYSTEM
					: initialTheme === 'dark'
						? ThemeModeEnum.DARK
						: ThemeModeEnum.LIGHT
			LocalStorageStore.set(LocalStorageKeys.THEME_MODE, themeModeValue)
			setThemeMode(themeModeValue)
		}
		if (initialLanguage !== undefined && controlledLanguage === undefined) {
			i18n.changeLanguage(initialLanguage)
		}
		setIsInitialized(true)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []) // 只在挂载时执行一次

	// 受控模式：外部改变 theme prop 时同步
	useEffect(() => {
		if (controlledTheme !== undefined && controlledTheme !== lastControlledThemeRef.current) {
			lastControlledThemeRef.current = controlledTheme
			const themeModeValue =
				controlledTheme === 'system'
					? ThemeModeEnum.SYSTEM
					: controlledTheme === 'dark'
						? ThemeModeEnum.DARK
						: ThemeModeEnum.LIGHT
			LocalStorageStore.set(LocalStorageKeys.THEME_MODE, themeModeValue)
			setThemeMode(themeModeValue)
		}
	}, [controlledTheme, setThemeMode])

	// 受控模式：外部改变 language prop 时同步
	useEffect(() => {
		if (controlledLanguage !== undefined && controlledLanguage !== lastControlledLanguageRef.current) {
			lastControlledLanguageRef.current = controlledLanguage
			i18n.changeLanguage(controlledLanguage)
		}
	}, [controlledLanguage, i18n])

	// 监听内部主题变化（非受控模式或内部切换时通知外部）
	useEffect(() => {
		// 如果是受控模式，不通知外部（避免循环）
		if (controlledTheme !== undefined) return
		const currentTheme =
			themeMode === ThemeModeEnum.SYSTEM
				? 'system'
				: themeMode === ThemeModeEnum.DARK
					? 'dark'
					: 'light'
		onThemeChangeRef.current?.(currentTheme)
	}, [themeMode, controlledTheme])

	// 监听内部语言变化（非受控模式或内部切换时通知外部）
	useEffect(() => {
		// 如果是受控模式，不通知外部（避免循环）
		if (controlledLanguage !== undefined) return
		const currentLang = i18n.language === 'zh' ? 'zh' : 'en'
		onLanguageChangeRef.current?.(currentLang)
	}, [i18n.language, controlledLanguage])

	const connect = useCallback(async () => {
		if (!apiBase || !apiKey) return
		setError(null)
		setLoading(true)
		try {
			const api = createDifyApiInstance({ apiBase, apiKey, user })
			const timeout = new Promise<never>((_, reject) =>
				setTimeout(() => reject(new Error('连接超时，请检查 API 地址和网络')), 10000),
			)

			const [info, params, site] = (await Promise.race([
				Promise.all([
					api.getAppInfo(),
					api.getAppParameters(),
					api.getAppSiteSetting().catch(() => DEFAULT_APP_SITE_SETTING),
				]),
				timeout,
			])) as [IDifyAppItem['info'], IGetAppParametersResponse, typeof DEFAULT_APP_SITE_SETTING]

			const config: IDifyAppItem = {
				id: 'simple',
				isEnabled: 1,
				info,
				requestConfig: { apiBase, apiKey },
			}

			setGlobalDifyApi(api as any)
			setCurrentApp({ config, parameters: params, site })
		} catch (e) {
			const err = e instanceof Error ? e : new Error(String(e))
			setError(err.message)
			onErrorRef.current?.(err)
			message.error(`连接失败: ${err.message}`)
		} finally {
			setLoading(false)
		}
		// 仅依赖 apiBase/apiKey/user，避免 onError、setGlobalDifyApi 引用变化导致 useEffect 反复跑 → 一直请求
		// eslint-disable-next-line react-hooks/exhaustive-deps -- onError 用 ref，setGlobalDifyApi 仅调用不参与闭包
	}, [apiBase, apiKey, user])

	useEffect(() => {
		connect()
	}, [connect])

	if (error) {
		return (
			<div className="flex h-full items-center justify-center bg-theme-bg">
				<Empty
					description={
						<span>
							连接失败：{error}
							<br />
							<Button type="link" onClick={connect}>重试</Button>
						</span>
					}
				/>
			</div>
		)
	}

	if (loading || !currentApp) {
		return (
			<div className="flex h-full items-center justify-center bg-theme-bg">
				<Spin size="large" />
			</div>
		)
	}

	return (
		<div className="h-full w-full">
			<AppContextProvider
				value={{
					appLoading: false,
					currentAppId: 'simple',
					setCurrentAppId: () => {},
					currentApp,
					setCurrentApp,
				}}
			>
				<MainLayout
					initLoading={false}
					headerMode="none"
					renderCenterTitle={info => (info ? <span>{info.name}</span> : null)}
					extComponents={null}
					layout={layout}
				/>
			</AppContextProvider>
		</div>
	)
}