

import { createClient } from "@/lib/supabase/client"
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function testPortal() {
    console.log('--- Portal Test Başlıyor ---')
    const supabase = await createClient()
    console.log('--- Portal Test Başlıyor ---')

    // 1. Bir müşteri bul (Token'ı olan veya olmayan)
    const { data: customer } = await supabase.from('customers').select('id, name').limit(1).single()

    if (!customer) {
        console.error('Hiç müşteri yok, test iptal.')
        return
    }

    console.log(`Test Müşterisi: ${customer.name} (${customer.id})`)

    // 2. Token Oluştur (Admin Action Simülasyonu)
    const newToken = crypto.randomUUID()
    const pin = "1234"

    await supabase.from('customers').update({
        portal_token: newToken,
        portal_pin: pin
    }).eq('id', customer.id)

    console.log(`Yeni Token Atandı: ${newToken}`)
    console.log(`PIN Atandı: ${pin}`)

    // 3. Public Action Testleri (Simülasyon)
    // getPortalCustomer
    const { data: portalCustomer } = await supabase
        .from('customers')
        .select('name')
        .eq('portal_token', newToken)
        .single()

    console.log('Portal Giriş Testi:', portalCustomer ? 'BAŞARILI ✅' : 'BAŞARISIZ ❌')

    // verifyPortalPin
    const { data: pinCheck } = await supabase
        .from('customers')
        .select('portal_pin')
        .eq('portal_token', newToken)
        .single()

    const isPinValid = pinCheck?.portal_pin === pin
    console.log('PIN Doğrulama Testi:', isPinValid ? 'BAŞARILI ✅' : 'BAŞARISIZ ❌')

    // 4. Temizlik (Opsiyonel, şimdilik kalsın)
    console.log('--- Test Bitti ---')
}

testPortal()
