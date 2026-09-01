import { X } from 'lucide-react'
import { Button } from './Button'

export function Modal({ open, title, onClose, children, wide = false }: { open: boolean; title: string; onClose(): void; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}><header className="modal-header"><h2>{title}</h2><Button size="icon" variant="ghost" aria-label="Close" onClick={onClose}><X size={18} /></Button></header><div className="modal-body">{children}</div></section></div>
}
