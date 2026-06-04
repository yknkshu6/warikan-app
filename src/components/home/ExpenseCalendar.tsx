'use client'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { getCalendarDays, isSameMonthAs, isToday, toPeriodString, fromPeriodString } from '@/lib/utils/date'
import { useFilterStore } from '@/stores/filterStore'
import type { Expense, ExpenseCategory } from '@/types'

interface Props {
  expenses: Expense[]
  categories: ExpenseCategory[]
  onDateSelect: (date: Date) => void
}

export default function ExpenseCalendar({ expenses, categories, onDateSelect }: Props) {
  const { period } = useFilterStore()
  const currentDate = fromPeriodString(period || '2026-06')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  const calendarDays = useMemo(() => getCalendarDays(year, month), [year, month])

  const expensesByDate = useMemo(() => {
    const map = new Map<string, Expense[]>()
    expenses.forEach(exp => {
      const dateStr = exp.date
      if (!map.has(dateStr)) map.set(dateStr, [])
      map.get(dateStr)!.push(exp)
    })
    return map
  }, [expenses])

  const categoryMap = useMemo(() => {
    const map = new Map(categories.map(c => [c.id, c]))
    return map
  }, [categories])

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    onDateSelect(date)
  }

  const weekDays = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div className="px-4 py-4">
      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map(date => {
          const dateStr = format(date, 'yyyy-MM-dd')
          const dayExpenses = expensesByDate.get(dateStr) ?? []
          const isCurrentMonth = isSameMonthAs(date, year, month)
          const isCurrentDay = isToday(date)
          const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === dateStr

          return (
            <button
              key={dateStr}
              onClick={() => handleDateClick(date)}
              className={`
                aspect-square rounded-lg p-1.5 text-xs font-medium
                transition-colors flex flex-col items-center justify-center
                ${!isCurrentMonth ? 'bg-slate-50 text-muted-foreground opacity-40' : 'bg-white'}
                ${isCurrentDay ? 'border-2 border-blue-500' : 'border border-slate-200'}
                ${isSelected ? 'bg-blue-100 border-blue-500' : ''}
                hover:bg-slate-100
              `}
            >
              {/* 日付 */}
              <span className="font-semibold">{format(date, 'd')}</span>

              {/* ドット（カテゴリ色） */}
              {dayExpenses.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayExpenses.slice(0, 3).map((exp, idx) => {
                    const cat = categoryMap.get(exp.category_id ?? '')
                    const color = cat?.color ?? '#ccc'
                    return (
                      <div
                        key={idx}
                        className="size-1.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    )
                  })}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
