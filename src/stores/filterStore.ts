'use client'

import { create } from 'zustand'
import { currentPeriod } from '@/lib/utils/date'
import type { SortKey } from '@/types'

interface FilterState {
  period: string | null
  categoryId: string | null
  sort: SortKey
  search: string
  selfMemberId: string | null
  showSelfOnly: boolean

  setPeriod: (period: string | null) => void
  setCategoryId: (id: string | null) => void
  setSort: (sort: SortKey) => void
  setSearch: (search: string) => void
  setSelfMemberId: (id: string | null) => void
  setShowSelfOnly: (show: boolean) => void
  reset: () => void
}

const defaultState = {
  period: currentPeriod(),
  categoryId: null,
  sort: 'date_desc' as SortKey,
  search: '',
  selfMemberId: null,
  showSelfOnly: false,
}

export const useFilterStore = create<FilterState>((set) => ({
  ...defaultState,
  setPeriod: (period) => set({ period }),
  setCategoryId: (categoryId) => set({ categoryId }),
  setSort: (sort) => set({ sort }),
  setSearch: (search) => set({ search }),
  setSelfMemberId: (selfMemberId) => set({ selfMemberId }),
  setShowSelfOnly: (showSelfOnly) => set({ showSelfOnly }),
  reset: () => set({ ...defaultState, period: currentPeriod() }),
}))
