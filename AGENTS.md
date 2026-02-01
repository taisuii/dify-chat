# AGENTS Guidelines for This Repository

## 仓库概览

Dify Chat 是一个基于 pnpm workspace 构建的 Monorepo 项目，包含以下几个子包(所有子包均存放在 packages 目录下)：

- api Dify API 的 Node.js 客户端库
- core 核心子包，存放核心抽象逻辑
- helpers 辅助工具函数
- theme 主题子包，提供整个应用的主题相关组件/样式
- widget 可复用的 Dify 聊天组件库，可被嵌入第三方页面
- widget-showcase 展示 DifyChat 组件使用效果的示例应用

## 依赖管理

当你需要自行安装/更新依赖时，请务必注意：本项目使用 pnpm-workspace 的 catalog 协议进行依赖管理，所有的依赖版本都是在根目录的 `pnpm-workspace.yaml` 文件的 `catalog` 部分，你需要按需修改该文件中的版本号，在对应子包然后在项目根目录运行 `pnpm install` 命令来安装/更新依赖。

## 样式处理

widget-showcase 使用 Tailwind CSS，版本在根目录 pnpm-workspace.yaml 的 catalog 部分定义。
