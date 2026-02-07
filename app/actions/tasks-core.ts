import { format } from "date-fns"

export interface Task {
    id: string
    content: string
    is_completed: boolean
    assigned_date: string | null
    category: string | null
    priority: 'low' | 'medium' | 'high'
    description: string | null
    position: number
    created_at: string
}

type RevalidatePath = (path: string) => void

interface QueryResponse<T> {
    data: T | null
    error: { message: string } | null
}

interface TaskTableQuery {
    select(columns?: string): TaskTableQuery
    insert(values: Record<string, unknown>): TaskTableQuery
    update(values: Record<string, unknown>): TaskTableQuery
    delete(): TaskTableQuery
    single(): Promise<QueryResponse<any>>
    eq(column: string, value: string): TaskTableQuery
    or(filter: string): TaskTableQuery
    order(column: string, options: { ascending: boolean }): TaskTableQuery
}

interface SupabaseLike {
    from(table: 'tasks'): TaskTableQuery
}

export function createTaskActions(supabase: SupabaseLike, revalidatePath: RevalidatePath) {
    return {
        async getTasks(startDate: Date, endDate: Date) {
            const startStr = format(startDate, 'yyyy-MM-dd')
            const endStr = format(endDate, 'yyyy-MM-dd')

            const { data, error } = await (supabase
                .from('tasks')
                .select('*')
                .or(`assigned_date.is.null,and(assigned_date.gte.${startStr},assigned_date.lte.${endStr})`)
                .order('position', { ascending: true })
                .order('created_at', { ascending: false }) as unknown as Promise<QueryResponse<Task[]>>)

            if (error) {
                console.error('Get Tasks Error:', error)
                return []
            }

            return data || []
        },

        async createTask(content: string, assignedDate?: string | null, category?: string | null, priority: 'low' | 'medium' | 'high' = 'medium', description?: string) {
            const { data, error } = await supabase
                .from('tasks')
                .insert({
                    content,
                    assigned_date: assignedDate || null,
                    category: category || null,
                    priority,
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
        },

        async updateTask(data: FormData | { id: string, updates: Partial<Task> }) {
            let id: string
            let updates: Record<string, unknown> = {}

            if (data instanceof FormData) {
                id = data.get('id') as string
                updates = {
                    content: data.get('content') as string,
                    category: data.get('category') as string,
                    assigned_date: data.get('assigned_date') as string,
                    is_completed: data.get('is_completed') === 'true'
                }
            } else {
                id = data.id
                updates = data.updates
            }

            if (updates.assigned_date instanceof Date) {
                updates.assigned_date = format(updates.assigned_date, 'yyyy-MM-dd')
            }

            const { error } = await (supabase
                .from('tasks')
                .update(updates)
                .eq('id', id) as unknown as Promise<QueryResponse<null>>)

            if (error) {
                console.error('Update Task Error:', error)
                return { success: false, error: error.message }
            }

            revalidatePath('/daily')
            revalidatePath('/')
            return { success: true }
        },

        async deleteTask(id: string, path?: string) {
            const { error } = await (supabase
                .from('tasks')
                .delete()
                .eq('id', id) as unknown as Promise<QueryResponse<null>>)

            if (error) {
                console.error('Delete Task Error:', error)
                return { success: false, error: error.message }
            }

            revalidatePath('/daily')
            if (path) revalidatePath(path)
            return { success: true }
        },

        async reorderTasks(items: { id: string; position: number; assigned_date: string | null }[]) {
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
    }
}
