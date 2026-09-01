import { CalendarClock, Clock3, Pencil, Pin, Play, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Category, Project, Task } from '../../types/domain'
import { formatDateTime } from '../../utils/time'
import { Button } from '../../components/ui/Button'
import { useAppStore } from '../../stores/app-store'

const priorityTone = { none: '', low: 'tone-low', medium: 'tone-medium', high: 'tone-high', urgent: 'tone-urgent' } as const

export function TaskItem({ task, project, category, compact = false, card = false, onEdit }: { task: Task; project: Project | undefined; category: Category | undefined; compact?: boolean; card?: boolean; onEdit?: ((task: Task) => void) | undefined }) {
  const { t } = useTranslation(); const toggle = useAppStore((s) => s.toggleTask); const update = useAppStore((s) => s.updateTask); const remove = useAppStore((s) => s.removeTask); const prefs = useAppStore((s) => s.data.settings.taskView)
  return <article className={`task-item ${compact ? 'is-compact' : ''} ${card ? 'is-card' : ''} ${task.status === 'done' ? 'is-done' : ''}`}>
    <button className="task-check" aria-label={task.status === 'done' ? t('tasks.restore') : t('tasks.complete')} onClick={() => toggle(task.id)}><span /></button>
    <div className="task-body">
      <div className="task-title-row"><h3>{task.title}</h3>{task.is_pinned && <Pin size={13} fill="currentColor" />}</div>
      {!compact && prefs.showDescription && task.description && <p className="task-description">{task.description}</p>}
      <div className="task-meta">
        {prefs.showPriority && task.priority !== 'none' && <span className={`priority-dot ${priorityTone[task.priority]}`}>{task.priority}</span>}
        {prefs.showProject && project && <span className="meta-chip" style={{ '--chip-color': project.color } as React.CSSProperties}>{project.name}</span>}
        {category && <span className="meta-chip" style={{ '--chip-color': category.color } as React.CSSProperties}>{category.name}</span>}
        {prefs.showTags && task.tags.map((tag) => <span key={tag} className="tag">#{tag}</span>)}
        {prefs.showEstimate && task.estimated_focus_minutes > 0 && <span><Clock3 size={13} />{task.estimated_focus_minutes}m</span>}
        {prefs.showDueDate && task.due_date && <span><CalendarClock size={13} />{formatDateTime(task.due_date)}</span>}
        <span className="score-pair"><b>I</b>{task.importance_score}<b>U</b>{task.urgency_score}</span>
      </div>
    </div>
    <div className="task-actions"><Link to={`/focus?task=${task.id}`} className="icon-link" aria-label={t('dashboard.quickStart')}><Play size={16} /></Link>{onEdit && <Button variant="ghost" size="icon" aria-label={t('common.edit')} onClick={() => onEdit(task)}><Pencil size={15} /></Button>}<Button variant="ghost" size="icon" aria-label={t('tasks.pin')} onClick={() => update(task.id, { is_pinned: !task.is_pinned })}><Pin size={15} /></Button><Button variant="ghost" size="icon" aria-label={t('common.delete')} onClick={() => remove(task.id)}><Trash2 size={15} /></Button></div>
  </article>
}
