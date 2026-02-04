# DifyChat Widget 小窗口适配

当 DifyChat 嵌入**非全屏小窗口**（悬浮抽屉、侧边栏、弹窗、iframe 等）时，需传入 `layout` 配置以正确适配布局与滚动。

## 术语：非全屏小窗口

| 特征 | 说明 |
|------|------|
| 容器尺寸 | 高度通常 60vh～90vh 或固定像素（如 480px～720px）；宽度 400px～800px |
| 典型场景 | 悬浮抽屉、侧边栏、弹窗、iframe 嵌入、页面内嵌区块 |
| 与全屏区别 | 全屏时容器为 `height: 100vh`，Widget 内部 `minHeight: calc(100vh - 10.25rem)` 与容器匹配；小窗口时 100vh 远大于容器，导致布局异常 |

## 用法

```tsx
import { DifyChat } from '@dify-chat/widget'

// 小窗口场景：传入 layout
<DifyChat
  apiBase="..."
  apiKey="..."
  user="..."
  layout={{
    containerMinHeight: '100%',      // 对话区适配容器高度
    sidebarWidth: 200,               // 侧边栏宽度（px），默认 288
    sidebarCollapsedByDefault: true, // 默认收起侧边栏
  }}
/>
```

## layout 配置项

| 属性 | 类型 | 说明 |
|------|------|------|
| `containerMinHeight` | `string \| number` | InfiniteScroll 的 minHeight。全屏默认 `calc(100vh - 10.25rem)`；小窗口建议传 `'100%'` 以适配容器 |
| `sidebarWidth` | `number \| string` | 不传则根据父容器自适应（clamp(188px, 18%, 288px)）；传数字为固定 px |
| `sidebarCollapsedByDefault` | `boolean` | 侧边栏是否默认收起，默认 `false`。小窗口建议 `true` |

## 接入方容器建议

- 为 DifyChat 预留足够高度：`min-height: 480px` 或 `height: 60vh`
- 确保容器有明确高度，以便 `containerMinHeight: '100%'` 生效

## 模块侧已实施修改

1. **高度适配**：ChatboxWrapper 使用 `h-full` 适配父容器；小窗口时需传入 `layout.containerMinHeight: '100%'`，全屏默认 `calc(100vh - 10.25rem)` 以保证流式打字效果
2. **滚动逻辑**：新建/切换会话时滚动到顶部；发送消息后滚动到最新消息位置（column-reverse 下为 scrollTop=0）
3. **侧边栏**：默认根据父容器宽度自适应（窗口窄、全屏宽）；支持 `sidebarWidth` 固定、`sidebarCollapsedByDefault` 默认收起
