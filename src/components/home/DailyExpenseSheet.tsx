'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Plus } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import ExpenseCard from '@/components/expense/ExpenseCard'
import type { Expense, Member, ExpenseCategory } from '@/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date | null
  expenses: Expense[]
  members: Member[]
  categories: ExpenseCategory[]
  selfMemberId: string | null
  onDeleteExpense?: (expense: Expense) => void
  onEditExpense?: (expense: Expense) => void
  onAddExpense?: () => void
}

export default function DailyExpenseSheet({
  open,
  onOpenChange,
  date,
  expenses,
  members,
  categories,
  selfMemberId,
  onDeleteExpense,
  onEditExpense,
  onAddExpense,
}: Props) {
  const dayExpenses = useMemo(() => {
    if (!date) return []
    const dateStr = format(date, 'yyyy-MM-dd')
    return expenses.filter(e => e.date === dateStr)
  }, [date, expenses])

  if (!date) return null

  const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80vh] rounded-t-2xl px-0">
        <SheetHeader className="px-4 pb-3">
          <SheetTitle className="text-left">
            {format(date, 'M月d日 (E)', { locale: ja })}
            <span className="text-base font-normal text-muted-foreground ml-2">
              ¥{dayTotal.toLocaleString('ja-JP')}
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="px-4 pb-3 border-b">
          <Button
            size="sm"
            onClick={() => onAddExpense?.()}
          >
            <Plus size={16} className="mr-1" />
            追加
          </Button>
        </div>

        {dayExpenses.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            この日の支出はありません
          </div>
        ) : (
          <ScrollArea className="h-full px-4 pb-8">
            <div className="space-y-2">
              {dayExpenses.map(expense => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  members={members}
                  categories={categories}
                  selfMemberId={selfMemberId}
                  onEdit={onEditExpense || (() => {})}
                  onDelete={onDeleteExpense || (() => {})}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  )
}
