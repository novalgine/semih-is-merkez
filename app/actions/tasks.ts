'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createTaskActions, type Task } from "./tasks-core"

export type { Task }

export async function getTasks(startDate: Date, endDate: Date) {
    const supabase = await createClient()
    return createTaskActions(supabase, revalidatePath).getTasks(startDate, endDate)
}

export async function createTask(content: string, assignedDate?: string | null, category?: string | null, priority: 'low' | 'medium' | 'high' = 'medium', description?: string) {
    const supabase = await createClient()
    return createTaskActions(supabase, revalidatePath).createTask(content, assignedDate, category, priority, description)
}

export async function updateTask(data: FormData | { id: string, updates: Partial<Task> }) {
    const supabase = await createClient()
    return createTaskActions(supabase, revalidatePath).updateTask(data)
}

export async function deleteTask(id: string, path?: string) {
    const supabase = await createClient()
    return createTaskActions(supabase, revalidatePath).deleteTask(id, path)
}

export async function reorderTasks(items: { id: string; position: number; assigned_date: string | null }[]) {
    const supabase = await createClient()
    return createTaskActions(supabase, revalidatePath).reorderTasks(items)
}
