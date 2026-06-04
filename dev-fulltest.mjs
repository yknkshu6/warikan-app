import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
const errors = []

page.on('console', msg => {
  if (msg.type() === 'error' && !msg.text().includes('DevTools')) errors.push(msg.text())
})
page.on('pageerror', err => errors.push(err.message))

console.log('=== フルフローテスト開始 ===\n')

// 1. ホーム
console.log('1️⃣ ホームページ')
await page.goto('http://localhost:3000')
await page.waitForLoadState('load')
await page.evaluate(() => localStorage.clear())
console.log('   ✓ localStorage クリア済み')

// 2. スペース作成
console.log('\n2️⃣ スペース作成')
await page.getByPlaceholder('マイスペース').fill('統合テスト')
await page.getByRole('button', { name: /スペースを作成/ }).click()
await page.waitForNavigation({ waitUntil: 'load' })
const spaceId = page.url().split('/')[3]
console.log(`   ✓ スペース作成: ${spaceId}`)

// 3. メンバー参加
console.log('\n3️⃣ メンバー参加')
await page.waitForTimeout(2000)
const nameInput = page.getByPlaceholder('名前を入力')
await nameInput.fill('テストユーザー')
console.log('   ✓ 名前入力')

// カラーボタンはスキップ（デフォルトで進める）
console.log('   ⏭️  カラー選択スキップ')

// 参加ボタン
await page.getByRole('button', { name: /参加する/ }).click()
await page.waitForTimeout(3000)
console.log('   ✓ 参加完了')

// 4. 支出一覧ページへナビゲート
console.log('\n4️⃣ 支出一覧へ')
const expensesLink = page.locator('a, button').filter({ hasText: /支出|expense/ }).first()
const hasLink = await expensesLink.isVisible().catch(() => false)

if (hasLink) {
  await expensesLink.click()
  await page.waitForLoadState('load')
  console.log('   ✓ ナビゲーションクリック')
} else {
  await page.goto(`http://localhost:3000/${spaceId}/expenses`)
  await page.waitForLoadState('load')
  console.log('   ✓ URL遷移')
}

await page.waitForTimeout(1500)
await page.screenshot({ path: 'fulltest-expenses.png' })

// 5. 支出追加フロー
console.log('\n5️⃣ 支出追加')
const addBtn = page.getByRole('button').filter({ hasText: /追加|plus/i }).first()
const hasAddBtn = await addBtn.isVisible().catch(() => false)

if (hasAddBtn) {
  console.log('   ✓ 追加ボタン見つかった')
  await addBtn.click()
  await page.waitForTimeout(2000)
  await page.screenshot({ path: 'fulltest-form.png' })

  // フォーム入力
  const titleInput = page.getByPlaceholder('例：居酒屋代')
  if (await titleInput.isVisible()) {
    await titleInput.fill('テスト飲み会')
    console.log('   ✓ タイトル入力')

    const amountInput = page.locator('input[inputmode="numeric"]').first()
    await amountInput.fill('3000')
    console.log('   ✓ 金額入力')

    await page.waitForTimeout(1000)
    const saveBtn = page.getByRole('button', { name: /保存/ })
    if (await saveBtn.isVisible()) {
      await saveBtn.click()
      await page.waitForTimeout(2000)
      console.log('   ✓ 支出保存')
      await page.screenshot({ path: 'fulltest-saved.png' })
    }
  }
} else {
  console.log('   ✗ 追加ボタン見つからず')
  console.log('   利用可能なボタン:', await page.locator('button').count())
}

// 結果
console.log('\n📊 テスト結果')
console.log(`エラー: ${errors.length}件`)
errors.slice(0, 2).forEach(e => console.log(`  - ${e.substring(0, 80)}`))
console.log('\n✅ テスト完了')

await browser.close()
