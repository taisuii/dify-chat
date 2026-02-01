/**
 * 构建后注入：在使用 React.createElement 但未 import React 的 dist 文件顶部添加 React 引用。
 * 解决 rslib lib 构建部分文件仍输出经典 JSX 导致消费者报 "React is not defined" 的问题。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')

function walk(dir, ext, list = []) {
  if (!fs.existsSync(dir)) return list
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) walk(full, ext, list)
    else if (name.endsWith(ext)) list.push(full)
  }
  return list
}

function hasReactInScope(content) {
  return /import\s+React\s+from\s+['"]react['"]/.test(content) || /(?:var|const)\s+React\s+=\s+require\s*\(\s*['"]react['"]\s*\)/.test(content)
}

function needsReact(content) {
  return /React\.createElement/.test(content) && !hasReactInScope(content)
}

const jsFiles = [...walk(distDir, '.js'), ...walk(distDir, '.cjs')]
let count = 0
for (const file of jsFiles) {
  let content = fs.readFileSync(file, 'utf-8')
  if (!needsReact(content)) continue
  const isCjs = file.endsWith('.cjs')
  const line = isCjs ? "var React = require('react');\n" : "import React from 'react';\n"
  fs.writeFileSync(file, line + content)
  count++
}
if (count > 0) console.log(`  Injected React import into ${count} file(s).`)
