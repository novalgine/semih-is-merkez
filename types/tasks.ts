export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  content: string
  is_completed: boolean
  assigned_date: string | null
  category: string | null
  priority: TaskPriority
  description: string | null
  position: number
  created_at: string
}

export interface ReorderTaskItem {
  id: string
  position: number
  assigned_date: string | null
}
