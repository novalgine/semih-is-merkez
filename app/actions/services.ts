'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type Service = {
    id: string
    name: string
    description: string | null
    price: number | null
    unit: string | null
    created_at: string
}

export type ServiceFormValues = {
    name: string
    description?: string
    price?: number
    unit?: string
}

export async function getServices() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching services:', error)
        return []
    }

    return data as Service[]
}

export async function createService(data: ServiceFormValues) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('services')
        .insert(data)

    if (error) {
        console.error('Error creating service:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/services')
    return { success: true }
}

export async function updateService(id: string, data: ServiceFormValues) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('services')
        .update(data)
        .eq('id', id)

    if (error) {
        console.error('Error updating service:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/services')
    return { success: true }
}

export async function deleteService(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting service:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/services')
    return { success: true }
}
