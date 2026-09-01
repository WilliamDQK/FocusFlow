export type TaskStatus = 'todo' | 'doing' | 'done' | 'archived'
export type Priority = 'none' | 'low' | 'medium' | 'high' | 'urgent'
export type FocusMode = 'pomodoro' | 'stopwatch'
export type ThemeMode = 'light' | 'dark' | 'system'
export type Language = 'zh-CN' | 'en-US'
export type ViewMode = 'list' | 'compact' | 'card' | 'kanban' | 'matrix'
export type MatrixMode = 'four' | 'nine'

export interface EntityMeta {
  id: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  version: number
}

export interface Task extends EntityMeta {
  title: string
  description: string
  status: TaskStatus
  previous_status: TaskStatus
  priority: Priority
  importance_score: number
  urgency_score: number
  project_id: string | null
  category_id: string | null
  parent_task_id: string | null
  tags: string[]
  estimated_focus_minutes: number
  due_date: string | null
  scheduled_date: string | null
  completed_at: string | null
  sort_order: number
  is_pinned: boolean
  recurrence: 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly'
  reminder_at: string | null
}

export interface Project extends EntityMeta {
  name: string
  description: string
  color: string
  sort_order: number
  is_archived: boolean
}

export interface Category extends EntityMeta {
  name: string
  color: string
  sort_order: number
}

export interface Memo extends EntityMeta {
  title: string
  content: string
  task_id: string | null
  category_id: string | null
  tags: string[]
  is_pinned: boolean
}

export interface FocusSegment {
  start_time: string
  end_time: string
  duration_seconds: number
}

export interface FocusSession extends EntityMeta {
  task_id: string | null
  project_id: string | null
  task_title: string
  tags: string[]
  start_time: string
  end_time: string
  duration_seconds: number
  planned_duration_seconds: number
  mode: FocusMode
  completed: boolean
  interrupted: boolean
  note: string
  segments: FocusSegment[]
}

export interface TaskViewPreferences {
  view: ViewMode
  matrix: MatrixMode
  density: 'comfortable' | 'compact'
  cardSize: 'small' | 'medium' | 'large'
  showDescription: boolean
  showTags: boolean
  showProject: boolean
  showEstimate: boolean
  showActual: boolean
  showDueDate: boolean
  showPriority: boolean
  showProgress: boolean
  sortBy: 'manual' | 'priority' | 'due' | 'created' | 'title'
  groupBy: 'none' | 'project' | 'priority' | 'status' | 'due'
  showCompleted: boolean
}

export interface PanelPreferences {
  enabled: boolean
  positionLocked: boolean
  zOrder: 'normal' | 'alwaysOnTop' | 'desktop'
  backgroundOpacity: number
  snapEnabled: boolean
  snapThreshold: number
  autoHide: boolean
  clickThrough: boolean
}

export interface AppSettings {
  theme: ThemeMode
  language: Language
  accentColor: string
  dashboardQuote: string
  pomodoroMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  longBreakInterval: number
  autoOvertime: boolean
  overtimeMinutes: number
  autoStartBreak: boolean
  autoStartFocus: boolean
  sound: boolean
  notification: boolean
  preventSleep: boolean
  pauseOnLock: boolean
  minimumRecordPercent: number
  thresholdExemptionMinutes: number
  streakMinutes: number
  matrixFourThreshold: number
  matrixNineLow: number
  matrixNineHigh: number
  autoBackup: boolean
  keepDailyBackups: number
  keepWeeklyBackups: number
  keepMonthlyBackups: number
  closeToTray: boolean
  autostart: boolean
  shortcuts: Record<string, string>
  taskView: TaskViewPreferences
  taskPanel: PanelPreferences
  timerPanel: PanelPreferences
}

export interface AppData {
  tasks: Task[]
  projects: Project[]
  categories: Category[]
  memos: Memo[]
  sessions: FocusSession[]
  settings: AppSettings
}

export interface ActiveTimer {
  id: string
  mode: FocusMode
  phase: 'focus' | 'short_break' | 'long_break'
  status: 'running' | 'paused'
  task_id: string | null
  project_id: string | null
  started_at: string
  running_since: string | null
  accumulated_seconds: number
  planned_seconds: number
  completed_cycles: number
  segments: FocusSegment[]
}

export interface BackupFile {
  format: 'focusflow-backup'
  schema_version: 1
  app_version: string
  exported_at: string
  data: AppData
}
