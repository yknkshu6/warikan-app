import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

await page.goto('http://localhost:3000')
await page.waitForLoadState('load')
await page.waitForTimeout(2000)

// 現在のURL
const url = page.url()
console.log('URL:', url)

// ページタイトル
const title = await page.title()
console.log('タイトル:', title)

// 表示中のテキスト
const bodyText = await page.textContent('body')
const preview = bodyText?.substring(0, 200).replace(/\n/g, ' ')
console.log('ページ内容:', preview)

// スクリーンショット
await page.screenshot({ path: 'check-current.png' })
console.log('\n✓ スクリーンショット保存: check-current.png')

await browser.close()
