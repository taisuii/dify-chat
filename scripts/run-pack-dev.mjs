/**
 * 在临时目录中用 tgz 安装并启动开发服务器，避免 pnpm 发现 workspace 导致安装失败。
 * 流程：pack:local（若无 tgz）→ 复制 fixture 到临时目录 → 写入 overrides（绝对路径）→ install → dev
 *
 * 使用方式：
 *   pnpm run pack:dev
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
let workDir = null

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

function cleanup() {
  if (workDir && fs.existsSync(workDir)) {
    try {
      fs.rmSync(workDir, { recursive: true })
    } catch (_) {}
  }
}

function main() {
  if (!fs.existsSync(outputDir) || !fs.readdirSync(outputDir).some((f) => f.endsWith('.tgz'))) {
    console.log('Step 1: Build and pack (pack:local)...\n')
    execSync('node scripts/pack-packages.mjs', { cwd: rootDir, stdio: 'inherit' })
  } else {
    console.log('Step 1: 使用已有 dist-packages/*.tgz\n')
  }

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

  workDir = path.join(os.tmpdir(), `dify-chat-widget-pack-dev-${Date.now()}`)
  console.log('Step 2: Copy fixture to temp dir:', workDir)
  copyDir(fixtureDir, workDir)

  const pkgPath = path.join(workDir, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  pkg.pnpm = pkg.pnpm || {}
  pkg.pnpm.overrides = overrides
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

  console.log('Step 3: pnpm install in temp dir...\n')
  execSync('pnpm install', { cwd: workDir, stdio: 'inherit' })

  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)

  console.log('Step 4: 启动开发服务器（Ctrl+C 退出）...\n')
  execSync('pnpm dev', { cwd: workDir, stdio: 'inherit' })
}

try {
  main()
} catch (err) {
  cleanup()
  console.error(err)
  process.exit(1)
}
cleanup()
