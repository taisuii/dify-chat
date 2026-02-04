import i18n from 'i18next'
import type { i18n as I18nInstance } from 'i18next'

import { enResources, zhResources } from './i18n-resources'

/** 默认注入的 locale 列表，覆盖 zh/en 及 next-i18next 常用的 zh-CN/en-US */
const DEFAULT_LOCALES = [
	['en', enResources],
	['zh', zhResources],
	['en-US', enResources],
	['zh-CN', zhResources],
] as const

/**
 * 将 Widget 内置文案注入到指定 i18n 实例。
 * 接入方在入口 init 后调用 addDifyChatI18n(你的i18n)，或使用默认全局 i18n 时由 Widget 自动注入。
 * 默认注入 zh、en、zh-CN、en-US，兼容 next-i18next 等使用 zh-CN/en-US 的项目。
 */
export function addDifyChatI18n(instance?: I18nInstance): void {
	const target = instance ?? i18n
	if (typeof target?.addResourceBundle !== 'function') {
		// 打包后可能拿到与宿主不同的 i18next 副本，addResourceBundle 不存在；需接入方在 init 后显式调用 addDifyChatI18n(i18n)
		return
	}
	for (const [locale, resources] of DEFAULT_LOCALES) {
		target.addResourceBundle(locale, 'translation', resources, true, true)
	}
}

// 仅当全局 i18n 具备 addResourceBundle 时才自动注入（与宿主同一 i18next 副本时生效）
addDifyChatI18n()

export { enResources, zhResources }
export default i18n
