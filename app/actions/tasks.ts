'use server'

import { revalidatePath } from 'next/cache'

import {
  editTask,
  insertTask,
  listTasks,
  removeTask,
  sortTasks,
} from '@/lib/services/tasks-service'
import type { ActionResponse } from '@/types/action-response'
import type { ReorderTaskItem, Task, TaskPriority } from '@/types/tasks'

export type { Task }

export async function getTasks(startDate: Date, endDate: Date): Promise<Task[]> {
  const result = await listTasks(startDate, endDate)
  if (!result.success) {
    console.error('Get Tasks Error:', result.error)
    return []
  }

  return result.data || []
}

export async function createTask(
  content: string,
  assignedDate?: string | null,
  category?: string | null,
  priority: TaskPriority = 'medium',
  description?: string,
): Promise<ActionResponse<Task>> {
  const result = await insertTask({ content, assignedDate, category, priority, description })
  if (!result.success) {
    console.error('Create Task Error:', result.error)
    return result
  }

  revalidatePath('/daily')
  return result
}

export async function updateTask(
  data: FormData | { id: string; updates: Partial<Task> },
): Promise<ActionResponse<null>> {
  let id: string
  let updates: Record<string, unknown> = {}

  if (data instanceof FormData) {
    id = data.get('id') as string
    updates = {
      content: data.get('content') as string,
      category: data.get('category') as string,
      assigned_date: data.get('assigned_date') as string,
      is_completed: data.get('is_completed') === 'true',
    }
  } else {
    id = data.id
    updates = data.updates as Record<string, unknown>
  }

  const result = await editTask(id, updates)
  if (!result.success) {
    console.error('Update Task Error:', result.error)
    return result
  }

  revalidatePath('/daily')
  revalidatePath('/')
  return result
}

export async function deleteTask(id: string, path?: string): Promise<ActionResponse<null>> {
  const result = await removeTask(id)
  if (!result.success) {
    console.error('Delete Task Error:', result.error)
    return result
  }

  revalidatePath('/daily')
  if (path) revalidatePath(path)
  return result
}

export async function reorderTasks(items: ReorderTaskItem[]): Promise<ActionResponse<null>> {
  const result = await sortTasks(items)
  if (!result.success) {
    console.error('Reorder Tasks Error:', result.error)
    return result
  }

  revalidatePath('/daily')
  return result
}
