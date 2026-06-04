'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { Space } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => getSupabaseClient() as any

export function useSpace(spaceId: string) {
  const [space, setSpace] = useState<Space | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSpace = async () => {
      const { data } = await db().from('spaces').select('*').eq('id', spaceId).single()
      setSpace(data as Space | null)
      setLoading(false)
    }

    fetchSpace()
    const supabase = getSupabaseClient()
    const channelName = `realtime:space:${spaceId}`

    const existingChannel = supabase.channel(channelName)
    supabase.removeChannel(existingChannel)

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'spaces', filter: `id=eq.${spaceId}` },
        payload => setSpace(payload.new as Space))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [spaceId])

  const refetch = useCallback(async () => {
    const { data } = await db().from('spaces').select('*').eq('id', spaceId).single()
    setSpace(data as Space | null)
  }, [spaceId])

  const updateSpace = useCallback(async (updates: Partial<Space>, editedBy: string) => {
    const { data } = await db()
      .from('spaces')
      .update({ ...updates, last_edited_by: editedBy })
      .eq('id', spaceId).select().single()
    if (data) setSpace(data as Space)
    return data as Space | null
  }, [spaceId])

  return { space, loading, updateSpace, refetch }
}
