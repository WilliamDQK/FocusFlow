import dayjs from 'dayjs'

export function formatDuration(seconds: number, compact = false): string {
  const value = Math.max(0, Math.floor(seconds))
  const h = Math.floor(value / 3600)
  const m = Math.floor((value % 3600) / 60)
  const s = value % 60
  if (compact) return h ? `${h}h ${m}m` : `${m}m`
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

export function formatMinutes(minutes: number): string {
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${Math.round(minutes % 60)}m` : `${Math.round(minutes)}m`
}

export function localDate(value = new Date()): string { return dayjs(value).format('YYYY-MM-DD') }
export function formatDateTime(value: string): string { return dayjs(value).format('MM-DD HH:mm') }
export function toLocalInput(value: string | null): string { return value ? dayjs(value).format('YYYY-MM-DDTHH:mm') : '' }
export function fromLocalInput(value: string): string | null { return value ? new Date(value).toISOString() : null }
