'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema for Bundle
const bundleSchema = z.object({
    name: z.string().min(2, "Paket adı en az 2 karakter olmalıdır"),
    description: z.string().optional(),
    price: z.coerce.number().min(0, "Fiyat 0'dan küçük olamaz"),
    items: z.array(z.object({
        serviceId: z.string(),
        quantity: z.number().min(1)
    })).min(1, "En az bir hizmet seçmelisiniz")
})

export type BundleFormValues = z.infer<typeof bundleSchema>

export async function getBundles() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('bundles')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Get Bundles Error:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        })
        return []
    }

    return data
}

export async function createBundle(data: BundleFormValues) {
    const supabase = await createClient()

    // 1. Create Bundle
    const { data: bundle, error: bundleError } = await supabase
        .from('bundles')
        .insert({
            name: data.name,
            description: data.description,
            price: data.price
        })
        .select()
        .single()

    if (bundleError) {
        return { success: false, error: bundleError.message }
    }

    // 2. Create Bundle Items
    const itemsToInsert = data.items.map(item => ({
        bundle_id: bundle.id,
        service_id: item.serviceId,
        quantity: item.quantity
    }))

    const { error: itemsError } = await supabase
        .from('bundle_items')
        .insert(itemsToInsert)

    if (itemsError) {
        return { success: false, error: itemsError.message }
    }

    revalidatePath('/services')
    return { success: true }
}

export async function updateBundle(id: string, data: BundleFormValues) {
    const supabase = await createClient()

    // 1. Update Bundle
    const { error: bundleError } = await supabase
        .from('bundles')
        .update({
            name: data.name,
            description: data.description,
            price: data.price
        })
        .eq('id', id)

    if (bundleError) {
        return { success: false, error: bundleError.message }
    }

    // 2. Update Items (Delete all and re-insert)
    const { error: deleteError } = await supabase
        .from('bundle_items')
        .delete()
        .eq('bundle_id', id)

    if (deleteError) {
        return { success: false, error: deleteError.message }
    }

    const itemsToInsert = data.items.map(item => ({
        bundle_id: id,
        service_id: item.serviceId,
        quantity: item.quantity
    }))

    const { error: itemsError } = await supabase
        .from('bundle_items')
        .insert(itemsToInsert)

    if (itemsError) {
        return { success: false, error: itemsError.message }
    }

    revalidatePath('/services')
    return { success: true }
}

export async function deleteBundle(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('bundles')
        .delete()
        .eq('id', id)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/services')
    return { success: true }
}
