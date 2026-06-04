-- ============================================================
-- Phase 1 スキーマ: spaces / members / expense_categories / expenses
-- ============================================================

-- spaces
CREATE TABLE IF NOT EXISTS spaces (
  id              TEXT        PRIMARY KEY,
  name            TEXT        NOT NULL DEFAULT 'マイスペース',
  base_currency   TEXT        NOT NULL DEFAULT 'JPY',
  last_edited_by  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- members
CREATE TABLE IF NOT EXISTS members (
  id              TEXT        PRIMARY KEY,
  space_id        TEXT        NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  display_name    TEXT        NOT NULL,
  color           TEXT        NOT NULL DEFAULT '#808080',
  ratio           NUMERIC     NOT NULL DEFAULT 1,
  is_deleted      BOOLEAN     NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMPTZ
);

-- expense_categories
CREATE TABLE IF NOT EXISTS expense_categories (
  id              TEXT        PRIMARY KEY,
  space_id        TEXT        NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  color           TEXT        NOT NULL,
  is_preset       BOOLEAN     NOT NULL DEFAULT FALSE
);

-- expenses
-- event_tag_id は Phase 2 で event_tags テーブル追加後に FK 制約を追加する
CREATE TABLE IF NOT EXISTS expenses (
  id              TEXT        PRIMARY KEY,
  space_id        TEXT        NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  event_tag_id    TEXT,
  category_id     TEXT        REFERENCES expense_categories(id) ON DELETE SET NULL,
  title           TEXT        NOT NULL,
  amount          NUMERIC     NOT NULL CHECK (amount >= 0),
  currency        TEXT        NOT NULL DEFAULT 'JPY',
  exchange_rate   NUMERIC     NOT NULL DEFAULT 1,
  amount_in_base  NUMERIC     NOT NULL,
  paid_by         TEXT        REFERENCES members(id) ON DELETE SET NULL,
  split_type      TEXT        NOT NULL CHECK (split_type IN ('equal', 'ratio', 'individual')),
  split_details   JSONB       NOT NULL DEFAULT '{}',
  date            DATE        NOT NULL,
  note            TEXT,
  created_by      TEXT,
  updated_by      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_members_space_id     ON members(space_id);
CREATE INDEX IF NOT EXISTS idx_categories_space_id  ON expense_categories(space_id);
CREATE INDEX IF NOT EXISTS idx_expenses_space_id    ON expenses(space_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date        ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category    ON expenses(category_id);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER spaces_updated_at
  BEFORE UPDATE ON spaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS（Row Level Security）
-- anon キーで全操作を許可（space_id の難読化でアクセス制御）
-- ============================================================
ALTER TABLE spaces            ENABLE ROW LEVEL SECURITY;
ALTER TABLE members           ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses          ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all" ON spaces             FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON members            FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON expense_categories FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON expenses           FOR ALL TO anon USING (true) WITH CHECK (true);
