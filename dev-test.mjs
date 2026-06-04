import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
const errors = []

page.on('console', msg => {
  if (msg.type() === 'error' && !msg.text().includes('DevTools')) {
    errors.push(msg.text())
  }
})
page.on('pageerror', err => errors.push(err.message))

console.log('開発環境テスト開始...\n')

// 1. ホームページ
console.log('1. ホームページ')
await page.goto('http://localhost:3000')
await page.waitForLoadState('load')
await page.screenshot({ path: 'dev-home.png' })
console.log('   ✓ ホームページロード')

// 2. スペース作成（新規・クリーンな状態）
console.log('2. スペース作成（localStorage初期化）')
// localStorage をクリア
await page.evaluate(() => localStorage.clear())
console.log('   localStorage クリア完了')

await page.getByPlaceholder('マイスペース').fill('新規テストスペース')
await page.getByRole('button', { name: /スペースを作成/ }).click()
await page.waitForNavigation()
await page.waitForLoadState('load')
const spaceId = page.url().split('/')[3]
console.log(`   ✓ スペース作成: ${spaceId}`)

// 3. メンバーモーダル待機
console.log('3. メンバーモーダル待機')
await page.waitForTimeout(2000)
await page.screenshot({ path: 'dev-modal-check.png' })

const modalVisible = await page.locator('[role="dialog"]').isVisible().catch(() => false)
const memberText = await page.getByText('メンバーを選択してください').isVisible().catch(() => false)
const newMemberBtn = await page.getByText('新しいメンバーとして参加').isVisible().catch(() => false)

console.log(`   モーダル（dialog）: ${modalVisible ? '✓' : '✗'}`)
console.log(`   テキスト表示: ${memberText ? '✓' : '✗'}`)
console.log(`   参加ボタン: ${newMemberBtn ? '✓' : '✗'}`)

if (newMemberBtn) {
  await page.getByText('新しいメンバーとして参加').click()
  await page.waitForTimeout(1000)
  const nameInput = page.getByPlaceholder('例：太郎')
  if (await nameInput.isVisible()) {
    await nameInput.fill('テストメンバー')
    await page.waitForTimeout(500)
    await page.screenshot({ path: 'dev-member-input.png' })
    const submitBtn = page.getByRole('button', { name: /参加/ })
    if (await submitBtn.isVisible()) {
      await submitBtn.click()
      await page.waitForTimeout(2000)
      console.log('   ✓ メンバー参加完了')
    }
  }
}

// 4. ナビゲーション確認
console.log('4. ナビゲーション確認')
await page.screenshot({ path: 'dev-after-modal.png' })
const navTabs = await page.locator('[role="link"]').count()
console.log(`   ナビゲーションタブ数: ${navTabs}`)

const expensesTab = page.getByRole('link', { name: /支出一覧|expenses/ }).first()
const hasNav = await expensesTab.isVisible().catch(() => false)
if (hasNav) {
  await expensesTab.click()
  await page.waitForLoadState('load')
} else {
  console.log('   支出一覧タブ見つからず、URLで遷移')
  await page.goto(`http://localhost:3000/${spaceId}/expenses`)
  await page.waitForLoadState('load')
}

await page.waitForTimeout(2000)
await page.screenshot({ path: 'dev-expenses.png' })
console.log('   ✓ 支出一覧表示')

// 5. UI要素確認
console.log('5. UI要素確認')
const hasAddBtn = await page.getByRole('button', { name: /追加/ }).isVisible().catch(() => false)
const noExpenseMsg = await page.getByText('まだ支出がありません').isVisible().catch(() => false)
const loadingMsg = await page.getByText('読み込み中').isVisible().catch(() => false)
const title = await page.getByText('支出一覧').isVisible().catch(() => false)

console.log(`  支出一覧タイトル: ${title ? '✓' : '✗'}`)
console.log(`  追加ボタン: ${hasAddBtn ? '✓' : '✗'}`)
console.log(`  「支出がありません」: ${noExpenseMsg ? '✓' : '✗'}`)
console.log(`  「読み込み中」(エラー): ${loadingMsg ? '✗' : '✓'}`)

console.log(`\nエラー (${errors.length}件):`)
errors.slice(0, 3).forEach(e => console.log(`  - ${e.substring(0, 90)}`))

await browser.close()
