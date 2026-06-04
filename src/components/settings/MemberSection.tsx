'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MemberEditModal from './MemberEditModal'
import type { Member } from '@/types'

interface Props {
  members: Member[]
  onAddMember: (displayName: string, color: string) => Promise<void>
  onEditMember: (memberId: string, displayName: string, color: string) => Promise<void>
  onDeleteMember: (memberId: string) => Promise<void>
}

export default function MemberSection({ members, onAddMember, onEditMember, onDeleteMember }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null)

  const activeMembers = members.filter(m => !m.is_deleted)

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setEditingMember(null)
    setModalOpen(true)
  }

  const handleOpenEditModal = (member: Member) => {
    setModalMode('edit')
    setEditingMember(member)
    setModalOpen(true)
  }

  const handleModalSubmit = async (displayName: string, color: string) => {
    if (modalMode === 'create') {
      await onAddMember(displayName, color)
    } else if (editingMember) {
      await onEditMember(editingMember.id, displayName, color)
    }
  }

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await onDeleteMember(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">メンバー</h3>
        <Button size="sm" variant="outline" onClick={handleOpenCreateModal}>
          <Plus size={16} className="mr-1" />
          追加
        </Button>
      </div>

      {/* メンバー一覧 */}
      <div className="space-y-1.5">
        {activeMembers.length === 0 ? (
          <p className="text-xs text-muted-foreground">メンバーがいません</p>
        ) : (
          activeMembers.map(member => (
            <div
              key={member.id}
              className="flex items-center justify-between bg-slate-50 rounded-lg p-3"
            >
              <div className="flex items-center gap-2">
                <div
                  className="size-4 rounded-full"
                  style={{ backgroundColor: member.color }}
                />
                <span className="text-sm font-medium">{member.display_name}</span>
              </div>

              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleOpenEditModal(member)}
                  className="h-7 w-7 p-0"
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteTarget(member)}
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* モーダル */}
      <MemberEditModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        member={editingMember ?? undefined}
        onSubmit={handleModalSubmit}
      />

      {/* 削除確認ダイアログ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl p-6 mx-4 max-w-sm w-full shadow-xl space-y-4">
            <h3 className="font-semibold">メンバーを削除しますか？</h3>
            <p className="text-sm text-muted-foreground">
              「{deleteTarget.display_name}」を削除します。この操作は取り消せません。
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
