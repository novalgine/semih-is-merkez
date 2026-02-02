'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { format } from "date-fns"

export interface Task {
    id: string
    content: string
    is_completed: boolean
    assigned_date: string | null // YYYY-MM-DD string or null
    category: string | null
    position: number
    created_at: string
}

export async function getTasks(startDate: Date, endDate: Date) {
    const supabase = await createClient()

    const startStr = format(startDate, 'yyyy-MM-dd')
    const endStr = format(endDate, 'yyyy-MM-dd')

    // Backlog (Tarihsiz) ve Tarih Aralığındaki görevleri getir
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .or(`assigned_date.is.null,and(assigned_date.gte.${startStr},assigned_date.lte.${endStr})`)
        .order('position', { ascending: true })
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Get Tasks Error:', error)
        return []
    }

    return data as Task[]
}

export async function createTask(content: string, assignedDate?: string | null, category?: string | null, priority: 'low' | 'medium' | 'high' = 'medium', description?: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('tasks')
        .insert({
            content,
            assigned_date: assignedDate || null,
            category: category || null,
            priority: priority,
            description: description || null,
            is_completed: false
        })
        .select()
        .single()

    if (error) {
        console.error('Create Task Error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/daily')
    return { success: true, task: data }
}

export async function updateTask(data: FormData | { id: string, updates: Partial<Task> }) {
    const supabase = await createClient()

    let id: string;
    let updates: any = {};

    if (data instanceof FormData) {
        id = data.get('id') as string;
        updates = {
            content: data.get('content') as string,
            category: data.get('category') as string,
            assigned_date: data.get('assigned_date') as string,
            is_completed: data.get('is_completed') === 'true'
        };
    } else {
        id = data.id;
        updates = data.updates;
    }

    // assigned_date string gelirse formatla, Date gelirse formatla
    if (updates.assigned_date instanceof Date) {
        updates.assigned_date = format(updates.assigned_date, 'yyyy-MM-dd')
    }

    const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)

    if (error) {
        console.error('Update Task Error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/daily')
    revalidatePath('/') // Dashboard için
    return { success: true }
}

export async function deleteTask(id: string, path?: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Delete Task Error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/daily')
    if (path) revalidatePath(path)
    return { success: true }
}

export async function reorderTasks(items: { id: string; position: number; assigned_date: string | null }[]) {
    const supabase = await createClient()

    const updates = items.map(item =>
        supabase
            .from('tasks')
            .update({
                position: item.position,
                assigned_date: item.assigned_date
            })
            .eq('id', item.id)
    )

    await Promise.all(updates)

    revalidatePath('/daily')
    return { success: true }
}
