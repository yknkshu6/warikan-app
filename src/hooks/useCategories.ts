'use client'

import { useState, useEffect, useCallback } from 'react'
import { nanoid } from 'nanoid'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { ExpenseCategory } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => getSupabaseClient() as any

export function useCategories(spaceId: string) {
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await db()
        .from('expense_categories').select('*').eq('space_id', spaceId)
        .order('is_preset', { ascending: false }).order('name')
      setCategories((data ?? []) as ExpenseCategory[])
      setLoading(false)
    }

    fetchCategories()
    const supabase = getSupabaseClient()
    const channelName = `realtime:categories:${spaceId}`

    const existingChannel = supabase.channel(channelName)
    supabase.removeChannel(existingChannel)

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expense_categories', filter: `space_id=eq.${spaceId}` },
        () => fetchCategories())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [spaceId])

  const addCategory = useCallback(async (name: string, color: string) => {
    const { data } = await db()
      .from('expense_categories')
      .insert({ id: nanoid(), space_id: spaceId, name, color, is_preset: false })
      .select().single()
    return data as ExpenseCategory | null
  }, [spaceId])

  const deleteCategory = useCallback(async (categoryId: string) => {
    await db().from('expense_categories').delete().eq('id', categoryId)
  }, [])

  const refetch = useCallback(async () => {
    const { data } = await db()
      .from('expense_categories').select('*').eq('space_id', spaceId)
      .order('is_preset', { ascending: false }).order('name')
    setCategories((data ?? []) as ExpenseCategory[])
  }, [spaceId])

  return { categories, loading, addCategory, deleteCategory, refetch }
}
