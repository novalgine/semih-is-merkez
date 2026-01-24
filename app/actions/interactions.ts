'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const interactionSchema = z.object({
    customerId: z.string(),
    type: z.enum(['meeting', 'email', 'call', 'note']),
    content: z.string().min(1, "İçerik boş olamaz"),
    date: z.string(), // ISO string
})

export async function addInteraction(data: z.infer<typeof interactionSchema>) {
    const supabase = await createClient()

    const { error } = await supabase.from('interactions').insert({
        customer_id: data.customerId,
        type: data.type,
        content: data.content,
        date: data.date,
    })

    if (error) {
        console.error('Error adding interaction:', error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/customers/${data.customerId}`)
    return { success: true }
}

export async function deleteInteraction(id: string, customerId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('interactions').delete().eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath(`/customers/${customerId}`)
    return { success: true }
}
