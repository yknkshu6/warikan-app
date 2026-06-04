'use client'

import { useState, useEffect, useCallback } from 'react'
import { nanoid } from 'nanoid'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { Expense, SplitType, SplitDetail } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => getSupabaseClient() as any

export interface ExpenseInput {
  title: string
  amount: number
  category_id: string | null
  paid_by: string | null
  split_type: SplitType
  split_details: SplitDetail
  date: string
  note: string
  event_tag_id?: string | null
  created_by?: string | null
}

export function useExpenses(spaceId: string) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchExpenses = async () => {
      const { data } = await db()
        .from('expenses')
        .select('*')
        .eq('space_id', spaceId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
      setExpenses((data ?? []) as Expense[])
      setLoading(false)
    }

    fetchExpenses()
    const supabase = getSupabaseClient()
    const channelName = `realtime:expenses:${spaceId}`

    // 既存チャンネルをアンサブスクライブ
    const existingChannel = supabase.channel(channelName)
    supabase.removeChannel(existingChannel)

    // 新しいチャンネルを登録
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `space_id=eq.${spaceId}` },
        () => fetchExpenses())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [spaceId])

  const addExpense = useCallback(async (input: ExpenseInput): Promise<Expense | null> => {
    const { data } = await db()
      .from('expenses')
      .insert({
        id: nanoid(),
        space_id: spaceId,
        title: input.title,
        amount: input.amount,
        currency: 'JPY',
        exchange_rate: 1,
        amount_in_base: input.amount,
        category_id: input.category_id,
        paid_by: input.paid_by,
        split_type: input.split_type,
        split_details: input.split_details,
        date: input.date,
        note: input.note || null,
        event_tag_id: input.event_tag_id ?? null,
        created_by: input.created_by ?? null,
        updated_by: input.created_by ?? null,
      })
      .select().single()
    return data as Expense | null
  }, [spaceId])

  const updateExpense = useCallback(async (
    expenseId: string,
    input: Partial<ExpenseInput> & { updated_by?: string | null }
  ): Promise<Expense | null> => {
    const updates: Record<string, unknown> = { ...input }
    if (input.amount !== undefined) {
      updates.amount_in_base = input.amount
    }
    const { data } = await db()
      .from('expenses').update(updates).eq('id', expenseId).select().single()
    return data as Expense | null
  }, [])

  const deleteExpense = useCallback(async (expenseId: string) => {
    await db().from('expenses').delete().eq('id', expenseId)
  }, [])

  const refetch = useCallback(async () => {
    const { data } = await db()
      .from('expenses')
      .select('*')
      .eq('space_id', spaceId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
    setExpenses((data ?? []) as Expense[])
  }, [spaceId])

  return { expenses, loading, addExpense, updateExpense, deleteExpense, refetch }
}
