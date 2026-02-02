/**
 * 为 fixtures/tgz-consumer 写入 pnpm overrides，指向 dist-packages/*.tgz
 * 用于在仓库内用 tgz 安装启动 fixture，查看接入效果。
 *
 * 使用方式：
 *   node scripts/prepare-fixture-tgz.mjs           # 仅写入 overrides（需先 pack:local）
 *   node scripts/prepare-fixture-tgz.mjs --pack    # 若无 tgz 则先执行 pack:local
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const outputDir = path.join(rootDir, 'dist-packages')
const fixtureDir = path.join(rootDir, 'fixtures', 'tgz-consumer')
const fixturePkgPath = path.join(fixtureDir, 'package.json')
const needPack = process.argv.includes('--pack')

function tgzNameToPackageName(tgzName) {
  const base = tgzName.replace(/\.tgz$/, '')
  const lastDash = base.lastIndexOf('-')
  if (lastDash === -1) return null
  const versionPart = base.slice(lastDash + 1)
  if (!/^(\d+\.\d+\.\d+|latest)$/.test(versionPart)) return null
  const namePart = base.slice(0, lastDash)
  if (!namePart.startsWith('dify-chat-')) return null
  const subName = namePart.slice('dify-chat-'.length)
  return `@dify-chat/${subName}`
}

function main() {
  if (needPack || !fs.existsSync(outputDir)) {
    const tgzExists = fs.existsSync(outputDir) && fs.readdirSync(outputDir).some((f) => f.endsWith('.tgz'))
    if (!tgzExists) {
      console.log('dist-packages/ 无 tgz，先执行 pack:local...\n')
      execSync('node scripts/pack-packages.mjs', { cwd: rootDir, stdio: 'inherit' })
    }
  }

  // 优先使用 *-latest.tgz，确保每个包只取一个 override
  const allTgz = fs.existsSync(outputDir) ? fs.readdirSync(outputDir).filter((f) => f.endsWith('.tgz')) : []
  const latestTgz = allTgz.filter((f) => f.endsWith('-latest.tgz'))
  const tgzFiles = latestTgz.length > 0 ? latestTgz : allTgz
  if (tgzFiles.length === 0) {
    console.error('请先执行: pnpm run pack:local')
    process.exit(1)
  }

  const overrides = {}
  for (const tgz of tgzFiles) {
    const pkgName = tgzNameToPackageName(tgz)
    if (pkgName) {
      overrides[pkgName] = `file:../../dist-packages/${tgz}`
    }
  }

  const pkg = JSON.parse(fs.readFileSync(fixturePkgPath, 'utf-8'))
  pkg.pnpm = pkg.pnpm || {}
  pkg.pnpm.overrides = overrides
  fs.writeFileSync(fixturePkgPath, JSON.stringify(pkg, null, 2) + '\n')
  console.log('fixtures/tgz-consumer overrides 已更新，指向 dist-packages/*.tgz')
}

main()
