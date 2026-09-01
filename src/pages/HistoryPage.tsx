import { Clock3, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '../components/shared/PageHeader'
import { EmptyState } from '../components/shared/EmptyState'
import { Button } from '../components/ui/Button'
import { useAppStore } from '../stores/app-store'
import { formatDateTime, formatDuration } from '../utils/time'

export function HistoryPage() {
  const { t } = useTranslation(); const sessions = useAppStore((s) => s.data.sessions).filter((x) => !x.deleted_at).sort((a, b) => b.start_time.localeCompare(a.start_time)); const remove = useAppStore((s) => s.removeSession)
  return <div className="page"><PageHeader title={t('history.title')} subtitle={t('history.subtitle')} />{sessions.length ? <div className="table-wrap"><table><thead><tr><th>{t('history.task')}</th><th>{t('history.time')}</th><th>{t('history.duration')}</th><th>{t('history.mode')}</th><th>{t('history.note')}</th><th /></tr></thead><tbody>{sessions.map((session) => <tr key={session.id}><td><strong>{session.task_title || t('history.freeFocus')}</strong></td><td>{formatDateTime(session.start_time)} → {new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</td><td>{formatDuration(session.duration_seconds, true)}</td><td><span className="mode-label">{t(`focus.${session.mode}`)}</span></td><td>{session.note || '—'}</td><td><Button size="icon" variant="ghost" aria-label={t('common.delete')} onClick={() => remove(session.id)}><Trash2 size={15} /></Button></td></tr>)}</tbody></table></div> : <EmptyState icon={Clock3} title={t('history.empty')} />}</div>
}
