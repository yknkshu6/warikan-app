import { chromium } from 'playwright'
import { mkdir } from 'fs/promises'

const SCREENSHOTS = 'smoke-screenshots'
await mkdir(SCREENSHOTS, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

const errors = []
const warnings = []
page.on('console', msg => {
  if (msg.type() === 'error' && !msg.text().includes('DevTools')) errors.push(msg.text())
  if (msg.type() === 'warning') warnings.push(msg.text())
})
page.on('pageerror', err => {
  console.log(`[PAGEERROR] ${err.message}`)
  errors.push(err.message)
})
page.on('requestfailed', req => {
  console.log(`[REQFAIL] ${req.url()} - ${req.failure()?.errorText}`)
})

const BASE = 'http://127.0.0.1:3000'

// ─── ホームページから開始 ──────────────────────────────────
console.log('1. ホームページ...')
const r1 = await page.goto(BASE, { waitUntil: 'load', timeout: 15000 })
console.log(`   HTTP: ${r1?.status()}, URL: ${page.url()}`)
await page.waitForTimeout(2000)
await page.screenshot({ path: `${SCREENSHOTS}/A-home.png` })

// ─── スペースホームに移動 ──────────────────────────────────
console.log('2. スペースホーム...')
const r2 = await page.goto(`${BASE}/testsp01`, { waitUntil: 'load', timeout: 15000 })
console.log(`   HTTP: ${r2?.status()}, URL: ${page.url()}`)
await page.waitForTimeout(3000)
await page.screenshot({ path: `${SCREENSHOTS}/B-space-home.png` })
console.log(`   ページタイトル: "${await page.title()}"`)
console.log(`   本文テキスト: "${(await page.textContent('body'))?.substring(0, 100)}"`)

// ─── 支出一覧に移動 ──────────────────────────────────────
console.log('3. 支出一覧...')
const r3 = await page.goto(`${BASE}/testsp01/expenses`, { waitUntil: 'load', timeout: 15000 })
console.log(`   HTTP: ${r3?.status()}, URL: ${page.url()}`)
await page.waitForTimeout(3000)
await page.screenshot({ path: `${SCREENSHOTS}/C-expenses.png` })
console.log(`   本文テキスト: "${(await page.textContent('body'))?.substring(0, 200)}"`)

await browser.close()

console.log('\nエラー:', errors.length ? errors.join('; ') : 'なし')
console.log('警告:', warnings.length ? warnings.slice(0, 3).join('; ') : 'なし')
