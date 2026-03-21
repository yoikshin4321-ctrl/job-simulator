/**
 * 깨진 빌드 캐시 제거 (OneDrive / 예전 distDir 잔여물)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dirs = ['.next', 'next-cache', 'next-dist']

for (const d of dirs) {
  const p = path.join(root, d)
  try {
    fs.rmSync(p, { recursive: true, force: true })
    console.log('removed:', p)
  } catch (e) {
    console.warn('skip:', p, e?.message || e)
  }
}

const legacyCache = path.join(homedir(), '.cache', 'job-simulator-next')
try {
  fs.rmSync(legacyCache, { recursive: true, force: true })
  console.log('removed:', legacyCache)
} catch {
  // ignore
}

console.log('Done. Run: npm run dev')
