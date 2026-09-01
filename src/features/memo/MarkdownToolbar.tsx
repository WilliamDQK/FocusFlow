import { Bold, Code2, Heading2, Italic, List, ListOrdered, ListTodo, Quote } from 'lucide-react'
import type { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../components/ui/Button'

interface MarkdownToolbarProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>
  value: string
  onChange(value: string): void
}

export function MarkdownToolbar({ textareaRef, value, onChange }: MarkdownToolbarProps) {
  const { t } = useTranslation()

  function commit(next: string, start: number, end: number) {
    onChange(next)
    requestAnimationFrame(() => {
      textareaRef.current?.focus()
      textareaRef.current?.setSelectionRange(start, end)
    })
  }

  function wrap(before: string, after: string, placeholder: string) {
    const textarea = textareaRef.current; if (!textarea) return
    const start = textarea.selectionStart; const end = textarea.selectionEnd; const selected = value.slice(start, end) || placeholder; const replacement = `${before}${selected}${after}`
    commit(`${value.slice(0, start)}${replacement}${value.slice(end)}`, start + before.length, start + before.length + selected.length)
  }

  function prefix(kind: 'unordered' | 'ordered' | 'task' | 'quote' | 'heading') {
    const textarea = textareaRef.current; if (!textarea) return
    const selectionStart = textarea.selectionStart; const selectionEnd = textarea.selectionEnd; const lineStart = value.lastIndexOf('\n', Math.max(0, selectionStart - 1)) + 1; const nextBreak = value.indexOf('\n', selectionEnd); const lineEnd = nextBreak === -1 ? value.length : nextBreak
    const block = value.slice(lineStart, lineEnd) || t('memo.listItem')
    const replacement = block.split('\n').map((line, index) => {
      if (kind === 'ordered') return `${index + 1}. ${line}`
      if (kind === 'task') return `- [ ] ${line}`
      if (kind === 'quote') return `> ${line}`
      if (kind === 'heading') return `## ${line}`
      return `- ${line}`
    }).join('\n')
    commit(`${value.slice(0, lineStart)}${replacement}${value.slice(lineEnd)}`, lineStart, lineStart + replacement.length)
  }

  return (
    <div className="markdown-toolbar" role="toolbar" aria-label={t('memo.formatToolbar')}>
      <Button size="icon" variant="ghost" aria-label={t('memo.bold')} title={t('memo.bold')} onClick={() => wrap('**', '**', t('memo.boldText'))}><Bold size={16} /></Button>
      <Button size="icon" variant="ghost" aria-label={t('memo.italic')} title={t('memo.italic')} onClick={() => wrap('*', '*', t('memo.italicText'))}><Italic size={16} /></Button>
      <Button size="icon" variant="ghost" aria-label={t('memo.heading')} title={t('memo.heading')} onClick={() => prefix('heading')}><Heading2 size={16} /></Button>
      <Button size="icon" variant="ghost" aria-label={t('memo.unorderedList')} title={t('memo.unorderedList')} onClick={() => prefix('unordered')}><List size={16} /></Button>
      <Button size="icon" variant="ghost" aria-label={t('memo.orderedList')} title={t('memo.orderedList')} onClick={() => prefix('ordered')}><ListOrdered size={16} /></Button>
      <Button size="icon" variant="ghost" aria-label={t('memo.taskList')} title={t('memo.taskList')} onClick={() => prefix('task')}><ListTodo size={16} /></Button>
      <Button size="icon" variant="ghost" aria-label={t('memo.quote')} title={t('memo.quote')} onClick={() => prefix('quote')}><Quote size={16} /></Button>
      <Button size="icon" variant="ghost" aria-label={t('memo.inlineCode')} title={t('memo.inlineCode')} onClick={() => wrap('`', '`', t('memo.codeText'))}><Code2 size={16} /></Button>
    </div>
  )
}
