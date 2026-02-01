# tgz-consumer

用于**发布前验证**与**查看接入效果**的 fixture：从 `dist-packages/*.tgz` 安装 `@dify-chat/widget` 与 `@dify-chat/theme`，模拟真实用户的安装与构建/运行。

- **不纳入 pnpm workspace**，单独 `pnpm install` 时依赖由 overrides 指向 tgz。
- **推荐在仓库根目录使用**：
  - `pnpm run pack:dev` — 若无 tgz 先打包，再在**临时目录**中复制本 fixture、安装 tgz 并启动开发服务器，浏览器打开即可查看接入效果（热更新）。在临时目录中运行可避免 workspace 导致安装失败。
  - `pnpm run pack:verify` — 在临时目录安装 tgz 并构建，验证「装 tgz → 构建」是否通过。
  - `pnpm run pack:verify:preview` — 同上，构建成功后启动预览服务器，可查看构建产物的接入效果。
- **手动测试**：根目录执行 `node scripts/prepare-fixture-tgz.mjs --pack` 后，进入本目录执行 `pnpm install`、`pnpm dev` 或 `pnpm build`。
