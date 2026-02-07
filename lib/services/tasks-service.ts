import { format } from 'date-fns'

import { createClient } from '@/lib/supabase/server'
import { fail, ok, type ActionResponse } from '@/types/action-response'
import type { ReorderTaskItem, Task, TaskPriority } from '@/types/tasks'

export async function listTasks(startDate: Date, endDate: Date): Promise<ActionResponse<Task[]>> {
  const supabase = await createClient()
  const startStr = format(startDate, 'yyyy-MM-dd')
  const endStr = format(endDate, 'yyyy-MM-dd')

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .or(`assigned_date.is.null,and(assigned_date.gte.${startStr},assigned_date.lte.${endStr})`)
    .order('position', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) return fail(error, 'Görevler alınamadı.')
  return ok((data || []) as Task[])
}

export async function insertTask(input: {
  content: string
  assignedDate?: string | null
  category?: string | null
  priority?: TaskPriority
  description?: string | null
}): Promise<ActionResponse<Task>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      content: input.content,
      assigned_date: input.assignedDate || null,
      category: input.category || null,
      priority: input.priority || 'medium',
      description: input.description || null,
      is_completed: false,
    })
    .select()
    .single()

  if (error) return fail(error, 'Görev oluşturulamadı.')
  return ok(data as Task)
}

export async function editTask(id: string, updates: Record<string, unknown>): Promise<ActionResponse<null>> {
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').update(updates).eq('id', id)
  if (error) return fail(error, 'Görev güncellenemedi.')

  return ok(null)
}

export async function removeTask(id: string): Promise<ActionResponse<null>> {
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) return fail(error, 'Görev silinemedi.')
  return ok(null)
}

export async function sortTasks(items: ReorderTaskItem[]): Promise<ActionResponse<null>> {
  const supabase = await createClient()
  const updates = items.map((item) =>
    supabase
      .from('tasks')
      .update({ position: item.position, assigned_date: item.assigned_date })
      .eq('id', item.id),
  )

  const results = await Promise.all(updates)
  const firstError = results.find((result) => result.error)?.error || null
  if (firstError) return fail(firstError, 'Görev sıralaması güncellenemedi.')

  return ok(null)
}
