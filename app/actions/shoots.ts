'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface SceneData {
    scene_number: number
    description: string
    angle?: string
    duration?: string
}

interface ShootData {
    customerId?: string
    title: string
    shootDate?: string
    location?: string
    notes?: string
    equipment?: string[]
    scenes?: SceneData[]
    tags?: string[]
}

export async function createShoot(data: ShootData) {
    const supabase = await createClient()

    try {
        // 1. Ana Shoot kaydını oluştur
        const { data: shoot, error: shootError } = await supabase
            .from('shoots')
            .insert({
                customer_id: data.customerId,
                title: data.title,
                shoot_date: data.shootDate, // ISO string
                location: data.location,
                notes: data.notes,
                equipment_list: JSON.stringify(data.equipment),
                status: 'planned'
            })
            .select()
            .single()

        if (shootError) throw shootError

        // 2. Sahneleri ekle
        if (data.scenes && data.scenes.length > 0) {
            const scenesToInsert = data.scenes.map((scene) => ({
                shoot_id: shoot.id,
                scene_number: scene.scene_number,
                description: scene.description,
                angle: scene.angle,
                duration: scene.duration,
                is_completed: false
            }))

            const { error: scenesError } = await supabase
                .from('shoot_scenes')
                .insert(scenesToInsert)

            if (scenesError) throw scenesError
        }

        revalidatePath('/shoots')
        return { success: true, id: shoot.id }

    } catch (error: any) {
        console.error('Create Shoot Error:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            data: data
        })
        return { success: false, error: error.message || "Bir sorun oluştu." }
    }
}

export async function getShoots() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('shoots')
        .select(`
            *,
            customers (name, company)
        `)
        .order('shoot_date', { ascending: true })

    if (error) {
        console.error('Get Shoots Error:', error)
        return []
    }

    return data
}

export async function getShootById(id: string) {
    const supabase = await createClient()

    // Çekim detaylarını ve sahneleri çek
    const { data: shoot, error } = await supabase
        .from('shoots')
        .select(`
            *,
            customers (name, company, phone, email),
            shoot_scenes (*)
        `)
        .eq('id', id)
        .single()

    if (error) return null

    // Sahneleri numaraya göre sırala
    if (shoot.shoot_scenes) {
        shoot.shoot_scenes.sort((a: { scene_number: number }, b: { scene_number: number }) => a.scene_number - b.scene_number)
    }

    return shoot
}

export async function toggleSceneCompletion(sceneId: string, isCompleted: boolean) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('shoot_scenes')
        .update({ is_completed: isCompleted })
        .eq('id', sceneId)

    if (error) {
        console.error('Toggle Scene Error:', error)
        return { success: false }
    }

    // İlgili shoot sayfasını yenile (path dinamik olduğu için tam path'i bulmak zor olabilir, 
    // ama client component'te optimistic update yapacağız zaten)
    return { success: true }
}

export async function updateShoot(id: string, data: ShootData) {
    const supabase = await createClient()

    try {
        // 1. Ana Shoot kaydını güncelle
        const { error: shootError } = await supabase
            .from('shoots')
            .update({
                title: data.title,
                location: data.location,
                notes: data.notes,
                equipment_list: JSON.stringify(data.equipment)
            })
            .eq('id', id)

        if (shootError) throw shootError

        // 2. Sahneleri güncelle (Sil ve Yeniden Ekle - En basit yöntem)
        // Önce mevcut sahneleri sil
        const { error: deleteError } = await supabase
            .from('shoot_scenes')
            .delete()
            .eq('shoot_id', id)

        if (deleteError) throw deleteError

        // Yeni sahneleri ekle
        if (data.scenes && data.scenes.length > 0) {
            const scenesToInsert = data.scenes.map((scene, index) => ({
                shoot_id: id,
                scene_number: index + 1, // Sırayı yeniden düzenle
                description: scene.description,
                angle: scene.angle,
                duration: scene.duration,
                is_completed: false // Düzenleme sonrası resetlenmesi mantıklı olabilir veya eski durumu korumak için daha karmaşık mantık gerekir. Şimdilik reset.
            }))

            const { error: scenesError } = await supabase
                .from('shoot_scenes')
                .insert(scenesToInsert)

            if (scenesError) throw scenesError
        }

        revalidatePath(`/shoots/${id}`)
        return { success: true }

    } catch (error: any) {
        console.error('Update Shoot Error:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            id: id,
            data: data
        })
        return { success: false, error: error.message || "Bir sorun oluştu." }
    }
}

interface ChecklistItem {
    id: string
    text: string
    completed: boolean
}

export async function updateShootChecklist(id: string, checklist: ChecklistItem[]) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('shoots')
        .update({ checklist: JSON.stringify(checklist) })
        .eq('id', id)

    if (error) {
        console.error('Update Checklist Error:', error)
        return {
            success: false, error: error.message.includes('column "checklist" does not exist')
                ? "Checklist özelliği henüz veritabanına eklenmemiş. Lütfen SQL güncellemelerini yapın."
                : error.message
        }
    }

    revalidatePath(`/shoots/${id}`)
    return { success: true }
}

export async function deleteShoot(id: string) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('shoots')
            .delete()
            .eq('id', id)

        if (error) throw error

        revalidatePath('/shoots')
        return { success: true }

    } catch (error: any) {
        console.error('Delete Shoot Error:', error)
        return { success: false, error: error.message || "Silinirken bir hata oluştu." }
    }
}
