'use client'

import { useMemo } from 'react'
import { formatAmountInput } from '@/lib/utils/currency'
import { toPeriodString } from '@/lib/utils/date'
import { useFilterStore } from '@/stores/filterStore'
import type { Expense, Member } from '@/types'

interface Props {
  expenses: Expense[]
  members: Member[]
  selfMemberId: string | null
}

export default function SummaryCard({ expenses, members, selfMemberId }: Props) {
  const { period } = useFilterStore()
  const currentPeriod = period || '2026-06'

  const stats = useMemo(() => {
    const periodExpenses = expenses.filter(e => toPeriodString(new Date(e.date)) === currentPeriod)

    if (periodExpenses.length === 0) {
      return { totalAmount: 0, perPerson: 0, selfPaid: 0, selfOwed: 0 }
    }

    const totalAmount = periodExpenses.reduce((sum, e) => sum + e.amount, 0)
    const activeMembers = members.filter(m => !m.is_deleted)
    const perPerson = activeMembers.length > 0 ? Math.floor(totalAmount / activeMembers.length) : 0

    let selfPaid = 0
    let selfOwed = 0

    if (selfMemberId) {
      periodExpenses.forEach(expense => {
        if (expense.paid_by === selfMemberId) {
          selfPaid += expense.amount
        }
        const selfShare = expense.split_details[selfMemberId] ?? 0
        selfOwed += selfShare
      })
    }

    return { totalAmount, perPerson, selfPaid, selfOwed }
  }, [expenses, members, currentPeriod, selfMemberId])

  return (
    <div className="px-4 py-4 space-y-3">
      {/* メイン数字 */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 space-y-2">
        <p className="text-sm text-muted-foreground">今月の合計支出</p>
        <p className="text-3xl font-bold">¥{formatAmountInput(stats.totalAmount)}</p>
      </div>

      {/* 1人あたり */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-lg p-3 space-y-1">
          <p className="text-xs text-muted-foreground">1人あたり</p>
          <p className="text-lg font-semibold">¥{formatAmountInput(stats.perPerson)}</p>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 space-y-1">
          <p className="text-xs text-muted-foreground">自分の立替</p>
          <p className="text-lg font-semibold text-green-600">¥{formatAmountInput(stats.selfPaid)}</p>
        </div>
      </div>

      {/* 自分が負担する額 */}
      {selfMemberId && (
        <div className="bg-orange-50 rounded-lg p-3 space-y-1 border border-orange-200">
          <p className="text-xs text-muted-foreground">自分の負担額</p>
          <p className="text-lg font-semibold text-orange-600">¥{formatAmountInput(stats.selfOwed)}</p>
        </div>
      )}
    </div>
  )
}
