import { Grid2X2, LayoutGrid, List, ListFilter, Plus, Rows3, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Field'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/shared/EmptyState'
import { PageHeader } from '../components/shared/PageHeader'
import { TaskCollection } from '../features/tasks/TaskCollection'
import { TaskForm } from '../features/tasks/TaskForm'
import { TaskItem } from '../features/tasks/TaskItem'
import { useAppStore } from '../stores/app-store'
import type { Task, ViewMode } from '../types/domain'

function MatrixView({ tasks, onEdit }: { tasks: Task[]; onEdit(task: Task): void }) {
  const { t } = useTranslation(); const data = useAppStore((s) => s.data); const prefs = data.settings.taskView; const four = data.settings.matrixFourThreshold; const low = data.settings.matrixNineLow; const high = data.settings.matrixNineHigh
  const getProject = (id: string | null) => data.projects.find((x) => x.id === id); const getCategory = (id: string | null) => data.categories.find((x) => x.id === id)
  if (prefs.matrix === 'four') {
    const cells = [
      [t('matrix.importantUrgent'), (x: Task) => x.importance_score >= four && x.urgency_score >= four],
      [t('matrix.importantNotUrgent'), (x: Task) => x.importance_score >= four && x.urgency_score < four],
      [t('matrix.notImportantUrgent'), (x: Task) => x.importance_score < four && x.urgency_score >= four],
      [t('matrix.notImportantNotUrgent'), (x: Task) => x.importance_score < four && x.urgency_score < four],
    ] as const
    return <div className="matrix-grid matrix-four">{cells.map(([label, test], i) => <section key={label} className={`matrix-cell matrix-${i + 1}`}><header><span>{i + 1}</span><h3>{label}</h3><b>{tasks.filter(test).length}</b></header><div>{tasks.filter(test).map((task) => <TaskItem key={task.id} task={task} project={getProject(task.project_id)} category={getCategory(task.category_id)} compact onEdit={onEdit} />)}</div></section>)}</div>
  }
  const bands = [{ key: 'low', label: t('matrix.low'), test: (v: number) => v < low }, { key: 'medium', label: t('matrix.medium'), test: (v: number) => v >= low && v < high }, { key: 'high', label: t('matrix.high'), test: (v: number) => v >= high }]
  return <div className="matrix-nine"><div className="matrix-axis-y">{t('tasks.importance')}</div>{[...bands].reverse().map((ib) => bands.map((ub) => <section key={`${ib.key}-${ub.key}`} className="matrix-cell"><header><h3>{ib.label} I · {ub.label} U</h3></header>{tasks.filter((task) => ib.test(task.importance_score) && ub.test(task.urgency_score)).map((task) => <TaskItem key={task.id} task={task} project={getProject(task.project_id)} category={getCategory(task.category_id)} compact onEdit={onEdit} />)}</section>))}<div className="matrix-axis-x">{t('tasks.urgency')} →</div></div>
}

function ProjectBoard({ tasks, onEdit }: { tasks: Task[]; onEdit(task: Task): void }) {
  const { t } = useTranslation(); const data = useAppStore((s) => s.data); const update = useAppStore((s) => s.updateTask)
  const projects = data.projects.filter((project) => !project.deleted_at).sort((a, b) => a.sort_order - b.sort_order)
  const categories = data.categories.filter((category) => !category.deleted_at).sort((a, b) => a.sort_order - b.sort_order)
  const projectIds = new Set(projects.map((project) => project.id)); const categoryIds = new Set(categories.map((category) => category.id))
  const columns = [{ id: null, name: t('tasks.unassignedProject'), color: '#7b8190' }, ...projects.map((project) => ({ id: project.id as string | null, name: project.name, color: project.color }))]
  const belongsToProject = (task: Task, projectId: string | null) => projectId === null ? !task.project_id || !projectIds.has(task.project_id) : task.project_id === projectId
  const belongsToCategory = (task: Task, categoryId: string | null) => categoryId === null ? !task.category_id || !categoryIds.has(task.category_id) : task.category_id === categoryId
  return <div className="kanban project-board">{columns.map((column) => {
    const columnTasks = tasks.filter((task) => belongsToProject(task, column.id)); const groups = [{ id: null, name: t('tasks.noCategory') }, ...categories.map((category) => ({ id: category.id as string | null, name: category.name }))].map((group) => ({ ...group, tasks: columnTasks.filter((task) => belongsToCategory(task, group.id)) })).filter((group) => group.tasks.length > 0)
    return <section className="kanban-column project-column" key={column.id ?? 'unassigned'} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { const id = event.dataTransfer.getData('text/task-id'); if (id) update(id, { project_id: column.id }) }}><header><h3><i style={{ background: column.color }} />{column.name}</h3><span>{columnTasks.length}</span></header><div className="project-groups">{groups.length ? groups.map((group) => <section className="project-category-group" key={group.id ?? 'uncategorized'}><h4>{group.name}</h4><div>{group.tasks.map((task) => <div draggable key={task.id} onDragStart={(event) => event.dataTransfer.setData('text/task-id', task.id)}><TaskItem task={task} project={undefined} category={undefined} compact onEdit={onEdit} /></div>)}</div></section>) : <div className="board-empty">{t('tasks.emptyProject')}</div>}</div></section>
  })}</div>
}

