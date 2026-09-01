PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0, payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT, version INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_projects_active_sort ON projects(deleted_at, is_archived, sort_order);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT, version INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_categories_active_sort ON categories(deleted_at, sort_order);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK(status IN ('todo','doing','done','archived')),
  priority TEXT NOT NULL CHECK(priority IN ('none','low','medium','high','urgent')),
  importance_score INTEGER NOT NULL DEFAULT 50 CHECK(importance_score BETWEEN 0 AND 100),
  urgency_score INTEGER NOT NULL DEFAULT 50 CHECK(urgency_score BETWEEN 0 AND 100),
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  parent_task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  estimated_focus_minutes INTEGER NOT NULL DEFAULT 0,
  due_date TEXT, scheduled_date TEXT, completed_at TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0, is_pinned INTEGER NOT NULL DEFAULT 0,
  payload_json TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT, version INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_tasks_status_sort ON tasks(deleted_at, status, sort_order);
CREATE INDEX IF NOT EXISTS idx_tasks_schedule ON tasks(deleted_at, scheduled_date, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id, status, deleted_at);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category_id, status, deleted_at);

CREATE TABLE IF NOT EXISTS memos (
  id TEXT PRIMARY KEY, title TEXT NOT NULL DEFAULT '', content TEXT NOT NULL DEFAULT '',
  task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL, is_pinned INTEGER NOT NULL DEFAULT 0,
  payload_json TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT, version INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_memos_active_updated ON memos(deleted_at, is_pinned, updated_at DESC);

CREATE TABLE IF NOT EXISTS focus_sessions (
  id TEXT PRIMARY KEY, task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  start_time TEXT NOT NULL, end_time TEXT NOT NULL, duration_seconds INTEGER NOT NULL CHECK(duration_seconds >= 0),
  planned_duration_seconds INTEGER NOT NULL DEFAULT 0,
  mode TEXT NOT NULL CHECK(mode IN ('pomodoro','stopwatch')),
  completed INTEGER NOT NULL DEFAULT 1, interrupted INTEGER NOT NULL DEFAULT 0,
  note TEXT NOT NULL DEFAULT '', payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT, version INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_sessions_time ON focus_sessions(deleted_at, start_time);
CREATE INDEX IF NOT EXISTS idx_sessions_task_time ON focus_sessions(task_id, start_time);
CREATE INDEX IF NOT EXISTS idx_sessions_project_time ON focus_sessions(project_id, start_time);

CREATE TABLE IF NOT EXISTS focus_session_segments (
  id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES focus_sessions(id) ON DELETE CASCADE,
  start_time TEXT NOT NULL, end_time TEXT NOT NULL, duration_seconds INTEGER NOT NULL CHECK(duration_seconds >= 0)
);
CREATE INDEX IF NOT EXISTS idx_segments_session ON focus_session_segments(session_id, start_time);

CREATE TABLE IF NOT EXISTS settings (
  namespace TEXT NOT NULL, key TEXT NOT NULL, value_json TEXT NOT NULL, updated_at TEXT NOT NULL,
  PRIMARY KEY(namespace, key)
);

CREATE TABLE IF NOT EXISTS active_timer_state (
  singleton_key INTEGER PRIMARY KEY CHECK(singleton_key = 1), payload_json TEXT NOT NULL, updated_at TEXT NOT NULL
);
