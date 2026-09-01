import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'icon' }
export function Button({ className, variant = 'secondary', size = 'md', type = 'button', ...props }: Props) {
  return <button type={type} className={cn('button', `button-${variant}`, `button-${size}`, className)} {...props} />
}
