/**
 * 发布前验证：打包 → 在临时目录中安装 tgz → 构建
 * 模拟真实用户从 tgz 安装的流程，暴露缺失依赖、类型、产物等问题。
 * 使用临时目录避免 pnpm 发现 monorepo 根目录导致 workspace 安装。
 *
 * 使用方式：
 *   pnpm run pack:verify
 *
 * 流程：
 *   1. 执行 pack:local（构建并打包到 dist-packages/）
 *   2. 根据 dist-packages/*.tgz 生成 pnpm overrides（绝对路径）
 *   3. 将 fixtures/tgz-consumer 复制到临时目录并写入 overrides
 *   4. 在临时目录中 pnpm install && pnpm build
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const outputDir = path.join(rootDir, 'dist-packages')
const fixtureDir = path.join(rootDir, 'fixtures', 'tgz-consumer')

/**
 * 从 tgz 文件名解析出 npm 包名
 * 例: dify-chat-widget-0.1.0.tgz -> @dify-chat/widget
 */
function tgzNameToPackageName(tgzName) {
  const base = tgzName.replace(/\.tgz$/, '')
  const lastDash = base.lastIndexOf('-')
  if (lastDash === -1) return null
  const versionPart = base.slice(lastDash + 1)
  if (!/^\d+\.\d+\.\d+/.test(versionPart)) return null
  const namePart = base.slice(0, lastDash)
  if (!namePart.startsWith('dify-chat-')) return null
  const subName = namePart.slice('dify-chat-'.length)
  return `@dify-chat/${subName}`
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const name of fs.readdirSync(src)) {
    const srcPath = path.join(src, name)
    const destPath = path.join(dest, name)
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

function main() {
  console.log('Step 1: Build and pack (pack:local)...\n')
  execSync('node scripts/pack-packages.mjs', { cwd: rootDir, stdio: 'inherit' })

  const tgzFiles = fs.readdirSync(outputDir).filter((f) => f.endsWith('.tgz'))
  if (tgzFiles.length === 0) {
    console.error('No .tgz files in dist-packages/')
    process.exit(1)
  }

  const overrides = {}
  const outputDirAbs = path.resolve(rootDir, outputDir)
  for (const tgz of tgzFiles) {
    const pkgName = tgzNameToPackageName(tgz)
    if (pkgName) {
      overrides[pkgName] = `file:${path.join(outputDirAbs, tgz).replace(/\\/g, '/')}`
    }
  }

  const workDir = path.join(os.tmpdir(), `dify-chat-widget-verify-${Date.now()}`)
  console.log('\nStep 2: Copy fixture to temp dir:', workDir)
  copyDir(fixtureDir, workDir)

  const pkgPath = path.join(workDir, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  pkg.pnpm = pkg.pnpm || {}
  pkg.pnpm.overrides = overrides
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

  console.log('Step 3: pnpm install in temp dir...\n')
  execSync('pnpm install', { cwd: workDir, stdio: 'inherit' })

  console.log('\nStep 4: pnpm build in temp dir...\n')
  execSync('pnpm build', { cwd: workDir, stdio: 'inherit' })

  const withPreview = process.argv.includes('--preview')
  if (withPreview) {
    console.log('\nStep 5: 启动预览服务器（Ctrl+C 退出）...\n')
    console.log('  在浏览器打开上述地址可查看 tgz 接入效果。\n')
    execSync('pnpm preview', { cwd: workDir, stdio: 'inherit' })
  }

  try {
    fs.rmSync(workDir, { recursive: true })
  } catch (_) {}

  if (!withPreview) {
    console.log('\n✓ pack:verify passed. Tgz 安装与构建验证通过。')
  }
}

try {
  main()
} catch (err) {
  console.error(err)
  process.exit(1)
}
