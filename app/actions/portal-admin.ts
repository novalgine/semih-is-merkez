'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * Müşteri için yeni bir Portal Token oluşturur veya varsa yeniler.
 * Bu işlem sadece Admin tarafından yapılabilir (auth kontrolü Supabase tarafında veya middleware'de olmalı, 
 * ancak server action içinde de createClient() kullandığımız için admin oturumu gerekir).
 */
export async function generatePortalToken(customerId: string) {
    const supabase = await createClient()

    // Rastgele yeni bir UUID oluşturmak için veritabanı fonksiyonunu kullanabiliriz 
    // veya JS tarafında crypto.randomUUID() kullanabiliriz.
    // Supabase'in gen_random_uuid() fonksiyonunu update içinde çağırmak daha temiz.

    // Ancak JS tarafında üretip göndermek, dönen değeri hemen alıp kullanıcıya göstermek için daha pratik olabilir.
    const newToken = crypto.randomUUID()

    const { error } = await supabase
        .from('customers')
        .update({ portal_token: newToken })
        .eq('id', customerId)

    if (error) {
        console.error('Generate Token Error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/customers/${customerId}`)
    return { success: true, token: newToken }
}

/**
 * Token'ı yeniler (Eskisini geçersiz kılar).
 * Aslında generatePortalToken ile aynı işi yapar ama isimlendirme olarak "Rotate" güvenlik vurgusu yapar.
 */
export async function rotatePortalToken(customerId: string) {
    return generatePortalToken(customerId)
}

/**
 * Müşteriye PIN atar veya günceller.
 */
export async function updatePortalPin(customerId: string, pin: string) {
    const supabase = await createClient()

    if (pin.length !== 4 || isNaN(Number(pin))) {
        return { success: false, error: "PIN 4 haneli bir sayı olmalıdır." }
    }

    const { error } = await supabase
        .from('customers')
        .update({ portal_pin: pin })
        .eq('id', customerId)

    if (error) {
        console.error('Update PIN Error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/customers/${customerId}`)
    return { success: true }
}
