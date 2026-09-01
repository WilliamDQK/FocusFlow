ALTER TABLE memos ADD COLUMN category_id TEXT REFERENCES categories(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_memos_category_updated ON memos(category_id, deleted_at, updated_at DESC);
