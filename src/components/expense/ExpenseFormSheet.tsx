'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import ExpenseForm from './ExpenseForm'
import type { Member, ExpenseCategory, Expense } from '@/types'
import type { ExpenseInput } from '@/hooks/useExpenses'

interface Props {
  open: boolean
  onClose: () => void
  spaceId: string
  members: Member[]
  categories: ExpenseCategory[]
  selfMemberId: string | null
  createdBy: string | null
  editTarget?: Expense | null
  selectedDate?: Date | null
  onSubmit: (input: ExpenseInput) => Promise<void>
}

export default function ExpenseFormSheet({
  open, onClose, spaceId, members, categories, selfMemberId, createdBy, editTarget, selectedDate, onSubmit
}: Props) {
  const handleSubmit = async (input: ExpenseInput) => {
    await onSubmit(input)
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[92vh] rounded-t-2xl px-0">
        <SheetHeader className="px-4 pb-2">
          <SheetTitle>{editTarget ? '支出を編集' : '支出を追加'}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-full px-4 pb-8">
          <ExpenseForm
            spaceId={spaceId}
            members={members}
            categories={categories}
            selfMemberId={selfMemberId}
            createdBy={createdBy}
            onSubmit={handleSubmit}
            onCancel={onClose}
            defaultValues={editTarget ? {
              title: editTarget.title,
              amountStr: editTarget.amount.toString(),
              category_id: editTarget.category_id,
              paid_by: editTarget.paid_by ?? '',
              date: editTarget.date,
              note: editTarget.note ?? '',
              split_type: editTarget.split_type,
            } : selectedDate ? {
              date: `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`,
            } : undefined}
          />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
