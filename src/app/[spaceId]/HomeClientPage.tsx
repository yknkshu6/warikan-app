'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useExpenses } from '@/hooks/useExpenses'
import { useMembers } from '@/hooks/useMembers'
import { useCategories } from '@/hooks/useCategories'
import { useSessionStore } from '@/stores/sessionStore'
import MonthTabs from '@/components/home/MonthTabs'
import SummaryCard from '@/components/home/SummaryCard'
import ExpenseCalendar from '@/components/home/ExpenseCalendar'
import DailyExpenseSheet from '@/components/home/DailyExpenseSheet'
import BalanceSummary from '@/components/home/BalanceSummary'
import ExpenseFormSheet from '@/components/expense/ExpenseFormSheet'
import type { Expense } from '@/types'
import type { ExpenseInput } from '@/hooks/useExpenses'

interface Props {
  spaceId: string
}

export default function HomeClientPage({ spaceId }: Props) {
  const { expenses, loading, addExpense, deleteExpense, updateExpense, refetch } = useExpenses(spaceId)
  const { members } = useMembers(spaceId)
  const { categories } = useCategories(spaceId)
  const { getMembership } = useSessionStore()

  const membership = getMembership(spaceId)
  const selfMemberId = membership?.member_id ?? null
  const createdBy = membership?.display_name ?? null

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Expense | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null)

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSheetOpen(true)
  }

  const handleEditExpense = (expense: Expense) => {
    setEditTarget(expense)
    setFormOpen(true)
    setSheetOpen(false)
  }

  const handleAddExpense = () => {
    setEditTarget(null)
    setFormOpen(true)
    setSheetOpen(false)
  }

  const handleDeleteExpense = async (expense: Expense) => {
    setDeleteTarget(expense)
  }

  const handleFormSubmit = async (input: ExpenseInput) => {
    if (editTarget) {
      await updateExpense(editTarget.id, { ...input, updated_by: createdBy })
    } else {
      await addExpense(input)
    }
    await refetch()
    setEditTarget(null)
    setFormOpen(false)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    await deleteExpense(deleteTarget.id)
    await refetch()
    setDeleteTarget(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* 月タブ */}
      <MonthTabs />

      {/* スクロール領域 */}
      <div className="flex-1 overflow-y-auto pb-16">
        {/* サマリーカード */}
        <SummaryCard expenses={expenses} members={members} selfMemberId={selfMemberId} />

        {/* カレンダー */}
        <ExpenseCalendar expenses={expenses} categories={categories} onDateSelect={handleDateSelect} />

        {/* 清算情報 */}
        <BalanceSummary expenses={expenses} members={members} selfMemberId={selfMemberId} />
      </div>

      {/* 当日支出シート */}
      <DailyExpenseSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        date={selectedDate}
        expenses={expenses}
        members={members}
        categories={categories}
        selfMemberId={selfMemberId}
        onDeleteExpense={handleDeleteExpense}
        onEditExpense={handleEditExpense}
        onAddExpense={handleAddExpense}
      />

      {/* 支出編集フォーム */}
      <ExpenseFormSheet
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditTarget(null)
        }}
        spaceId={spaceId}
        members={members}
        categories={categories}
        selfMemberId={selfMemberId}
        createdBy={createdBy}
        editTarget={editTarget ?? undefined}
        selectedDate={selectedDate}
        onSubmit={handleFormSubmit}
      />

      {/* 削除確認ダイアログ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
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
