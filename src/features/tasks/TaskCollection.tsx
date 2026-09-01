import type { Category, Project, Task } from '../../types/domain'
import { TaskItem } from './TaskItem'

export function TaskCollection({ tasks, projects, categories, view, onEdit }: { tasks: Task[]; projects: Project[]; categories: Category[]; view: 'list' | 'compact' | 'card'; onEdit?: ((task: Task) => void) | undefined }) {
  const project = (id: string | null) => projects.find((x) => x.id === id)
  const category = (id: string | null) => categories.find((x) => x.id === id)
  return <div className={`task-collection view-${view}`}>{tasks.map((task) => <TaskItem key={task.id} task={task} project={project(task.project_id)} category={category(task.category_id)} compact={view === 'compact'} card={view === 'card'} onEdit={onEdit} />)}</div>
}