export function TasksPage() {
  const { t } = useTranslation(); const data = useAppStore((s) => s.data); const updateSettings = useAppStore((s) => s.updateSettings); const [create, setCreate] = useState(false); const [editing, setEditing] = useState<Task | null>(null); const [search, setSearch] = useState(''); const [status, setStatus] = useState('active'); const view = data.settings.taskView.view
  const tasks = useMemo(() => {
    const q = search.trim().toLowerCase(); let list = data.tasks.filter((x) => !x.deleted_at)
    if (status === 'active') list = list.filter((x) => x.status !== 'done' && x.status !== 'archived'); else if (status !== 'all') list = list.filter((x) => x.status === status)
    if (q) list = list.filter((x) => `${x.title} ${x.description} ${x.tags.join(' ')}`.toLowerCase().includes(q))
    return [...list].sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || a.sort_order - b.sort_order)
  }, [data.tasks, search, status])
  function setView(next: ViewMode) { updateSettings({ taskView: { ...data.settings.taskView, view: next } }) }
  return <div className="page"><PageHeader title={t('tasks.title')} subtitle={t('tasks.subtitle')} actions={<Button variant="primary" onClick={() => setCreate(true)}><Plus size={16} />{t('tasks.new')}</Button>} />
    <div className="toolbar"><label className="search-box"><Search size={16} /><Input aria-label={t('common.search')} value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('tasks.searchPlaceholder')} /></label><Select aria-label={t('tasks.statusFilter')} value={status} onChange={(e) => setStatus(e.target.value)}><option value="active">{t('tasks.active')}</option><option value="all">{t('common.all')}</option><option value="todo">{t('tasks.todo')}</option><option value="doing">{t('tasks.doing')}</option><option value="done">{t('tasks.done')}</option></Select><div className="segmented"><Button aria-label={t('tasks.list')} className={view === 'list' ? 'is-active' : ''} size="icon" variant="ghost" onClick={() => setView('list')}><List size={17} /></Button><Button aria-label={t('tasks.compact')} className={view === 'compact' ? 'is-active' : ''} size="icon" variant="ghost" onClick={() => setView('compact')}><Rows3 size={17} /></Button><Button aria-label={t('tasks.card')} className={view === 'card' ? 'is-active' : ''} size="icon" variant="ghost" onClick={() => setView('card')}><LayoutGrid size={17} /></Button><Button aria-label={t('tasks.kanban')} className={view === 'kanban' ? 'is-active' : ''} size="icon" variant="ghost" onClick={() => setView('kanban')}><ListFilter size={17} /></Button><Button aria-label={t('tasks.matrix')} className={view === 'matrix' ? 'is-active' : ''} size="icon" variant="ghost" onClick={() => setView('matrix')}><Grid2X2 size={17} /></Button></div></div>
    {tasks.length === 0 && view !== 'kanban' ? <EmptyState icon={List} title={t('tasks.empty')} action={<Button onClick={() => setCreate(true)}>{t('tasks.new')}</Button>} /> : view === 'matrix' ? <MatrixView tasks={tasks} onEdit={setEditing} /> : view === 'kanban' ? <ProjectBoard tasks={tasks} onEdit={setEditing} /> : <TaskCollection tasks={tasks} projects={data.projects} categories={data.categories} view={view} onEdit={setEditing} />}
    <Modal open={create} title={t('tasks.new')} onClose={() => setCreate(false)}><TaskForm onDone={() => setCreate(false)} /></Modal>
    <Modal open={Boolean(editing)} title={t('tasks.edit')} onClose={() => setEditing(null)}>{editing && <TaskForm task={editing} onDone={() => setEditing(null)} />}</Modal>
  </div>
}
