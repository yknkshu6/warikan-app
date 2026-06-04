'use client'

import { useState, useMemo, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useExpenses } from '@/hooks/useExpenses'
import { useMembers } from '@/hooks/useMembers'
import { useCategories } from '@/hooks/useCategories'
import { useSessionStore } from '@/stores/sessionStore'
import { useFilterStore } from '@/stores/filterStore'
import ExpenseCard from '@/components/expense/ExpenseCard'
import ExpenseFormSheet from '@/components/expense/ExpenseFormSheet'
import FilterBar from '@/components/expense/FilterBar'
import { toPeriodString } from '@/lib/utils/date'
import type { Expense } from '@/types'
import type { ExpenseInput } from '@/hooks/useExpenses'

interface Props {
  spaceId: string
}

export default function ExpensesClientPage({ spaceId }: Props) {
  const { expenses, loading, addExpense, updateExpense, deleteExpense, refetch } = useExpenses(spaceId)
  const { members } = useMembers(spaceId)
  const { categories } = useCategories(spaceId)
  const { getMembership } = useSessionStore()
  const { period, search, categoryId, sort, showSelfOnly, setSelfMemberId } = useFilterStore()

  const membership = getMembership(spaceId)
  const selfMemberId = membership?.member_id ?? null
  const createdBy = membership?.display_name ?? null

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Expense | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null)

  // filterStore の selfMemberId を同期
  useEffect(() => {
    setSelfMemberId(selfMemberId)
  }, [selfMemberId, setSelfMemberId])

  const handleSubmit = async (input: ExpenseInput) => {
    if (editTarget) {
      await updateExpense(editTarget.id, { ...input, updated_by: createdBy })
      setEditTarget(null)
    } else {
      await addExpense(input)
    }
    await refetch()
    setSheetOpen(false)
  }

  const handleEdit = (expense: Expense) => {
    setEditTarget(expense)
    setSheetOpen(true)
  }

  const handleDelete = async (expense: Expense) => {
    setDeleteTarget(expense)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    await deleteExpense(deleteTarget.id)
    await refetch()
    setDeleteTarget(null)
  }

  const handleSheetClose = () => {
    setSheetOpen(false)
    setEditTarget(null)
  }

  // フィルタリング・ソート処理
  const filteredExpenses = useMemo(() => {
    let result = [...expenses]

    // 1. 期間フィルター
    if (period) {
      result = result.filter(e => toPeriodString(new Date(e.date)) === period)
    }

    // 2. 検索フィルター（タイトル・メモ）
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(e =>
        e.title.toLowerCase().includes(searchLower) ||
        (e.note?.toLowerCase().includes(searchLower) ?? false)
      )
    }

    // 3. カテゴリフィルター
    if (categoryId) {
      result = result.filter(e => e.category_id === categoryId)
    }

    // 4. 自分のみフィルター
    if (showSelfOnly && selfMemberId) {
      result = result.filter(e =>
        e.paid_by === selfMemberId || e.split_details[selfMemberId]
      )
    }

    // 5. ソート
    result.sort((a, b) => {
      switch (sort) {
        case 'date_desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'date_asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case 'amount_desc':
          return b.amount - a.amount
        case 'amount_asc':
          return a.amount - b.amount
        default:
          return 0
      }
    })

    return result
  }, [expenses, period, search, categoryId, showSelfOnly, sort, selfMemberId])

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h1 className="text-lg font-semibold">支出一覧</h1>
        <Button size="sm" onClick={() => setSheetOpen(true)}>
          <Plus size={16} className="mr-1" />
          追加
        </Button>
      </div>

      {/* フィルターバー */}
      <FilterBar categories={categories} />

      {/* 支出リスト */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
            読み込み中...
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <p className="text-sm">まだ支出がありません</p>
            <Button variant="outline" size="sm" onClick={() => setSheetOpen(true)}>
              最初の支出を追加
            </Button>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
            検索条件に一致する支出がありません
          </div>
        ) : (
          filteredExpenses.map(expense => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              members={members}
              categories={categories}
              selfMemberId={selfMemberId}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* 支出フォームSheet */}
      <ExpenseFormSheet
        open={sheetOpen}
        onClose={handleSheetClose}
        spaceId={spaceId}
        members={members}
        categories={categories}
        selfMemberId={selfMemberId}
        createdBy={createdBy}
        editTarget={editTarget}
        onSubmit={handleSubmit}
      />

      {/* 削除確認ダイアログ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl p-6 mx-4 max-w-sm w-full shadow-xl space-y-4">
            <h3 className="font-semibold">支出を削除しますか？</h3>
            <p className="text-sm text-muted-foreground">
              「{deleteTarget.title}」を削除します。この操作は取り消せません。
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>
                キャンセル
              </Button>
              <Button variant="destructive" className="flex-1" onClick={confirmDelete}>
                削除する
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
