import { create } from 'zustand'
import i18n from '../lib/i18n'
import { appDataRepository, backupDatabase, configureCloseToTray, createBackup, isDesktopRuntime, parseBackup } from '../repositories/app-data-repository'
import { emptyData } from '../services/defaults'
import type { AppData, AppSettings, Category, FocusSession, Memo, Project, Task } from '../types/domain'

type NewTask = Pick<Task, 'title'> & Partial<Omit<Task, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'version' | 'title'>>

interface AppStore {
  data: AppData
  hydrated: boolean
  hydrate(): Promise<void>
  replaceData(data: AppData): void
  addTask(input: NewTask): Task
  updateTask(id: string, patch: Partial<Task>): void
  toggleTask(id: string): void
  removeTask(id: string): void
  addCategory(name: string, color?: string): Category
  addProject(name: string, color?: string): Project
  addMemo(): Memo
  updateMemo(id: string, patch: Partial<Memo>): void
  removeMemo(id: string): void
  addSession(session: FocusSession): void
  removeSession(id: string): void
  updateSettings(patch: Partial<AppSettings>): void
  exportJson(): void
  exportCsv(): void
  backup(): Promise<string | null>
  importJson(file: File): Promise<void>
}

const nowMeta = () => { const now = new Date().toISOString(); return { id: crypto.randomUUID(), created_at: now, updated_at: now, deleted_at: null, version: 1 } }

let persistenceReady = false
let saveTimer: ReturnType<typeof setTimeout> | null = null

export const useAppStore = create<AppStore>((set, get) => ({
  data: emptyData(), hydrated: false,
  async hydrate() {
    const data = await appDataRepository.load()
    set({ data, hydrated: true })
    persistenceReady = true
    document.documentElement.lang = data.settings.language
    await i18n.changeLanguage(data.settings.language)
    try { await configureCloseToTray(data.settings.closeToTray) } catch { /* Keep the UI usable if desktop integration is unavailable. */ }
    if (isDesktopRuntime && data.settings.autoBackup) {
      const key = 'focusflow.last-auto-backup.v1'; const today = new Date().toLocaleDateString('sv-SE')
      if (localStorage.getItem(key) !== today) {
        try { await backupDatabase(); localStorage.setItem(key, today) } catch { /* A failed automatic backup must not prevent app startup. */ }
      }
    }
  },
  replaceData(data) { set({ data }) },
  addTask(input) {
    const task: Task = {
      ...nowMeta(), title: input.title, description: input.description ?? '', status: input.status ?? 'todo',
      previous_status: input.previous_status ?? 'todo', priority: input.priority ?? 'none',
      importance_score: input.importance_score ?? 50, urgency_score: input.urgency_score ?? 50,
      project_id: input.project_id ?? null, category_id: input.category_id ?? null,
      parent_task_id: input.parent_task_id ?? null, tags: input.tags ?? [],
      estimated_focus_minutes: input.estimated_focus_minutes ?? 0, due_date: input.due_date ?? null,
      scheduled_date: input.scheduled_date ?? null, completed_at: null,
      sort_order: input.sort_order ?? get().data.tasks.length * 1024, is_pinned: input.is_pinned ?? false,
      recurrence: input.recurrence ?? 'none', reminder_at: input.reminder_at ?? null,
    }
    set((state) => ({ data: { ...state.data, tasks: [...state.data.tasks, task] } }))
    return task
  },
  updateTask(id, patch) {
    set((state) => ({ data: { ...state.data, tasks: state.data.tasks.map((task) => task.id === id ? { ...task, ...patch, updated_at: new Date().toISOString(), version: task.version + 1 } : task) } }))
  },
  toggleTask(id) {
    const task = get().data.tasks.find((item) => item.id === id); if (!task) return
    if (task.status === 'done') get().updateTask(id, { status: task.previous_status === 'done' ? 'todo' : task.previous_status, completed_at: null })
    else get().updateTask(id, { previous_status: task.status, status: 'done', completed_at: new Date().toISOString() })
  },
  removeTask(id) { get().updateTask(id, { deleted_at: new Date().toISOString() }) },
  addCategory(name, color = '#64748b') {
    const item: Category = { ...nowMeta(), name, color, sort_order: get().data.categories.length * 1024 }
    set((state) => ({ data: { ...state.data, categories: [...state.data.categories, item] } })); return item
  },
  addProject(name, color = '#5268d9') {
    const item: Project = { ...nowMeta(), name, description: '', color, sort_order: get().data.projects.length * 1024, is_archived: false }
    set((state) => ({ data: { ...state.data, projects: [...state.data.projects, item] } })); return item
  },
  addMemo() {
    const memo: Memo = { ...nowMeta(), title: '', content: '', task_id: null, category_id: null, tags: [], is_pinned: false }
    set((state) => ({ data: { ...state.data, memos: [memo, ...state.data.memos] } })); return memo
  },
  updateMemo(id, patch) { set((state) => ({ data: { ...state.data, memos: state.data.memos.map((memo) => memo.id === id ? { ...memo, ...patch, updated_at: new Date().toISOString(), version: memo.version + 1 } : memo) } })) },
  removeMemo(id) { set((state) => ({ data: { ...state.data, memos: state.data.memos.map((memo) => memo.id === id ? { ...memo, deleted_at: new Date().toISOString() } : memo) } })) },
  addSession(session) { set((state) => ({ data: { ...state.data, sessions: [session, ...state.data.sessions] } })) },
  removeSession(id) { set((state) => ({ data: { ...state.data, sessions: state.data.sessions.map((session) => session.id === id ? { ...session, deleted_at: new Date().toISOString() } : session) } })) },
  updateSettings(patch) {
    set((state) => ({ data: { ...state.data, settings: { ...state.data.settings, ...patch } } }))
    if (patch.language) { document.documentElement.lang = patch.language; void i18n.changeLanguage(patch.language) }
    if (patch.closeToTray !== undefined) void configureCloseToTray(patch.closeToTray)
  },
  exportJson() {
    const blob = new Blob([JSON.stringify(createBackup(get().data), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url
    link.download = `focusflow-backup-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url)
  },
  exportCsv() {
    const data = get().data
    const projectNames = new Map(data.projects.map((project) => [project.id, project.name]))
    const cell = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`
    const rows = [
      ['session_id', 'task', 'project', 'start_time', 'end_time', 'duration_seconds', 'duration_minutes', 'mode', 'tags', 'note'],
      ...data.sessions.filter((session) => !session.deleted_at).map((session) => [session.id, session.task_title, session.project_id ? projectNames.get(session.project_id) ?? '' : '', session.start_time, session.end_time, session.duration_seconds, Math.round(session.duration_seconds / 6) / 10, session.mode, session.tags.join('|'), session.note]),
    ]
    const blob = new Blob([`\uFEFF${rows.map((row) => row.map(cell).join(',')).join('\r\n')}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url
    link.download = `focusflow-sessions-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url)
  },
  async backup() {
    if (!isDesktopRuntime) { get().exportJson(); return null }
    return backupDatabase()
  },
  async importJson(file) {
    const raw = await file.text(); const data = parseBackup(raw)
    if (isDesktopRuntime) await backupDatabase()
    set({ data })
    void configureCloseToTray(data.settings.closeToTray)
  },
}))

useAppStore.subscribe((state) => {
  if (!persistenceReady) return
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => { void appDataRepository.save(state.data) }, 250)
})
