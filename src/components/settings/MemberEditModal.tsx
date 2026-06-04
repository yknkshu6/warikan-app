'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { MEMBER_COLOR_PALETTE } from '@/lib/constants/categories'
import { cn } from '@/lib/utils'
import type { Member } from '@/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  member?: Member
  onSubmit: (displayName: string, color: string) => Promise<void>
}

export default function MemberEditModal({ open, onOpenChange, mode, member, onSubmit }: Props) {
  const [displayName, setDisplayName] = useState(member?.display_name ?? '')
  const [color, setColor] = useState<string>(member?.color ?? MEMBER_COLOR_PALETTE[0])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!displayName.trim()) return
    setLoading(true)
    try {
      await onSubmit(displayName.trim(), color)
      setDisplayName('')
      setColor(MEMBER_COLOR_PALETTE[0])
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setDisplayName(member?.display_name ?? '')
      setColor(member?.color ?? MEMBER_COLOR_PALETTE[0])
    }
    onOpenChange(newOpen)
  }

  const title = mode === 'create' ? 'メンバーを追加' : 'メンバーを編集'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 名前入力 */}
          <div className="space-y-1.5">
            <Label htmlFor="member-name">名前</Label>
            <Input
              id="member-name"
              placeholder="例：太郎"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* カラー選択 */}
          <div className="space-y-2">
            <Label>カラー</Label>
            <div className="flex gap-2 flex-wrap">
              {MEMBER_COLOR_PALETTE.map(palette => (
                <button
                  key={palette}
                  onClick={() => setColor(palette)}
                  className={cn(
                    'size-8 rounded-full transition-transform',
                    color === palette && 'border-2 border-foreground scale-110'
                  )}
                  style={{ backgroundColor: palette }}
                  disabled={loading}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !displayName.trim()}
          >
            {loading ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
