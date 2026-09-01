import { BarChart3, CalendarDays, CheckSquare2, Clock3, FileClock, Focus, LayoutDashboard, Menu, NotebookPen, Settings, X } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEffect, useMemo, useState } from 'react'
import { isDesktopRuntime } from '../../repositories/app-data-repository'
import { useAppStore } from '../../stores/app-store'
import { useTimerStore } from '../../stores/timer-store'
import { setPreventSleep } from '../../services/desktop-capabilities'
import { formatDuration } from '../../utils/time'
import { Button } from '../ui/Button'

const nav = [
  ['/', 'dashboard', LayoutDashboard], ['/today', 'today', CalendarDays], ['/tasks', 'tasks', CheckSquare2],
  ['/focus', 'focus', Focus], ['/statistics', 'statistics', BarChart3], ['/memo', 'memo', NotebookPen],
  ['/history', 'history', FileClock], ['/settings', 'settings', Settings],
] as const

function useTheme() {
  const theme = useAppStore((state) => state.data.settings.theme)
  const accent = useAppStore((state) => state.data.settings.accentColor)
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => { document.documentElement.dataset.theme = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme; document.documentElement.style.setProperty('--accent', accent) }
    apply(); media.addEventListener('change', apply); return () => media.removeEventListener('change', apply)
  }, [theme, accent])
}

export function AppShell() {
  const { t } = useTranslation(); const [mobileOpen, setMobileOpen] = useState(false); useTheme()
  const timer = useTimerStore((state) => state.timer); const [now, setNow] = useState(Date.now())
  const tasks = useAppStore((state) => state.data.tasks)
  const preventSleep = useAppStore((state) => state.data.settings.preventSleep)
  useEffect(() => { if (!timer) return; const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id) }, [timer])
  useEffect(() => {
    void setPreventSleep(Boolean(preventSleep && timer?.status === 'running'))
    return () => { void setPreventSleep(false) }
  }, [preventSleep, timer?.status])
  const timerValue = useTimerStore.getState().elapsed(now)
  const timerText = timer ? (timer.mode === 'pomodoro' && timer.planned_seconds ? formatDuration(Math.max(0, timer.planned_seconds - timerValue)) : formatDuration(timerValue)) : ''
  const taskTitle = useMemo(() => tasks.find((item) => item.id === timer?.task_id)?.title ?? t('nav.focus'), [tasks, timer?.task_id, t])
  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Clock3 size={18} /></div><span>FocusFlow</span><Button className="mobile-close" size="icon" variant="ghost" onClick={() => setMobileOpen(false)}><X size={18} /></Button></div>
      <nav>{nav.map(([path, key, Icon]) => <NavLink key={path} to={path} end={path === '/'} onClick={() => setMobileOpen(false)}><Icon size={18} /><span>{t(`nav.${key}`)}</span></NavLink>)}</nav>
      <div className="sidebar-foot"><span className="status-dot" />{isDesktopRuntime ? 'SQLite · Local' : t('app.preview')}</div>
    </aside>
    <div className="main-column">
      <header className="topbar"><Button className="mobile-menu" size="icon" variant="ghost" onClick={() => setMobileOpen(true)}><Menu size={20} /></Button><div className="topbar-spacer" />{timer && <NavLink to="/focus" className="mini-timer"><span className="pulse" /><span className="mini-task">{taskTitle}</span><strong>{timerText}</strong></NavLink>}</header>
      <main className="main-content"><Outlet /></main>
    </div>
    {mobileOpen && <div className="sidebar-scrim" onClick={() => setMobileOpen(false)} />}
  </div>
}
