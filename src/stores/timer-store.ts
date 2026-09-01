import { create } from 'zustand'
import { useAppStore } from './app-store'
import type { ActiveTimer, FocusMode, FocusSession, Task } from '../types/domain'
import { shouldRecordSession } from '../services/focus-policy'

const TIMER_KEY = 'focusflow.active-timer.v1'

function readTimer(): ActiveTimer | null {
  try { const value = localStorage.getItem(TIMER_KEY); return value ? JSON.parse(value) as ActiveTimer : null } catch { return null }
}
function elapsed(timer: ActiveTimer, now = Date.now()): number {
  return timer.accumulated_seconds + (timer.status === 'running' && timer.running_since ? Math.max(0, Math.floor((now - new Date(timer.running_since).getTime()) / 1000)) : 0)
}

interface TimerStore {
  timer: ActiveTimer | null
  start(mode: FocusMode, task: Task | null, plannedMinutes?: number): void
  pause(): void
  resume(): void
  finish(interrupted?: boolean, note?: string): { saved: boolean; duration: number }
  reset(): void
  elapsed(now?: number): number
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  timer: readTimer(),
  start(mode, task, plannedMinutes) {
    const settings = useAppStore.getState().data.settings; const now = new Date().toISOString()
    const timer: ActiveTimer = { id: crypto.randomUUID(), mode, phase: 'focus', status: 'running', task_id: task?.id ?? null, project_id: task?.project_id ?? null, started_at: now, running_since: now, accumulated_seconds: 0, planned_seconds: mode === 'pomodoro' ? Math.max(1, plannedMinutes ?? settings.pomodoroMinutes) * 60 : 0, completed_cycles: 0, segments: [] }
    localStorage.setItem(TIMER_KEY, JSON.stringify(timer)); set({ timer })
  },
  pause() {
    const timer = get().timer; if (!timer || timer.status === 'paused' || !timer.running_since) return
    const end = new Date().toISOString(); const seconds = Math.max(0, Math.floor((new Date(end).getTime() - new Date(timer.running_since).getTime()) / 1000))
    const next: ActiveTimer = { ...timer, status: 'paused', running_since: null, accumulated_seconds: timer.accumulated_seconds + seconds, segments: [...timer.segments, { start_time: timer.running_since, end_time: end, duration_seconds: seconds }] }
    localStorage.setItem(TIMER_KEY, JSON.stringify(next)); set({ timer: next })
  },
  resume() { const timer = get().timer; if (!timer || timer.status === 'running') return; const next: ActiveTimer = { ...timer, status: 'running', running_since: new Date().toISOString() }; localStorage.setItem(TIMER_KEY, JSON.stringify(next)); set({ timer: next }) },
  finish(interrupted = false, note = '') {
    const timer = get().timer; if (!timer) return { saved: false, duration: 0 }
    const end = new Date().toISOString(); const duration = elapsed(timer)
    const data = useAppStore.getState().data; const task = data.tasks.find((item) => item.id === timer.task_id) ?? null
    const settings = data.settings; const saved = !interrupted && shouldRecordSession(duration, task?.estimated_focus_minutes ?? 0, settings)
    if (saved) {
      const segments = timer.status === 'running' && timer.running_since ? [...timer.segments, { start_time: timer.running_since, end_time: end, duration_seconds: Math.max(0, Math.floor((new Date(end).getTime() - new Date(timer.running_since).getTime()) / 1000)) }] : timer.segments
      const session: FocusSession = { id: timer.id, created_at: timer.started_at, updated_at: end, deleted_at: null, version: 1, task_id: task?.id ?? null, project_id: timer.project_id, task_title: task?.title ?? '', tags: task?.tags ?? [], start_time: timer.started_at, end_time: end, duration_seconds: duration, planned_duration_seconds: timer.planned_seconds, mode: timer.mode, completed: true, interrupted: false, note, segments }
      useAppStore.getState().addSession(session)
    }
    localStorage.removeItem(TIMER_KEY); set({ timer: null }); return { saved, duration }
  },
  reset() { localStorage.removeItem(TIMER_KEY); set({ timer: null }) },
  elapsed(now) { const timer = get().timer; return timer ? elapsed(timer, now) : 0 },
}))
