/**
 * 将 api、core、helpers、theme、widget 打包成可安装的 npm 压缩包
 * 输出到 dist-packages/ 目录
 *
 * 使用方式：
 *   pnpm run pack:local
 *
 * 在其他项目中安装：
 *   pnpm add ./path/to/dify-chat-widget/dist-packages/*.tgz
 *   或依次安装各个 tgz 文件
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const packagesDir = path.join(rootDir, 'packages')
const outputDir = path.join(rootDir, 'dist-packages')

const PACKAGES = ['helpers', 'core', 'api', 'theme', 'widget']

function getPackageVersion(pkgName) {
	const pkgPath = path.join(packagesDir, pkgName, 'package.json')
	const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
	return pkg.version
}

function replaceWorkspaceDeps(pkgJson, packageName) {
	const depMap = {
		helpers: {},
		core: { '@dify-chat/helpers': getPackageVersion('helpers') },
		api: {
			'@dify-chat/core': getPackageVersion('core'),
			'@dify-chat/helpers': getPackageVersion('helpers'),
		},
		theme: { '@dify-chat/helpers': getPackageVersion('helpers') },
		widget: {
			'@dify-chat/api': getPackageVersion('api'),
			'@dify-chat/core': getPackageVersion('core'),
			'@dify-chat/helpers': getPackageVersion('helpers'),
			'@dify-chat/theme': getPackageVersion('theme'),
		},
	}

	const deps = depMap[packageName]
	if (!deps || Object.keys(deps).length === 0) return pkgJson

	const modified = { ...pkgJson }
	const replaceInDeps = (depsObj) => {
		if (!depsObj) return
		for (const [dep, version] of Object.entries(deps)) {
			if (depsObj[dep] === 'workspace:^' || depsObj[dep]?.startsWith('workspace:')) {
				depsObj[dep] = `^${version}`
			}
		}
	}

	replaceInDeps(modified.dependencies)
	return modified
}

function packPackage(packageName) {
	const pkgDir = path.join(packagesDir, packageName)
	const pkgPath = path.join(pkgDir, 'package.json')
	const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
	const modifiedPkg = replaceWorkspaceDeps(pkg, packageName)

	// 写入临时 package.json
	fs.writeFileSync(pkgPath, JSON.stringify(modifiedPkg, null, 2))
	try {
		execSync('pnpm pack', { cwd: pkgDir, stdio: 'inherit' })
	} finally {
		// 恢复原始 package.json
		fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
	}

	// 移动 tgz 到 outputDir
	const tgzName = `${pkg.name.replace('@', '').replace('/', '-')}-${pkg.version}.tgz`
	const tgzSrc = path.join(pkgDir, tgzName)
	const tgzDest = path.join(outputDir, tgzName)
	if (fs.existsSync(tgzSrc)) {
		fs.renameSync(tgzSrc, tgzDest)
		console.log(`  ✓ ${tgzName}`)
		return tgzName
	}
	return null
}

function buildPackage(pkgName) {
	const pkgDir = path.join(packagesDir, pkgName)
	console.log(`  Building ${pkgName}...`)
	execSync('pnpm build', { cwd: pkgDir, stdio: 'inherit' })
}

async function main() {
	console.log('Building packages in order...')
	// 按依赖顺序构建：helpers -> core/theme -> api -> widget
	buildPackage('helpers')
	buildPackage('core')
	buildPackage('theme')
	buildPackage('api')
	buildPackage('widget')

	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true })
	}

	console.log('\nPacking packages...')
	const packed = []
	for (const pkg of PACKAGES) {
		packed.push(packPackage(pkg))
	}

	console.log(`\nDone! Tarballs saved to dist-packages/\n`)
	console.log('在其他项目中安装（需一次性安装所有包）：')
	console.log('  pnpm add ./path/to/dify-chat-widget/dist-packages/*.tgz')
	console.log('\n或使用本地路径（开发时推荐）：')
	console.log('  pnpm add ./path/to/dify-chat-widget/packages/widget')
	console.log('  （需在 dify-chat-widget 目录下先执行 pnpm install）')
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
