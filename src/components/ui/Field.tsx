import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) { return <input className={cn('input', className)} {...props} /> }
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) { return <textarea ref={ref} className={cn('textarea', className)} {...props} /> })
export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) { return <select className={cn('select', className)} {...props} /> }
export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) { return <label className="field"><span className="field-label">{label}</span>{children}{hint && <span className="field-hint">{hint}</span>}</label> }
export function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange(value: boolean): void; label: string; disabled?: boolean }) {
  return <label className={cn('switch-row', disabled && 'is-disabled')}><span>{label}</span><button type="button" role="switch" aria-checked={checked} className={cn('switch', checked && 'is-on')} onClick={() => onChange(!checked)} disabled={disabled}><span /></button></label>
}
