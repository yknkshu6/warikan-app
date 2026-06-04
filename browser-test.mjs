import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
const errors = []

page.on('console', msg => {
  if (msg.type() === 'error') {
    console.log(`[CONSOLE ERROR] ${msg.text()}`)
    errors.push(msg.text())
  }
})
page.on('pageerror', err => {
  console.log(`[PAGE ERROR] ${err.message}`)
  errors.push(err.message)
})

// ホームページアクセス
console.log('ホームページにアクセス...')
await page.goto('http://127.0.0.1:3000')
await page.waitForLoadState('load')
await page.waitForTimeout(3000)

// スペース作成フォーム入力
console.log('スペース作成...')
await page.getByPlaceholder('マイスペース').fill('ブラウザテスト')
const createBtn = page.getByRole('button', { name: /スペースを作成/ })
await createBtn.click()
await page.waitForNavigation({ waitUntil: 'load' })

const newSpaceId = page.url().split('/')[3]
console.log(`新規スペース作成完了: ${newSpaceId}`)
await page.waitForTimeout(2000)
await page.screenshot({ path: 'browser-test-space.png' })

// 支出一覧ページにナビゲート
console.log('支出一覧ページへ...')
const expensesLink = page.getByRole('link', { name: /支出一覧/ })
if (await expensesLink.isVisible().catch(() => false)) {
  await expensesLink.click()
  await page.waitForLoadState('load')
} else {
  await page.goto(`http://127.0.0.1:3000/${newSpaceId}/expenses`)
  await page.waitForLoadState('load')
}

await page.waitForTimeout(3000)
await page.screenshot({ path: 'browser-test-expenses.png' })
console.log('支出一覧ページのスクリーンショット保存完了')

await browser.close()

console.log(`\nエラー (${errors.length}件):`)
errors.forEach(e => console.log(`  - ${e.substring(0, 100)}`))
