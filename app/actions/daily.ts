'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// AI ile metni analiz et ve etiketle
async function analyzeLogWithAI(content: string) {
    try {
        const supabase = await createClient()
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

        // Context Verilerini Çek
        const { data: customers } = await supabase.from('customers').select('name, company')
        const { data: shoots } = await supabase.from('shoots').select('title').limit(20).order('created_at', { ascending: false })

        const customerList = customers?.map(c => `${c.name} (${c.company})`).join(', ') || ""
        const projectList = shoots?.map(s => s.title).join(', ') || ""

        const prompt = `
        Aşağıdaki günlük iş kaydını analiz et ve ilgili etiketleri çıkar.
        
        CONTEXT (Mevcut Müşteriler): ${customerList}
        CONTEXT (Son Projeler): ${projectList}

        METİN: "${content}"

        GÖREVLER:
        1. Metinde geçen Müşteri veya Proje isimlerini bul. Sadece yukarıdaki CONTEXT listesinde varsa veya çok belirginse etiketle. Etiket formatı: "Client: [İsim]"
        2. Yapılan işin türünü belirle (Örn: Kurgu, Çekim, Toplantı, Yazılım). Etiket formatı: "Type: [Tür]"
        3. Duygu durumunu analiz et (Pozitif, Nötr, Negatif). Etiket formatı: "Mood: [Duygu]"
        4. İşin kategorisini belirle (Strategic, Operational, Learning, Waste).
           - Strategic: İş geliştime, planlama, yeni müşteri bulma, sistem kurma.
           - Operational: Çekim, kurgu, revize, fatura kesme, e-posta cevaplama.
           - Learning: Eğitim izleme, yeni teknik öğrenme.
           - Waste: Boş zaman, verimsiz toplantı.
           Etiket formatı: "Category: [Kategori]"

        Çıktıyı SADECE şu JSON formatında ver (String array), başka hiçbir şey yazma:
        [
            "Client: Pürtelaş",
            "Type: Kurgu",
            "Mood: Pozitif",
            "Category: Operational"
        ]
        `

        const result = await model.generateContent(prompt)
        const response = result.response
        const text = response.text()

        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim()
        return JSON.parse(jsonStr)

    } catch (error) {
        console.error("AI Analysis Error:", error)
        return [] // Hata olursa etiketsiz kaydet
    }
}

export async function createDailyLog(data: { content: string; mood?: string; productivity: number; category?: string }) {
    const supabase = await createClient()

    try {
        // 1. AI Analizi Yap
        const aiTags = await analyzeLogWithAI(data.content)

        // 2. Veritabanına Kaydet
        const { error } = await supabase
            .from('daily_logs')
            .insert({
                content: data.content,
                mood: data.mood || 'neutral',
                productivity_score: data.productivity,
                ai_tags: JSON.stringify(aiTags),
                category: data.category || 'Operational', // Default category
                log_date: new Date().toISOString()
            })

        if (error) throw error

        revalidatePath('/daily')
        return { success: true }

    } catch (error) {
        console.error('Create Log Error:', error)
        return { success: false, error }
    }
}

export async function getDailyLogs() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .order('log_date', { ascending: false })

    if (error) {
        console.error('Get Logs Error:', error)
        return []
    }

    return data
}

// Son 365 günün aktivite verisini getir (Heatmap için)
export async function getActivityData() {
    const supabase = await createClient()

    // Sadece tarihleri çeksek yeterli
    const { data, error } = await supabase
        .from('daily_logs')
        .select('log_date, productivity_score')
        .gte('log_date', new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString())

    if (error) return []

    // Veriyi işle: { "2024-01-20": 5, "2024-01-21": 8 } formatına çevir
    // Aynı gün birden fazla kayıt varsa skorları topla veya ortalamasını al (Burada count alıyoruz)
    const activityMap: Record<string, number> = {}

    data.forEach((log: any) => {
        const date = new Date(log.log_date).toISOString().split('T')[0]
        activityMap[date] = (activityMap[date] || 0) + 1
    })

    // Array formatına çevir: [{ date: '2024-01-20', count: 1 }]
    return Object.entries(activityMap).map(([date, count]) => ({ date, count }))
}
