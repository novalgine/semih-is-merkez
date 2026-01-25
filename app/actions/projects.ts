'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const projectSchema = z.object({
    customerId: z.string(),
    title: z.string().min(2, "Proje adı en az 2 karakter olmalı"),
    status: z.enum(['proposal', 'planning', 'shooting', 'editing', 'in-progress', 'completed']),
    budget: z.coerce.number().optional(),
    deadline: z.string().optional(),
})

export async function addProject(data: z.infer<typeof projectSchema>) {
    const supabase = await createClient()

    const { error } = await supabase.from('projects').insert({
        customer_id: data.customerId,
        name: data.title,
        status: data.status,
        budget: data.budget || null,
        deadline: data.deadline || null,
    })

    if (error) {
        console.error('Error adding project:', error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/customers/${data.customerId}`)
    return { success: true }
}

export async function updateProject(id: string, data: Partial<z.infer<typeof projectSchema>>) {
    const supabase = await createClient()

    const updateData: any = {}
    if (data.title) updateData.name = data.title
    if (data.status) updateData.status = data.status
    if (data.budget !== undefined) updateData.budget = data.budget || null
    if (data.deadline !== undefined) updateData.deadline = data.deadline || null

    const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id)

    if (error) {
        console.error('Error updating project:', error)
        return { success: false, error: error.message }
    }

    if (data.customerId) {
        revalidatePath(`/customers/${data.customerId}`)
    }
    return { success: true }
}

export async function deleteProject(id: string, customerId?: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting project:', error)
        return { success: false, error: error.message }
    }

    if (customerId) {
        revalidatePath(`/customers/${customerId}`)
    }
    return { success: true }
}
