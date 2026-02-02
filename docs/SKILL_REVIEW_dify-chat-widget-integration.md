# dify-chat-widget-integration Skill 审查报告

对照 `dify-chat-widget` 项目代码库，对 `dify-chat-widget-integration` skill 的疏漏与可补充点进行审查。

---

## 一、需修正或确认的点

### 1. GitHub 仓库 URL 可能不一致

**现状**：skill 中写的是 `taisuii/dify-chat`，而当前项目 `packages/widget/package.json` 的 repository 为 `taisuii/dify-chat-widget`。

**建议**：确认实际对外使用的仓库名。若为 `dify-chat-widget`，需将 skill 中所有 `taisuii/dify-chat` 替换为 `taisuii/dify-chat-widget`。

---

### 2. 对接清单遗漏「ThemeProvider 包裹」

**现状**：对接清单表格未明确列出「必须用 ThemeProvider/ThemeContextProvider 包裹 DifyChat」。

**影响**：接入方若忘记包裹，`useThemeContext()` 会报错（无 Provider 上下文）。

**建议**：在对接清单中新增一行：

| 项 | 必须？ | 说明 | 不做的后果 |
|----|--------|------|------------|
| **0. ThemeProvider 包裹** | ✅ 必须 | 用 `ThemeContextProvider` 或 `ThemeProvider` 包裹包含 DifyChat 的整棵组件树 | `useThemeContext` 报错、主题不生效 |

---

### 3. Peer Dependencies 未包含 i18next

**现状**：skill 的 Peer Dependencies 只写了 `react-i18next`，未写 `i18next`。而 `addDifyChatI18n(i18n)` 需要 i18next 实例。

**建议**：在 Peer Dependencies 或「最小依赖清单」中补充 `i18next`，例如：

```json
{
  "antd": ">=5.0.0",
  "react": ">=18.0.0",
  "react-dom": ">=18.0.0",
  "react-i18next": ">=14.0.0",
  "i18next": ">=25.0.0"
}
```

---

### 4. 常见问题「样式不生效」编号混乱

**现状**：常见问题写「确保对接清单中 **1、2、4** 已实现」，但列举了 5 条（1–5），且第 2 条是 ThemeProvider，第 3 条是 Tailwind，容易混淆。

**建议**：改为「确保以下 5 项均已实现」，并统一编号 1–5，避免「1、2、4」这种跳跃式表述。

---

## 二、建议补充的说明

### 5. ThemeProvider 与 ThemeContextProvider 的关系

**现状**：最简示例用 `ThemeContextProvider`，带主题切换示例用 `ThemeProvider`，未说明两者关系。

**建议**：在「基础用法」或「常见问题」中补充一句：

> `ThemeProvider` 是 `ThemeContextProvider` 的别名，两者等效，可任选其一。

---

### 6. Tailwind theme.extend.colors 完整列表

**现状**：skill 仅写「theme-text、theme-main-bg、theme-splitter 等」，未给出完整列表。

**建议**：补充完整配置示例（与 `fixtures/tgz-consumer/tailwind.config.js` 一致）：

```js
theme: {
  extend: {
    colors: {
      'theme-text': 'var(--theme-text-color)',
      'theme-desc': 'var(--theme-desc-color)',
      'theme-bg': 'var(--theme-bg-color)',
      'theme-main-bg': 'var(--theme-main-bg-color)',
      'theme-btn-bg': 'var(--theme-btn-bg-color)',
      'theme-border': 'var(--theme-border-color)',
      'theme-splitter': 'var(--theme-splitter-color)',
      'theme-button-border': 'var(--theme-button-border-color)',
      'theme-success': 'var(--theme-success-color)',
      'theme-warning': 'var(--theme-warning-color)',
      'theme-danger': 'var(--theme-danger-color)',
      'theme-code-block-bg': 'var(--theme-code-block-bg-color)',
    },
  },
},
```

---

### 7. postcss.config.js 示例

**现状**：提到「可参考 fixtures/tgz-consumer 的 postcss.config.js」，但未给出内容。

**建议**：补充简短示例：

```js
export default {
  plugins: {
    tailwindcss: {},
  },
}
```

---

### 8. i18n 使用 LanguageDetector 时的依赖

**现状**：i18n 示例中使用了 `i18next-browser-languagedetector`，但最小依赖清单未列出。

**建议**：在「国际化」小节注明：若使用 `LanguageDetector`，需安装 `i18next-browser-languagedetector`。

---

### 9. 方式 B 的 CSS 变量缺少 theme-primary-color（.dark）

**现状**：方式 B 的 `:root` 中有 `--theme-primary-color`，但 `.dark` 中未定义。`theme-default.css` 的 `.dark` 也未定义 `--theme-primary-color`。

**结论**：与项目一致，无需修改。若接入方自定义深色主色，可自行在 `.dark` 中补充。

---

### 10. 本地 tgz 安装路径示例

**现状**：方式二写的是 `/path/to/dify-chat/...`，对 Windows 用户不够友好。

**建议**：可补充 Windows 示例，如 `file:../../dist-packages/dify-chat-xxx-latest.tgz` 或使用 `pnpm.overrides` 的 `file:` 写法（与 `fixtures/tgz-consumer` 一致）。

---

## 三、已核对无误的部分

- `addDifyChatI18n` 的用法与项目一致
- `theme-default.css` 的引入路径正确
- DifyChat Props 与 `DifyChatProps` 接口一致
- Tailwind content 路径 `node_modules/@dify-chat/widget/dist/**/*.js` 正确
- 包结构说明与项目一致
- ConfigProvider locale 使用 `i18n.language?.startsWith('zh')` 合理，兼容 zh-CN、zh-TW 等

---

## 四、可选增强

1. **CRA / Webpack 5 兼容**：`docs/INTEGRATION_WIDGET.md` 中有 CRA + Webpack 5、fullySpecified 等说明，skill 可简要提及「CRA 一般开箱即用，遇解析错误可参考仓库 INTEGRATION_WIDGET.md」。
2. **React 未定义**：文档提到构建后可能报 "React is not defined"，skill 可在常见问题中加一条简要说明。
3. **pnpm.overrides 示例**：对「先装 widget 再补装」的场景，可补充完整的 overrides 示例（与 `docs/INTEGRATION_WIDGET.md` 一致）。
