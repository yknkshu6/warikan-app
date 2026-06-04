export type SplitType = 'equal' | 'ratio' | 'individual'
export type RecurrenceType = 'monthly' | 'weekly'
export type SortKey = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'category' | 'created_by'

export interface Space {
  id: string
  name: string
  base_currency: string
  last_edited_by: string | null
  created_at: string
  updated_at: string
}

export interface Member {
  id: string
  space_id: string
  display_name: string
  color: string
  ratio: number
  is_deleted: boolean
  deleted_at: string | null
}

export interface ExpenseCategory {
  id: string
  space_id: string
  name: string
  color: string
  is_preset: boolean
}

export interface EventTag {
  id: string
  space_id: string
  name: string
  color: string
  description: string | null
  finalized_at: string | null
  finalized_by: string | null
  created_by: string | null
  created_at: string
}

export interface EventTagMember {
  event_tag_id: string
  member_id: string
}

export type SplitDetail = Record<string, number>

export interface Expense {
  id: string
  space_id: string
  event_tag_id: string | null
  category_id: string | null
  title: string
  amount: number
  currency: string
  exchange_rate: number
  amount_in_base: number
  paid_by: string | null
  split_type: SplitType
  split_details: SplitDetail
  date: string
  note: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface RecurringExpense {
  id: string
  space_id: string
  title: string
  amount: number
  currency: string
  category_id: string | null
  paid_by: string | null
  split_type: SplitType
  split_details: SplitDetail
  recurrence_type: RecurrenceType
  recurrence_day: number
  is_active: boolean
  last_applied_at: string | null
  created_by: string | null
  created_at: string
}

export interface SettlementRecord {
  id: string
  space_id: string
  event_tag_id: string
  from_member_id: string
  to_member_id: string
  amount: number
  currency: string
  note: string | null
  recorded_by: string | null
  settled_at: string
}

// localStorage
export interface MembershipRecord {
  space_id: string
  member_id: string
  display_name: string
  last_visited: string
}

export interface RecentlyVisited {
  space_id: string
  space_name: string
  visited_at: string
}

export interface UserSession {
  memberships: MembershipRecord[]
  recently_visited: RecentlyVisited[]
}

// 計算用
export interface Settlement {
  from_member_id: string
  to_member_id: string
  amount: number
}

export interface MemberBalance {
  member_id: string
  display_name: string
  color: string
  total_paid: number
  total_owed: number
  net_balance: number
}
