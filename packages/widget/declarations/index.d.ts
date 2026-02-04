/**
 * @dify-chat/widget 公开 API 类型声明
 * 手写声明，供 tgz 发布使用；内部 TS 严格检查未全部通过时仍可提供类型提示。
 */
import type { ComponentType } from 'react'
import type { i18n } from 'i18next'

/** 小窗口/嵌入场景的布局配置 */
export interface ChatLayoutConfig {
	/** 对话区 InfiniteScroll 的 minHeight，小窗口时用 '100%' 或 'auto' */
	containerMinHeight?: string | number
	/** 侧边栏展开时的宽度（px），小窗口时可设为 200 等 */
	sidebarWidth?: number
	/** 侧边栏是否默认收起，小窗口时建议 true */
	sidebarCollapsedByDefault?: boolean
}

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
	/** 小窗口/嵌入场景布局配置 */
	layout?: ChatLayoutConfig
}

export const DifyChat: ComponentType<DifyChatProps>

/** 将 Widget 内置文案注入到指定 i18n 实例；接入方在 i18n init 完成后调用。 */
export function addDifyChatI18n(instance?: i18n): void

/** Widget 内置英文文案（可合并到自定义 i18n） */
export const enResources: Record<string, unknown>
/** Widget 内置中文文案（可合并到自定义 i18n） */
export const zhResources: Record<string, unknown>
