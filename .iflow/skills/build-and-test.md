---
name: build-and-test
description: 构建项目、打包并测试导入 dify-chat-widget 组件
---

# 构建并测试 dify-chat-widget

执行完整的构建和测试流程，确保组件可以正常打包和使用。

## 执行步骤

1. **清理旧的构建产物**
   ```bash
   Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
   Remove-Item dify-chat-widget-*.tgz -ErrorAction SilentlyContinue
   ```

2. **构建项目**
   ```bash
   npm run build
   ```

3. **打包项目**
   ```bash
   npm pack
   ```

4. **在测试应用中安装并测试**
   ```bash
   cd test-app
   npm install ../dify-chat-widget-*.tgz
   npm run dev
   ```

## 注意事项

- 确保所有依赖都已安装（运行 `npm install`）
- 构建成功后会生成 dist 目录
- 打包后会生成 .tgz 文件
- 测试应用会自动启动开发服务器

## 常见问题

如果遇到构建错误，请检查：
- TypeScript 类型定义是否正确
- 所有依赖是否都已安装
- Vite 配置是否正确

如果测试导入失败，请检查：
- package.json 中的 main/module 字段是否正确
- dist 目录中的文件是否生成
- peerDependencies 是否满足要求