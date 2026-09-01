import { CalendarDays, Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '../components/shared/PageHeader'
import { EmptyState } from '../components/shared/EmptyState'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { TaskCollection } from '../features/tasks/TaskCollection'
import { TaskForm } from '../features/tasks/TaskForm'
import { useAppStore } from '../stores/app-store'
import type { Task } from '../types/domain'
import { localDate } from '../utils/time'

export function TodayPage() {
  const { t } = useTranslation(); const [open, setOpen] = useState(false); const [editing, setEditing] = useState<Task | null>(null); const data = useAppStore((s) => s.data); const today = localDate(); const tasks = data.tasks.filter((x) => !x.deleted_at && x.status !== 'archived' && (x.scheduled_date === today || x.due_date?.slice(0, 10) === today)).sort((a, b) => Number(a.status === 'done') - Number(b.status === 'done') || a.sort_order - b.sort_order)
  return <div className="page"><PageHeader title={t('nav.today')} subtitle={today} actions={<Button variant="primary" onClick={() => setOpen(true)}><Plus size={16} />{t('tasks.new')}</Button>} />{tasks.length ? <TaskCollection tasks={tasks} projects={data.projects} categories={data.categories} view="list" onEdit={setEditing} /> : <EmptyState icon={CalendarDays} title={t('tasks.empty')} action={<Button onClick={() => setOpen(true)}>{t('tasks.new')}</Button>} />}<Modal open={open} title={t('tasks.new')} onClose={() => setOpen(false)}><TaskForm initialDate={today} onDone={() => setOpen(false)} /></Modal><Modal open={Boolean(editing)} title={t('tasks.edit')} onClose={() => setEditing(null)}>{editing && <TaskForm task={editing} onDone={() => setEditing(null)} />}</Modal></div>
}
