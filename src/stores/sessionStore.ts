'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MembershipRecord, RecentlyVisited } from '@/types'

interface SessionState {
  memberships: MembershipRecord[]
  recently_visited: RecentlyVisited[]
  getMembership: (spaceId: string) => MembershipRecord | undefined
  setMembership: (membership: MembershipRecord) => void
  addRecentlyVisited: (spaceId: string, spaceName: string) => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      memberships: [],
      recently_visited: [],

      getMembership: (spaceId) =>
        get().memberships.find(m => m.space_id === spaceId),

      setMembership: (membership) =>
        set(state => ({
          memberships: [
            ...state.memberships.filter(m => m.space_id !== membership.space_id),
            { ...membership, last_visited: new Date().toISOString() },
          ],
        })),

      addRecentlyVisited: (spaceId, spaceName) =>
        set(state => ({
          recently_visited: [
            { space_id: spaceId, space_name: spaceName, visited_at: new Date().toISOString() },
            ...state.recently_visited.filter(r => r.space_id !== spaceId),
          ].slice(0, 10),
        })),
    }),
    { name: 'warikan-session' }
  )
)
