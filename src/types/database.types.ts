import type { Space, Member, ExpenseCategory, Expense } from './index'

type TableDef<Row, Insert, Update = Partial<Row>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      spaces: TableDef<
        Space,
        { id: string; name?: string; base_currency?: string; last_edited_by?: string | null }
      >
      members: TableDef<
        Member,
        { id: string; space_id: string; display_name: string; color: string; ratio?: number; is_deleted?: boolean; deleted_at?: string | null }
      >
      expense_categories: TableDef<
        ExpenseCategory,
        { id: string; space_id: string; name: string; color: string; is_preset?: boolean }
      >
      expenses: TableDef<
        Expense,
        {
          id: string; space_id: string; event_tag_id?: string | null; category_id?: string | null
          title: string; amount: number; currency?: string; exchange_rate?: number; amount_in_base: number
          paid_by?: string | null; split_type: string; split_details?: Record<string, number>
          date: string; note?: string | null; created_by?: string | null; updated_by?: string | null
        }
      >
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
