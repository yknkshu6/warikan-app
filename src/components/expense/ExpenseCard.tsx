'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
import { UNCATEGORIZED_COLOR } from '@/lib/constants/categories'
import type { Expense, Member, ExpenseCategory } from '@/types'

interface Props {
  expense: Expense
  members: Member[]
  categories: ExpenseCategory[]
  selfMemberId: string | null
  onEdit: (expense: Expense) => void
  onDelete: (expense: Expense) => void
}

export default function ExpenseCard({ expense, members, categories, selfMemberId, onEdit, onDelete }: Props) {
  const paidByMember = members.find(m => m.id === expense.paid_by)
  const category = categories.find(c => c.id === expense.category_id)
  const isSelf = expense.paid_by === selfMemberId
  const selfOwed = selfMemberId ? (expense.split_details[selfMemberId] ?? 0) : 0

  const handleEdit = () => onEdit(expense)
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(expense)
  }

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-3 bg-card cursor-pointer hover:bg-accent/50 transition-colors ${isSelf ? 'border-blue-300 bg-blue-50/50' : ''}`}
      onClick={handleEdit}
    >
      {/* カテゴリカラーバー */}
      <div
        className="mt-1 w-1 self-stretch rounded-full shrink-0"
        style={{ backgroundColor: category?.color ?? UNCATEGORIZED_COLOR }}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium truncate">{expense.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDate(expense.date, 'M/d')}
              {category && ` · ${category.name}`}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-semibold">{formatCurrency(expense.amount)}</p>
            {selfOwed > 0 && !isSelf && (
              <p className="text-xs text-muted-foreground">自分 {formatCurrency(selfOwed)}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          {/* 支払者 */}
          {paidByMember && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="size-2 rounded-full" style={{ backgroundColor: paidByMember.color }} />
              {paidByMember.is_deleted ? `${paidByMember.display_name}（削除済み）` : paidByMember.display_name}
              が立替
            </span>
          )}

          {/* 自分バッジ */}
          {isSelf && (
            <Badge variant="secondary" className="text-xs h-4 px-1.5">自分</Badge>
          )}
        </div>
      </div>

      {/* 操作ボタン */}
      <div className="flex flex-col gap-1 shrink-0">
        <Button size="icon" variant="ghost" className="size-7" onClick={handleDelete}>
          <Trash2 size={13} />
        </Button>
      </div>
    </div>
  )
}
