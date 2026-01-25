'use server'

import { createClient } from "@supabase/supabase-js"

// DİKKAT: Bu dosyada "Service Role" client kullanacağız çünkü Public erişim istiyoruz.
// Normalde RLS (Row Level Security) anonim kullanıcılara veriyi kapatır.
// Ancak Portal mantığında, elimizde geçerli bir "Token" varsa, o token'a ait veriyi okumaya yetkimiz var demektir.
// Bu yüzden admin yetkili (service role) bir client ile sorgu atıp, "WHERE portal_token = X" filtresini MANUEL ve KESİN olarak uygulayacağız.

// Helper function to create Supabase client on-demand (avoids build-time initialization)
function getSupabaseAdmin() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables. Portal access requires this key.")
    }
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey
    )
}

/**
 * Token ile müşteri bilgilerini getirir.
 * Eğer token geçersizse null döner.
 */
export async function getPortalCustomer(token: string) {
    if (!token) return null

    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
        .from('customers')
        .select('id, name, company, email, phone, portal_token') // Hassas verileri (PIN gibi) seçme!
        .eq('portal_token', token)
        .single()

    if (error || !data) {
        return null
    }

    return data
}

/**
 * Token'a sahip müşterinin çekimlerini getirir.
 * Güvenlik: Önce token'dan müşteri ID'sini bulur, sonra o ID'ye ait çekimleri getirir.
 */
export async function getPortalShoots(token: string) {
    const customer = await getPortalCustomer(token)
    if (!customer) return []

    const supabaseAdmin = getSupabaseAdmin()
    const { data: shoots, error } = await supabaseAdmin
        .from('shoots')
        .select(`
            id,
            title,
            shoot_date,
            shoot_time,
            location,
            status,
            description
        `)
        .eq('customer_id', customer.id)
        .order('shoot_date', { ascending: false })

    if (error) {
        console.error('Portal Shoots Error:', error)
        return []
    }

    return shoots
}

/**
 * Token'a sahip müşterinin teslim edilen dosyalarını (Deliverables) getirir.
 */
export async function getPortalDeliverables(token: string) {
    const customer = await getPortalCustomer(token)
    if (!customer) return []

    // İlişkisel sorgu: Deliverables -> Shoots -> Customer
    // Ancak Supabase'de iç içe filtreleme bazen karmaşık olabilir.
    // En güvenlisi: Önce müşterinin shoot ID'lerini al, sonra bu ID'lere ait deliverable'ları al.

    const supabaseAdmin = getSupabaseAdmin()
    const { data: shoots } = await supabaseAdmin
        .from('shoots')
        .select('id')
        .eq('customer_id', customer.id)

    const shootIds = shoots?.map(s => s.id) || []

    if (shootIds.length === 0) return []

    const { data: deliverables, error } = await supabaseAdmin
        .from('deliverables')
        .select('*')
        .in('shoot_id', shootIds)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Portal Deliverables Error:', error)
        return []
    }

    return deliverables
}

/**
 * Finansal verilere erişim için PIN doğrular.
 */
export async function verifyPortalPin(token: string, pin: string) {
    if (!token || !pin) return false

    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
        .from('customers')
        .select('portal_pin')
        .eq('portal_token', token)
        .single()

    if (error || !data) return false

    // Basit string karşılaştırması (MVP için yeterli, ileride hash'lenebilir)
    return data.portal_pin === pin
}

/**
 * Token ve PIN doğrulanmışsa, finansal özeti getirir.
 * DİKKAT: Bu fonksiyonu çağırmadan önce mutlaka verifyPortalPin ile doğrulama yapılmalı 
 * veya bu fonksiyon içinde tekrar kontrol edilmeli. Biz içinde kontrol edeceğiz.
 */
export async function getPortalFinance(token: string, pin: string) {
    const isValid = await verifyPortalPin(token, pin)
    if (!isValid) return null

    const customer = await getPortalCustomer(token)
    if (!customer) return null

    // Müşteriye ait teklifleri (Proposals) getir
    const supabaseAdmin = getSupabaseAdmin()
    const { data: proposals } = await supabaseAdmin
        .from('proposals')
        .select('total_amount, status, created_at')
        .eq('customer_id', customer.id)

    // Basit bir özet hesapla
    let totalSpent = 0 // Onaylananlar (Müşteri için harcama)
    let pendingAmount = 0 // Bekleyenler

    proposals?.forEach(p => {
        if (p.status === 'Approved') totalSpent += p.total_amount || 0
        if (p.status === 'Sent') pendingAmount += p.total_amount || 0
    })

    return {
        totalSpent,
        pendingAmount,
        proposals: proposals || []
    }
}
