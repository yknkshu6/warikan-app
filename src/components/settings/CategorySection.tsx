'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CategoryAddModal from './CategoryAddModal'
import type { ExpenseCategory } from '@/types'

interface Props {
  categories: ExpenseCategory[]
  onAddCategory: (name: string, color: string) => Promise<void>
  onDeleteCategory: (categoryId: string) => Promise<void>
}

export default function CategorySection({ categories, onAddCategory, onDeleteCategory }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ExpenseCategory | null>(null)

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await onDeleteCategory(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">カテゴリ</h3>
        <Button size="sm" variant="outline" onClick={() => setModalOpen(true)}>
          <Plus size={16} className="mr-1" />
          追加
        </Button>
      </div>

      {/* カテゴリ一覧 */}
      <div className="space-y-1.5">
        {categories.length === 0 ? (
          <p className="text-xs text-muted-foreground">カテゴリがありません</p>
        ) : (
          categories.map(category => (
            <div
              key={category.id}
              className="flex items-center justify-between bg-slate-50 rounded-lg p-3"
            >
              <div className="flex items-center gap-2">
                <div
                  className="size-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm font-medium">{category.name}</span>
                {category.is_preset && (
                  <span className="text-xs px-2 py-1 bg-slate-200 text-slate-800 rounded">プリセット</span>
                )}
              </div>

              {!category.is_preset && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteTarget(category)}
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      {/* モーダル */}
      <CategoryAddModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={onAddCategory}
      />

      {/* 削除確認ダイアログ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl p-6 mx-4 max-w-sm w-full shadow-xl space-y-4">
            <h3 className="font-semibold">カテゴリを削除しますか？</h3>
            <p className="text-sm text-muted-foreground">
              「{deleteTarget.name}」を削除します。このカテゴリで作成された支出は未分類になります。
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>
                キャンセル
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleConfirmDelete}>
                削除する
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
