'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { format } from "date-fns"

function getTodayString() {
    return format(new Date(), 'yyyy-MM-dd')
}

function shouldRevalidateDashboard(assignedDate: string | null | undefined) {
    return assignedDate === getTodayString()
}

function normalizeAssignedDate(value: Task['assigned_date'] | Date | undefined) {
    if (value instanceof Date) {
        return format(value, 'yyyy-MM-dd')
    }

    return value
}

async function getTaskAssignedDate(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('tasks')
        .select('assigned_date')
        .eq('id', id)
        .single()

    if (error) {
        return { error: error.message, assignedDate: null as string | null }
    }

    return { error: null, assignedDate: data.assigned_date as string | null }
}

export interface Task {
    id: string
    content: string
    is_completed: boolean
    assigned_date: string | null // YYYY-MM-DD string or null
    category: string | null
    priority: 'low' | 'medium' | 'high'
    description: string | null
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

    if (shouldRevalidateDashboard(data.assigned_date)) {
        revalidatePath('/')
    }

    return { success: true, task: data }
}

type UpdateTaskInput =
    | FormData
    | {
        id: string
        updates: Partial<Task>
        currentAssignedDate?: string | null
    }

export async function updateTask(input: UpdateTaskInput) {
    const supabase = await createClient()

    let id: string
    let updates: Partial<Task> = {}
    let currentAssignedDate: string | null | undefined

    if (input instanceof FormData) {
        id = input.get('id') as string
        updates = {
            content: input.get('content') as string,
            category: input.get('category') as string,
            assigned_date: input.get('assigned_date') as string,
            is_completed: input.get('is_completed') === 'true'
        }
    } else {
        id = input.id
        updates = input.updates
        currentAssignedDate = input.currentAssignedDate
    }

    updates.assigned_date = normalizeAssignedDate(updates.assigned_date)

    const newAssignedDate = updates.assigned_date

    if (typeof currentAssignedDate === 'undefined') {
        // Eski atama tarihi çağıran tarafta bilinmiyorsa sadece bu durumda DB'den oku
        const existing = await getTaskAssignedDate(id)
        if (existing.error) {
            console.error('Update Task (Fetch Existing) Error:', existing.error)
            return { success: false, error: existing.error }
        }

        currentAssignedDate = existing.assignedDate
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

    if (shouldRevalidateDashboard(currentAssignedDate) || shouldRevalidateDashboard(newAssignedDate ?? currentAssignedDate)) {
        revalidatePath('/')
    }

    return { success: true }
}

export async function deleteTask(id: string, assignedDate?: string | null) {
    const supabase = await createClient()

    let currentAssignedDate = assignedDate

    if (typeof currentAssignedDate === 'undefined') {
        const existing = await getTaskAssignedDate(id)
        if (existing.error) {
            console.error('Delete Task (Fetch Existing) Error:', existing.error)
            return { success: false, error: existing.error }
        }

        currentAssignedDate = existing.assignedDate
    }

    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Delete Task Error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/daily')

    if (shouldRevalidateDashboard(currentAssignedDate)) {
        revalidatePath('/')
    }

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

    if (items.some(item => shouldRevalidateDashboard(item.assigned_date))) {
        revalidatePath('/')
    }

    return { success: true }
}
