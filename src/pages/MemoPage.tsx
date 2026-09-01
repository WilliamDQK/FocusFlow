import { Pin, Plus, Search, StickyNote, Trash2 } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '../components/shared/PageHeader'
import { Button } from '../components/ui/Button'
import { Field, Input, Select, Textarea } from '../components/ui/Field'
import { Modal } from '../components/ui/Modal'
import { MarkdownToolbar } from '../features/memo/MarkdownToolbar'
import { useAppStore } from '../stores/app-store'

export function MemoPage() {
  const { t } = useTranslation()
  const memos = useAppStore((state) => state.data.memos)
  const categories = useAppStore((state) => state.data.categories)
  const add = useAppStore((state) => state.addMemo)
  const update = useAppStore((state) => state.updateMemo)
  const remove = useAppStore((state) => state.removeMemo)
  const addCategory = useAppStore((state) => state.addCategory)
  const [selected, setSelected] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [categoryModal, setCategoryModal] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const activeCategories = useMemo(() => categories.filter((category) => !category.deleted_at).sort((a, b) => a.sort_order - b.sort_order), [categories])
  const categoryById = useMemo(() => new Map(activeCategories.map((category) => [category.id, category])), [activeCategories])
  const visible = useMemo(() => memos.filter((memo) => !memo.deleted_at && (categoryFilter === 'all' || (categoryFilter === 'none' ? !memo.category_id : memo.category_id === categoryFilter)) && `${memo.title} ${memo.content} ${memo.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || b.updated_at.localeCompare(a.updated_at)), [categoryFilter, memos, search])
  const current = visible.find((memo) => memo.id === selected) ?? visible[0] ?? null

  function create() {
    const item = add()
    if (categoryFilter !== 'all' && categoryFilter !== 'none') update(item.id, { category_id: categoryFilter })
    setSelected(item.id)
  }

  function createCategory(event: React.FormEvent) {
    event.preventDefault(); const name = newCategory.trim(); if (!name) return
    const category = addCategory(name); if (current) update(current.id, { category_id: category.id })
    setNewCategory(''); setCategoryModal(false)
  }

  return <div className="page memo-page">
    <PageHeader title={t('memo.title')} subtitle={t('memo.subtitle')} actions={<Button variant="primary" onClick={create}><Plus size={16} />{t('memo.new')}</Button>} />
    <div className="memo-layout">
      <aside className="memo-sidebar">
        <div className="memo-sidebar-tools"><label className="search-box"><Search size={15} /><Input aria-label={t('common.search')} value={search} onChange={(event) => setSearch(event.target.value)} /></label><Select aria-label={t('memo.categoryFilter')} value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="all">{t('memo.allCategories')}</option><option value="none">{t('memo.noCategory')}</option>{activeCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select></div>
        <div>{visible.map((memo) => { const category = memo.category_id ? categoryById.get(memo.category_id) : null; return <button className={current?.id === memo.id ? 'is-active' : ''} key={memo.id} onClick={() => setSelected(memo.id)}><div><strong>{memo.title || t('memo.untitled')}</strong>{memo.is_pinned && <Pin size={12} fill="currentColor" />}</div>{category && <small style={{ '--memo-category': category.color } as React.CSSProperties}>{category.name}</small>}<span>{memo.content.slice(0, 90) || '—'}</span></button> })}</div>
      </aside>
      {current ? <section className="memo-editor">
        <div className="memo-editor-head"><Input value={current.title} onChange={(event) => update(current.id, { title: event.target.value })} placeholder={t('memo.untitled')} /><Select aria-label={t('memo.category')} value={current.category_id ?? ''} onChange={(event) => update(current.id, { category_id: event.target.value || null })}><option value="">{t('memo.noCategory')}</option>{activeCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select><Button size="icon" variant="ghost" aria-label={t('memo.addCategory')} onClick={() => setCategoryModal(true)}><Plus size={16} /></Button><Button size="icon" variant="ghost" aria-label={t('memo.pin')} onClick={() => update(current.id, { is_pinned: !current.is_pinned })}><Pin size={16} fill={current.is_pinned ? 'currentColor' : 'none'} /></Button><Button size="icon" variant="ghost" aria-label={t('common.delete')} onClick={() => { remove(current.id); setSelected(null) }}><Trash2 size={16} /></Button></div>
        <MarkdownToolbar textareaRef={textareaRef} value={current.content} onChange={(content) => update(current.id, { content })} />
        <div className="editor-split"><Textarea ref={textareaRef} value={current.content} onChange={(event) => update(current.id, { content: event.target.value })} placeholder={t('memo.content')} /><article className="markdown-preview"><ReactMarkdown remarkPlugins={[remarkGfm]}>{current.content || `### ${t('memo.untitled')}`}</ReactMarkdown></article></div>
      </section> : <div className="memo-empty"><StickyNote size={28} /><p>{t('memo.empty')}</p><Button onClick={create}>{t('memo.new')}</Button></div>}
    </div>
    <Modal open={categoryModal} title={t('memo.addCategory')} onClose={() => setCategoryModal(false)}><form className="task-form" onSubmit={createCategory}><Field label={t('memo.categoryName')}><Input autoFocus value={newCategory} onChange={(event) => setNewCategory(event.target.value)} /></Field><div className="form-footer"><Button variant="ghost" onClick={() => setCategoryModal(false)}>{t('common.cancel')}</Button><Button variant="primary" type="submit">{t('common.save')}</Button></div></form></Modal>
  </div>
}
