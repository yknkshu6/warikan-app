'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { MEMBER_COLOR_PALETTE } from '@/lib/constants/categories'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (name: string, color: string) => Promise<void>
}

export default function CategoryAddModal({ open, onOpenChange, onSubmit }: Props) {
  const [name, setName] = useState('')
  const [color, setColor] = useState<string>(MEMBER_COLOR_PALETTE[0])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      await onSubmit(name.trim(), color)
      setName('')
      setColor(MEMBER_COLOR_PALETTE[0])
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setName('')
      setColor(MEMBER_COLOR_PALETTE[0])
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>カテゴリを追加</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 名前入力 */}
          <div className="space-y-1.5">
            <Label htmlFor="category-name">カテゴリ名</Label>
            <Input
              id="category-name"
              placeholder="例：飲食代"
              value={name}
              onChange={e => setName(e.target.value)}
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
            disabled={loading || !name.trim()}
          >
            {loading ? '追加中...' : '追加'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
