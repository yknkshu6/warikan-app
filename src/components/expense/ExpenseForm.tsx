'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import SplitEqualForm from './SplitEqualForm'
import SplitRatioForm from './SplitRatioForm'
import SplitIndividualForm from './SplitIndividualForm'
import { parseAmountInput, formatAmountInput } from '@/lib/utils/currency'
import { toDateString } from '@/lib/utils/date'
import { calculateEqualSplit, calculateRatioSplit, validateIndividualSplit } from '@/lib/calculations/split'
import type { Member, ExpenseCategory, SplitType } from '@/types'
import type { ExpenseInput } from '@/hooks/useExpenses'

const schema = z.object({
  title: z.string().min(1, 'タイトルを入力してください').max(100),
  amountStr: z.string().min(1, '金額を入力してください'),
  category_id: z.string().nullable(),
  paid_by: z.string().min(1, '支払者を選択してください'),
  date: z.string().min(1),
  note: z.string().max(500),
})

type FormValues = z.infer<typeof schema>

interface Props {
  spaceId: string
  members: Member[]
  categories: ExpenseCategory[]
  selfMemberId: string | null
  createdBy: string | null
  onSubmit: (input: ExpenseInput) => Promise<void>
  onCancel: () => void
  defaultValues?: Partial<FormValues & { split_type: SplitType }>
}

export default function ExpenseForm({
  members, categories, selfMemberId, createdBy, onSubmit, onCancel, defaultValues
}: Props) {
  const activeMembers = members.filter(m => !m.is_deleted)

  const { register, control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      amountStr: defaultValues?.amountStr ?? '',
      category_id: defaultValues?.category_id ?? null,
      paid_by: defaultValues?.paid_by ?? selfMemberId ?? '',
      date: defaultValues?.date ?? toDateString(new Date()),
      note: defaultValues?.note ?? '',
    },
  })

  const amountStr = watch('amountStr')
  const amount = parseAmountInput(amountStr)
  const paidBy = watch('paid_by')

  const [splitType, setSplitType] = useState<SplitType>(defaultValues?.split_type ?? 'equal')
  const [includedIds, setIncludedIds] = useState<string[]>(activeMembers.map(m => m.id))
  const [ratios, setRatios] = useState<Record<string, number>>(
    Object.fromEntries(activeMembers.map(m => [m.id, 1]))
  )
  const [individualAmounts, setIndividualAmounts] = useState<Record<string, number>>({})

  const buildSplitDetails = () => {
    if (splitType === 'equal') return calculateEqualSplit(amount, includedIds)
    if (splitType === 'ratio') return calculateRatioSplit(amount, activeMembers.map(m => m.id), ratios)
    return individualAmounts
  }

  const handleFormSubmit = async (values: FormValues) => {
    const splitDetails = buildSplitDetails()
    if (splitType === 'individual') {
      const err = validateIndividualSplit(amount, splitDetails)
      if (err) { alert(err); return }
    }
    await onSubmit({
      title: values.title,
      amount,
      category_id: values.category_id || null,
      paid_by: values.paid_by,
      split_type: splitType,
      split_details: splitDetails,
      date: values.date,
      note: values.note,
      created_by: createdBy,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* タイトル */}
      <div className="space-y-1.5">
        <Label>タイトル</Label>
        <Input placeholder="例：居酒屋代" {...register('title')} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      {/* 金額 */}
      <div className="space-y-1.5">
        <Label>金額</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">¥</span>
          <Input
            inputMode="numeric"
            placeholder="0"
            className="pl-7"
            {...register('amountStr', {
              onChange: e => {
                const v = parseAmountInput(e.target.value)
                e.target.value = v > 0 ? formatAmountInput(v) : ''
              }
            })}
          />
        </div>
        {errors.amountStr && <p className="text-xs text-destructive">{errors.amountStr.message}</p>}
      </div>

      {/* カテゴリ */}
      <div className="space-y-1.5">
        <Label>カテゴリ</Label>
        <Controller
          control={control}
          name="category_id"
          render={({ field }) => {
            const selectedCat = field.value ? categories.find(c => c.id === field.value) : null
            return (
              <Select onValueChange={v => field.onChange(v === 'none' ? null : v)} value={field.value ?? 'none'}>
                <SelectTrigger>
                  {selectedCat ? (
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: selectedCat.color }} />
                      {selectedCat.name}
                    </span>
                  ) : (
                    <SelectValue placeholder="未分類" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">未分類</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          }}
        />
      </div>

      {/* 日付 */}
      <div className="space-y-1.5">
        <Label>日付</Label>
        <Input type="date" {...register('date')} />
      </div>

      {/* 支払者 */}
      <div className="space-y-1.5">
        <Label>支払者（立替）</Label>
        <Controller
          control={control}
          name="paid_by"
          render={({ field }) => {
            const selectedMember = field.value ? activeMembers.find(m => m.id === field.value) : null
            return (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  {selectedMember ? (
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: selectedMember.color }} />
                      {selectedMember.display_name}
                    </span>
                  ) : (
                    <SelectValue placeholder="選択してください" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {activeMembers.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      <span className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                        {m.display_name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          }}
        />
        {errors.paid_by && <p className="text-xs text-destructive">{errors.paid_by.message}</p>}
      </div>

      {/* 割り勘方式 */}
      <div className="space-y-1.5">
        <Label>割り勘方式</Label>
        <Tabs value={splitType} onValueChange={v => setSplitType(v as SplitType)}>
          <TabsList className="w-full">
            <TabsTrigger value="equal" className="flex-1">均等割り</TabsTrigger>
            <TabsTrigger value="ratio" className="flex-1">比率割り</TabsTrigger>
            <TabsTrigger value="individual" className="flex-1">個別入力</TabsTrigger>
          </TabsList>
          <TabsContent value="equal" className="pt-2">
            <SplitEqualForm
              amount={amount}
              activeMembers={activeMembers}
              includedIds={includedIds}
              onChange={setIncludedIds}
            />
          </TabsContent>
          <TabsContent value="ratio" className="pt-2">
            <SplitRatioForm
              amount={amount}
              activeMembers={activeMembers}
              ratios={ratios}
              onChange={setRatios}
            />
          </TabsContent>
          <TabsContent value="individual" className="pt-2">
            <SplitIndividualForm
              amount={amount}
              activeMembers={activeMembers}
              amounts={individualAmounts}
              paidBy={paidBy}
              onChange={setIndividualAmounts}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* メモ */}
      <div className="space-y-1.5">
        <Label>メモ（任意）</Label>
        <Textarea placeholder="メモを入力" rows={2} {...register('note')} />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          キャンセル
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? '保存中...' : '保存'}
        </Button>
      </div>
    </form>
  )
}
