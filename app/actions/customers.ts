'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const customerSchema = z.object({
    name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
    company: z.string().optional(),
    email: z.string().email("Geçerli bir e-posta adresi giriniz").optional().or(z.literal('')),
    phone: z.string().optional(),
    status: z.enum(['active', 'lead', 'passive']),
    tags: z.array(z.string()).optional(),
    portal_pin: z.string().optional(),
})

export type CustomerFormValues = z.infer<typeof customerSchema>

export async function addCustomer(data: CustomerFormValues) {
    const supabase = await createClient()

    const { error } = await supabase.from('customers').insert({
        name: data.name,
        company: data.company,
        email: data.email || null,
        phone: data.phone,
        status: data.status,
        tags: data.tags,
        portal_pin: data.portal_pin,
    })

    if (error) {
        console.error('Error adding customer:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/customers')
    return { success: true }
}

export async function updateCustomer(id: string, data: CustomerFormValues) {
    const supabase = await createClient()

    const { data: updatedCustomer, error } = await supabase.from('customers').update({
        name: data.name,
        company: data.company,
        email: data.email || null,
        phone: data.phone,
        status: data.status,
        tags: data.tags,
        portal_pin: data.portal_pin,
    })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating customer:', error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/customers/${id}`)
    revalidatePath('/customers')
    return { success: true, data: updatedCustomer }
}

export async function deleteCustomer(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting customer:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/customers')
    return { success: true }
}

export async function getCustomerTimeline(customerId: string) {
    const supabase = await createClient()

    // 1. Get Proposals
    const { data: proposals } = await supabase
        .from('proposals')
        .select('id, project_title, status, created_at, total_amount')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

    // 2. Get Shoots
    const { data: shoots } = await supabase
        .from('shoots')
        .select('id, title, status, shoot_date, created_at')
        .eq('customer_id', customerId)
        .order('shoot_date', { ascending: false })

    // 3. Get Interactions
    const { data: interactions } = await supabase
        .from('interactions')
        .select('id, type, content, date, created_at')
        .eq('customer_id', customerId)
        .order('date', { ascending: false })

    // Combine and Sort
    const timeline = [
        ...(proposals || []).map(p => ({ ...p, type: 'proposal', date: p.created_at })),
        ...(shoots || []).map(s => ({ ...s, type: 'shoot', date: s.shoot_date || s.created_at })),
        ...(interactions || []).map(i => ({ ...i, type: 'interaction', date: i.date || i.created_at }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return timeline
}
