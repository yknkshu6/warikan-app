'use client'

import { useMemo } from 'react'
import { calculateSettlements, getActiveMemberIds } from '@/lib/calculations/split'
import { useFilterStore } from '@/stores/filterStore'
import { toPeriodString } from '@/lib/utils/date'
import type { Expense, Member } from '@/types'

interface Props {
  expenses: Expense[]
  members: Member[]
  selfMemberId: string | null
}

export default function BalanceSummary({ expenses, members, selfMemberId }: Props) {
  const { period } = useFilterStore()
  const currentPeriod = period || '2026-06'

  const settlements = useMemo(() => {
    const periodExpenses = expenses.filter(e => toPeriodString(new Date(e.date)) === currentPeriod)
    if (periodExpenses.length === 0 || !selfMemberId) {
      return []
    }

    const settlements = calculateSettlements(members, periodExpenses)
    return settlements.filter(s => s.from_member_id === selfMemberId || s.to_member_id === selfMemberId)
  }, [expenses, members, currentPeriod, selfMemberId])

  const memberMap = useMemo(() => {
    return new Map(members.map(m => [m.id, m]))
  }, [members])

  if (settlements.length === 0) {
    return (
      <div className="px-4 py-4 space-y-3">
        <h3 className="font-semibold text-sm">清算情報</h3>
        <div className="bg-slate-50 rounded-lg p-4 text-center text-sm text-muted-foreground">
          清算がありません
        </div>
      </div>
    )
  }

  // 自分が受け取る / 自分が払う に分類
  const toReceive = settlements.filter(s => s.to_member_id === selfMemberId)
  const toPay = settlements.filter(s => s.from_member_id === selfMemberId)

  return (
    <div className="px-4 py-4 space-y-4">
      <h3 className="font-semibold text-sm">清算情報</h3>

      {/* 自分が受け取る */}
      {toReceive.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-green-700">受け取る 💰</p>
          <div className="space-y-1.5">
            {toReceive.map((settlement, idx) => {
              const from = memberMap.get(settlement.from_member_id)
              return (
                <div key={idx} className="bg-green-50 rounded-lg p-3 flex justify-between items-center border border-green-200">
                  <span className="text-sm">
                    <span className="font-medium">{from?.display_name}</span>
                    <span className="text-muted-foreground"> さんから</span>
                  </span>
                  <span className="text-sm font-semibold text-green-700">
                    ¥{settlement.amount.toLocaleString('ja-JP')}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 自分が払う */}
      {toPay.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-red-700">払う 💸</p>
          <div className="space-y-1.5">
            {toPay.map((settlement, idx) => {
              const to = memberMap.get(settlement.to_member_id)
              return (
                <div key={idx} className="bg-red-50 rounded-lg p-3 flex justify-between items-center border border-red-200">
                  <span className="text-sm">
                    <span className="font-medium">{to?.display_name}</span>
                    <span className="text-muted-foreground"> さんへ</span>
                  </span>
                  <span className="text-sm font-semibold text-red-700">
                    ¥{settlement.amount.toLocaleString('ja-JP')}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
