import type { Member, SplitType, SplitDetail, Settlement } from '@/types'

export function calculateEqualSplit(amount: number, memberIds: string[]): SplitDetail {
  if (memberIds.length === 0) return {}
  const perPerson = Math.floor(amount / memberIds.length)
  return Object.fromEntries(memberIds.map(id => [id, perPerson]))
}

export function calculateRatioSplit(
  amount: number,
  memberIds: string[],
  ratios: Record<string, number>
): SplitDetail {
  if (memberIds.length === 0) return {}
  const totalRatio = memberIds.reduce((sum, id) => sum + (ratios[id] ?? 1), 0)
  if (totalRatio === 0) return {}
  return Object.fromEntries(
    memberIds.map(id => [id, Math.floor(amount * (ratios[id] ?? 1) / totalRatio)])
  )
}

export function getActiveMemberIds(members: Member[]): string[] {
  return members.filter(m => !m.is_deleted).map(m => m.id)
}

// 各メンバーの純残高を計算（削除済みメンバーは除外）
function calcBalances(
  activeIds: Set<string>,
  expenses: { paid_by: string | null; amount_in_base: number; split_details: SplitDetail }[]
): Record<string, number> {
  const balances: Record<string, number> = {}
  for (const id of activeIds) balances[id] = 0

  for (const expense of expenses) {
    if (expense.paid_by && activeIds.has(expense.paid_by)) {
      balances[expense.paid_by] += expense.amount_in_base
    }
    for (const [memberId, owed] of Object.entries(expense.split_details)) {
      if (activeIds.has(memberId)) {
        balances[memberId] -= owed
      }
    }
  }
  return balances
}

// 貪欲法で送金回数を最小化した清算リストを算出
export function calculateSettlements(
  members: Member[],
  expenses: { paid_by: string | null; amount_in_base: number; split_details: SplitDetail }[]
): Settlement[] {
  const activeIds = new Set(getActiveMemberIds(members))
  const balances = calcBalances(activeIds, expenses)

  const creditors = Object.entries(balances)
    .filter(([, b]) => b > 0.5)
    .map(([id, balance]) => ({ id, balance }))
    .sort((a, b) => b.balance - a.balance)

  const debtors = Object.entries(balances)
    .filter(([, b]) => b < -0.5)
    .map(([id, balance]) => ({ id, balance }))
    .sort((a, b) => a.balance - b.balance)

  const settlements: Settlement[] = []
  let ci = 0
  let di = 0

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci]
    const debtor = debtors[di]
    const amount = Math.min(creditor.balance, -debtor.balance)

    if (amount >= 1) {
      settlements.push({
        from_member_id: debtor.id,
        to_member_id: creditor.id,
        amount: Math.round(amount),
      })
    }

    creditor.balance -= amount
    debtor.balance += amount

    if (creditor.balance < 0.5) ci++
    if (debtor.balance > -0.5) di++
  }

  return settlements
}

// 個別入力のバリデーション（合計 ≤ amount）
export function validateIndividualSplit(
  amount: number,
  splitDetails: SplitDetail
): string | null {
  const total = Object.values(splitDetails).reduce((s, v) => s + v, 0)
  if (total > amount) {
    return `負担合計（${total}円）が支出金額（${amount}円）を超えています`
  }
  return null
}
