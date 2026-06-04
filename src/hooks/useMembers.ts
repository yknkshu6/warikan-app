'use client'

import { useState, useEffect, useCallback } from 'react'
import { nanoid } from 'nanoid'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { Member } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => getSupabaseClient() as any

export function useMembers(spaceId: string) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await db()
        .from('members').select('*').eq('space_id', spaceId).order('display_name')
      setMembers((data ?? []) as Member[])
      setLoading(false)
    }

    fetchMembers()
    const supabase = getSupabaseClient()
    const channelName = `realtime:members:${spaceId}`

    // 既存チャンネルをアンサブスクライブ
    const existingChannel = supabase.channel(channelName)
    supabase.removeChannel(existingChannel)

    // 新しいチャンネルを登録
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members', filter: `space_id=eq.${spaceId}` },
        () => fetchMembers())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [spaceId])

  const addMember = useCallback(async (displayName: string, color: string): Promise<Member | null> => {
    const { data } = await db()
      .from('members')
      .insert({ id: nanoid(), space_id: spaceId, display_name: displayName, color })
      .select().single()
    return data as Member | null
  }, [spaceId])

  const updateMember = useCallback(async (
    memberId: string,
    updates: Partial<Pick<Member, 'display_name' | 'color' | 'ratio'>>
  ) => {
    const { data } = await db()
      .from('members').update(updates).eq('id', memberId).select().single()
    return data as Member | null
  }, [])

  const softDeleteMember = useCallback(async (memberId: string) => {
    await db()
      .from('members')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', memberId)
  }, [])

  const activeMembers = members.filter(m => !m.is_deleted)

  const refetch = useCallback(async () => {
    const { data } = await db()
      .from('members').select('*').eq('space_id', spaceId).order('display_name')
    setMembers((data ?? []) as Member[])
  }, [spaceId])

  return { members, activeMembers, loading, addMember, updateMember, softDeleteMember, refetch }
}
