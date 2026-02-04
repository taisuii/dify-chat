# Dify Chat Widget 接入障碍与修复记录

本文档记录接入方在集成 `@dify-chat/widget` 时遇到的障碍，以及模块侧已实施的修复。

## 1. i18n locale 不匹配（zh-CN / en-US）— 已修复

### 原问题

| 项目 | 说明 |
|------|------|
| **只支持 zh/en** | `addDifyChatI18n` 曾仅注入 `zh`、`en`，未覆盖 `zh-CN`、`en-US` 等常见 locale |
| **next-i18next 兼容性** | 使用 next-i18next 的项目常用 `zh-CN`、`en-US`，与 Widget 注入的 `zh`、`en` 不匹配，导致界面显示 key |

### 已实施修复

- `addDifyChatI18n` 现已默认注入 `zh`、`en`、`zh-CN`、`en-US`，兼容 next-i18next
- 接入方无需额外 workaround

---

## 2. next-i18next 文档 — 已补充

- 在 SKILL.md、INTEGRATION_WIDGET.md 中说明 next-i18next 接入方式
- 建议 `fallbackLng: ['zh-CN', 'en-US', 'zh', 'en']` 以兼容不同 locale 风格

---

## 3. 多实例风险（react-i18next / i18next）— 已修复

### 原问题

| 项目 | 说明 |
|------|------|
| **多实例** | 若 Widget 与宿主使用不同的 i18next 副本，`addDifyChatI18n(i18n)` 注入的文案可能无法被 Widget 使用 |
| **i18next 打包** | 曾将 `i18next` 作为 `dependencies`，可能被打包进 dist |

### 已实施修复

- `i18next` 已改为 `peerDependencies`，不打包进 dist
- 文档中强调：接入方必须在 i18n init 完成后显式调用 `addDifyChatI18n(i18n)`，并传入宿主使用的 i18n 实例

---

## 接入方最小示例（含 next-i18next）

```ts
import { addDifyChatI18n } from '@dify-chat/widget'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

void i18n.use(initReactI18next).init({
  fallbackLng: ['zh-CN', 'en-US', 'zh', 'en'],
  interpolation: { escapeValue: false },
}).then(() => {
  addDifyChatI18n(i18n)
})
```
