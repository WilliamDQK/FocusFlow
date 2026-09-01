import type { LucideIcon } from 'lucide-react'
export function EmptyState({ icon: Icon, title, action }: { icon: LucideIcon; title: string; action?: React.ReactNode }) { return <div className="empty-state"><Icon size={28} strokeWidth={1.5} /><p>{title}</p>{action}</div> }
