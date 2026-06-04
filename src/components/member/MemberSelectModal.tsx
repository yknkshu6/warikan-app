'use client'

import { useState, useEffect } from 'react'
import { useMembers } from '@/hooks/useMembers'
import { useSessionStore } from '@/stores/sessionStore'
import { useFilterStore } from '@/stores/filterStore'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MEMBER_COLOR_PALETTE } from '@/lib/constants/categories'
import { cn } from '@/lib/utils'

interface Props {
  spaceId: string
  onComplete: () => void
}

type Mode = 'select' | 'create'

export default function MemberSelectModal({ spaceId, onComplete }: Props) {
  const { activeMembers, loading: membersLoading, addMember } = useMembers(spaceId)
  const { setMembership } = useSessionStore()
  const { setSelfMemberId } = useFilterStore()

  const [mode, setMode] = useState<Mode>('select')
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState<string>(MEMBER_COLOR_PALETTE[0])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!membersLoading && activeMembers.length === 0) setMode('create')
  }, [membersLoading, activeMembers.length])

  const handleSelect = (member: { id: string; display_name: string }) => {
    setMembership({ space_id: spaceId, member_id: member.id, display_name: member.display_name, last_visited: new Date().toISOString() })
    setSelfMemberId(member.id)
    onComplete()
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    setSubmitting(true)
    try {
      const member = await addMember(newName.trim(), newColor)
      if (member) handleSelect(member)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {mode === 'select' ? 'あなたは誰ですか？' : '新しいメンバーとして参加'}
          </DialogTitle>
        </DialogHeader>

        {mode === 'select' ? (
          <div className="space-y-3">
            {activeMembers.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground">メンバーを選択してください</p>
                <div className="space-y-2">
                  {activeMembers.map(member => (
                    <button
                      key={member.id}
                      onClick={() => handleSelect(member)}
                      className="flex w-full items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
                    >
                      <span className="size-5 rounded-full shrink-0" style={{ backgroundColor: member.color }} />
                      <span className="font-medium">{member.display_name}</span>
                    </button>
                  ))}
                </div>
                <Button variant="outline" className="w-full" onClick={() => setMode('create')}>
                  新しいメンバーとして参加
                </Button>
              </>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>あなたの名前</Label>
              <Input
                placeholder="名前を入力"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>カラー</Label>
              <div className="flex flex-wrap gap-2">
                {MEMBER_COLOR_PALETTE.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewColor(color)}
                    className={cn(
                      'size-7 rounded-full border-2 transition-transform',
                      newColor === color ? 'border-foreground scale-110' : 'border-transparent'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              {activeMembers.length > 0 && (
                <Button variant="outline" onClick={() => setMode('select')} className="flex-1">
                  戻る
                </Button>
              )}
              <Button onClick={handleCreate} disabled={!newName.trim() || submitting} className="flex-1">
                {submitting ? '参加中...' : '参加する'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
