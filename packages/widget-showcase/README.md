# DifyChat Widget Showcase

专门用于展示 `@dify-chat/widget` 中 DifyChat 组件的使用效果，结构简洁，无登录与路由，适合快速预览与演示。

## 开发

```bash
pnpm dev:showcase
```

或

```bash
pnpm --filter dify-chat-widget-showcase dev
```

访问 http://localhost:5300/widget-showcase 查看效果。

## 配置

在 `src/pages/showcase.tsx` 中修改 `apiBase`、`apiKey`、`user` 等参数以连接你的 Dify 应用。
