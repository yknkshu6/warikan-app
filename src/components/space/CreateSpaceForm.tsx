'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { nanoid, customAlphabet } from 'nanoid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getSupabaseClient } from '@/lib/supabase/client'
import { PRESET_CATEGORIES } from '@/lib/constants/categories'

const shortId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8)

export default function CreateSpaceForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const spaceId = shortId()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = getSupabaseClient() as any

      const { error: spaceError } = await supabase.from('spaces').insert({
        id: spaceId,
        name: name.trim() || 'マイスペース',
      })
      if (spaceError) throw new Error(`スペース作成エラー: ${spaceError.message}`)

      const categories = PRESET_CATEGORIES.map(cat => ({
        id: nanoid(),
        space_id: spaceId,
        name: cat.name,
        color: cat.color,
        is_preset: true,
      }))
      const { error: catError } = await supabase.from('expense_categories').insert(categories)
      if (catError) throw new Error(`カテゴリ作成エラー: ${catError.message}`)

      router.push(`/${spaceId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="space-name">スペース名（任意）</Label>
        <Input
          id="space-name"
          placeholder="マイスペース"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={50}
        />
      </div>
      {error && (
        <p className="text-sm text-destructive rounded border border-destructive/30 bg-destructive/10 px-3 py-2">
          {error}
        </p>
      )}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? '作成中...' : '新しいスペースを作成'}
      </Button>
    </form>
  )
}
