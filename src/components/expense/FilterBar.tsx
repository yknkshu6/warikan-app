'use client'

import { Search, Filter, ToggleLeft, ToggleRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useFilterStore } from '@/stores/filterStore'
import type { ExpenseCategory, SortKey } from '@/types'

interface Props {
  categories: ExpenseCategory[]
}

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: '日付（新→古）', value: 'date_desc' },
  { label: '日付（古→新）', value: 'date_asc' },
  { label: '金額（高→低）', value: 'amount_desc' },
  { label: '金額（低→高）', value: 'amount_asc' },
]

export default function FilterBar({ categories }: Props) {
  const { search, setSearch, categoryId, setCategoryId, sort, setSort, showSelfOnly, setShowSelfOnly } = useFilterStore()

  const categoryLabel = categoryId
    ? categories.find(c => c.id === categoryId)?.name ?? 'すべてのカテゴリ'
    : 'すべてのカテゴリ'

  const sortLabel = SORT_OPTIONS.find(opt => opt.value === sort)?.label ?? '日付（新→古）'

  return (
    <div className="px-4 py-3 border-b space-y-3">
      {/* 検索バー */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="タイトルまたはメモで検索..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 h-9"
        />
      </div>

      {/* フィルター・ソートバー */}
      <div className="flex gap-2 items-center flex-wrap">
        {/* カテゴリ絞り込み */}
        <Select value={categoryId ?? 'all'} onValueChange={v => setCategoryId(v === 'all' ? null : v)}>
          <SelectTrigger className="h-8 w-[140px]">
            <span className="text-sm">{categoryLabel}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべてのカテゴリ</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>
                <span className="flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* ソート選択 */}
        <Select value={sort} onValueChange={v => setSort(v as SortKey)}>
          <SelectTrigger className="h-8 w-[140px]">
            <span className="text-sm">{sortLabel}</span>
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 自分のみボタン */}
        <Button
          size="sm"
          variant={showSelfOnly ? 'default' : 'outline'}
          onClick={() => setShowSelfOnly(!showSelfOnly)}
          className="h-8"
        >
          {showSelfOnly ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
          <span className="ml-1">自分のみ</span>
        </Button>
      </div>
    </div>
  )
}
