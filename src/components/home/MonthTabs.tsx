'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFilterStore } from '@/stores/filterStore'
import { formatMonth, addMonths, subMonths, fromPeriodString } from '@/lib/utils/date'

export default function MonthTabs() {
  const { period, setPeriod } = useFilterStore()
  const currentDate = fromPeriodString(period || '2026-06')

  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerYear, setPickerYear] = useState(currentDate.getFullYear())
  const [pickerMonth, setPickerMonth] = useState(currentDate.getMonth() + 1)

  const handlePrevMonth = () => {
    const prev = subMonths(currentDate, 1)
    const prevPeriod = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`
    setPeriod(prevPeriod)
  }

  const handleNextMonth = () => {
    const next = addMonths(currentDate, 1)
    const nextPeriod = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`
    setPeriod(nextPeriod)
  }

  const handleApplyPicker = () => {
    const newPeriod = `${pickerYear}-${String(pickerMonth).padStart(2, '0')}`
    setPeriod(newPeriod)
    setPickerOpen(false)
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePrevMonth}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft size={18} />
      </Button>

      {/* 年月表示（クリック可能） */}
      <button
        onClick={() => setPickerOpen(!pickerOpen)}
        className="text-base font-semibold min-w-[120px] text-center hover:bg-slate-100 px-3 py-1 rounded transition-colors"
      >
        {formatMonth(currentDate)}
      </button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleNextMonth}
        className="h-8 w-8 p-0"
      >
        <ChevronRight size={18} />
      </Button>

      {/* 年月ピッカー */}
      {pickerOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-white border rounded-lg shadow-lg p-4 space-y-3 min-w-[220px]">
          {/* 年選択 */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">年</label>
            <Select value={String(pickerYear)} onValueChange={v => setPickerYear(Number(v))}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => 2020 + i).map(year => (
                  <SelectItem key={year} value={String(year)}>
                    {year}年
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 月選択 */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">月</label>
            <Select value={String(pickerMonth)} onValueChange={v => setPickerMonth(Number(v))}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <SelectItem key={month} value={String(month)}>
                    {month}月
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ボタン */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-7"
              onClick={() => setPickerOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              size="sm"
              className="flex-1 h-7"
              onClick={handleApplyPicker}
            >
              設定
            </Button>
          </div>
        </div>
      )}

      {/* 背景クリックで閉じる */}
      {pickerOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setPickerOpen(false)}
        />
      )}
    </div>
  )
}
