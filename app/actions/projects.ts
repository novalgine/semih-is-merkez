'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const projectSchema = z.object({
    customerId: z.string(),
    title: z.string().min(2, "Proje adı en az 2 karakter olmalı"),
    status: z.enum(['proposal', 'planning', 'shooting', 'editing', 'completed']),
    budget: z.coerce.number().optional(),
    deadline: z.string().optional(),
})

export async function addProject(data: z.infer<typeof projectSchema>) {
    const supabase = await createClient()

    const { error } = await supabase.from('projects').insert({
        customer_id: data.customerId,
        title: data.title,
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
