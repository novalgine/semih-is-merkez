'use server'

import { createClient } from "@/lib/supabase/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { format, differenceInDays } from "date-fns"
import { tr } from "date-fns/locale"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export interface DashboardStats {
    pendingProposalsAmount: number
    pendingProposalsCount: number
    approvedProposalsAmount: number
    totalExpenses: number
    netProfit: number
    upcomingShoots: {
        id: string
        title: string
        shoot_date: string
        location: string | null
        customers: { name: string } | null
    }[]
    totalCustomers: number
    lastTaskDate: string | null
    completedTasksToday: number
    // New Data Points for AI
    overdueTasks: { content: string; assigned_date: string }[]
    todaysTasks: { content: string }[]
    pendingProposalsDetails: { customer: string; amount: number; daysPending: number }[]
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const supabase = await createClient()
    const today = new Date()
    const todayStr = format(today, 'yyyy-MM-dd')

    // 1. Tüm verileri paralel çek
    const [proposalsResult, shootsResult, customersResult, expensesResult, tasksResult, lastTaskResult, todayCompletedResult] = await Promise.all([
        // Teklifler (Detaylı)
        supabase.from('proposals').select('status, total_amount, updated_at, customers(name)'),
        // Yaklaşan Çekimler (7 Günlük)
        supabase.from('shoots')
            .select(`
                id, 
                title, 
                shoot_date, 
                location,
                customers (name)
            `)
            .gte('shoot_date', today.toISOString())
            .lt('shoot_date', new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()) // 7 gün
            .order('shoot_date', { ascending: true }),
        // Müşteri Sayısı
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        // Giderler
        supabase.from('expenses').select('amount'),
        // Görevler (Bugün ve Gecikenler)
        supabase.from('tasks')
            .select('content, assigned_date, is_completed, updated_at')
            .or(`is_completed.eq.false`),
        // Son güncellenen görev (aktivite takibi için)
        supabase.from('tasks')
            .select('updated_at')
            .order('updated_at', { ascending: false })
            .limit(1)
            .single(),
        // Bugün tamamlanan görevler
        supabase.from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('is_completed', true)
            .gte('updated_at', new Date(today.setHours(0, 0, 0, 0)).toISOString())
    ])

    const proposals = proposalsResult.data
    const shoots = shootsResult.data
    const customerCount = customersResult.count
    const expenses = expensesResult.data
    const tasks = tasksResult.data
    const lastTask = lastTaskResult.data
    const todayCompletedCount = todayCompletedResult.count || 0

    // --- Finans Hesaplamaları ---
    let pendingAmount = 0
    let pendingCount = 0
    let approvedAmount = 0
    let totalExpenses = 0
    const pendingProposalsDetails: { customer: string; amount: number; daysPending: number }[] = []

    proposals?.forEach((p: any) => {
        if (p.status === 'Sent' || p.status === 'Draft') {
            pendingAmount += p.total_amount || 0
            pendingCount++

            // Bekleme süresi hesapla
            if (p.status === 'Sent') {
                const days = differenceInDays(today, new Date(p.updated_at))
                if (days > 2) { // 2 günden fazla bekleyenleri rapora ekle
                    pendingProposalsDetails.push({
                        customer: p.customers?.name || "Bilinmeyen",
                        amount: p.total_amount || 0,
                        daysPending: days
                    })
                }
            }
        }
        if (p.status === 'Approved') {
            approvedAmount += p.total_amount || 0
        }
    })

    expenses?.forEach(e => {
        totalExpenses += e.amount || 0
    })

    const netProfit = approvedAmount - totalExpenses

    // CEO Skoru kaldırıldı - artık task completion rate ile değiştirildi

    // --- Görev Analizi ---
    const overdueTasks: { content: string; assigned_date: string }[] = []
    const todaysTasks: { content: string }[] = []

    tasks?.forEach(t => {
        if (!t.assigned_date) return // Backlog'dakileri geç

        if (t.assigned_date === todayStr) {
            todaysTasks.push({ content: t.content })
        } else if (t.assigned_date < todayStr && !t.is_completed) {
            overdueTasks.push({ content: t.content, assigned_date: t.assigned_date })
        }
    })

    // --- Tip Dönüşümleri ---
    const typedShoots = (shoots || []).map((s: any) => ({
        id: s.id,
        title: s.title,
        shoot_date: s.shoot_date,
        location: s.location,
        customers: Array.isArray(s.customers) ? s.customers[0] : s.customers
    }))

    return {
        pendingProposalsAmount: pendingAmount,
        pendingProposalsCount: pendingCount,
        approvedProposalsAmount: approvedAmount,
        totalExpenses,
        netProfit,
        upcomingShoots: typedShoots,
        totalCustomers: customerCount || 0,
        lastTaskDate: lastTask?.updated_at || null,
        completedTasksToday: todayCompletedCount,
        overdueTasks,
        todaysTasks,
        pendingProposalsDetails
    }
}

export async function generateDashboardBriefing(stats: DashboardStats) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

        const prompt = `
        Sen Semih'in "Chief of Staff"ı (Yönetici Asistanı/Sağ Kolu) olarak görev yapıyorsun.
        Görevin: Aşağıdaki istihbarat raporunu analiz etmek ve Semih'e güne başlarken okuyacağı TEK PARAGRAFLIK, STRATEJİK ve HAREKETE GEÇİRİCİ bir brifing vermek.

        İSTİHBARAT RAPORU:
        ------------------
        1. GÖREV DURUMU:
           - Bugün Yapılacaklar: ${stats.todaysTasks.length > 0 ? stats.todaysTasks.map(t => t.content).join(", ") : "Bugün için özel bir görev yok."}
           - GECİKENLER (ACİL): ${stats.overdueTasks.length > 0 ? stats.overdueTasks.map(t => `${t.content} (${t.assigned_date})`).join(", ") : "Geciken görev yok, harika!"}

        2. OPERASYON (Önümüzdeki 7 Gün):
           ${stats.upcomingShoots.length > 0
                ? stats.upcomingShoots.map(s => `- ${s.title} (${format(new Date(s.shoot_date), 'd MMMM', { locale: tr })}, ${s.customers?.name || '?'})`).join("\n")
                : "- Yakın zamanda çekim görünmüyor."}

        3. SATIŞ & FİNANS:
           - Bekleyen Kritik Teklifler: ${stats.pendingProposalsDetails.length > 0 ? stats.pendingProposalsDetails.map(p => `${p.customer} (${p.amount} TL, ${p.daysPending} gündür bekliyor)`).join(", ") : "Kritik bekleyen teklif yok."}
           - Bekleyen Toplam Ciro Potansiyeli: ${stats.pendingProposalsAmount} TL
           - Bu Ayki Net Kâr: ${stats.netProfit} TL

        4. KİŞİSEL PERFORMANS:
           - Bugün Tamamlanan Görevler: ${stats.completedTasksToday}
           - Son Aktivite: ${stats.lastTaskDate ? format(new Date(stats.lastTaskDate), 'd MMMM HH:mm', { locale: tr }) : "Uzun süredir aktivite yok!"}

        KURALLAR:
        1. **Yönetici Gibi Konuş:** "Günaydın Semih" diye başla ama hemen sadede gel. Gereksiz nezaket sözcüklerini at.
        2. **Nokta Atışı Yap:** Her veriyi sayma. Sadece EN ÖNEMLİ 2-3 konuyu birleştir.
           - Örn: "Yarınki çekim için bugün X görevini bitirmelisin."
           - Örn: "Finansal durum süper ama şu bekleyen teklifi kapatırsan rekor kırarız."
        3. **Uyarıcı Ol:** Eğer geciken görev veya uzun süredir bekleyen teklif varsa, bunları kibarca ama net bir şekilde hatırlat.
        4. **Kısa Tut:** Maksimum 3-4 cümle.
        5. **Türkçe Yanıtla.**
        `

        const result = await model.generateContent(prompt)
        const response = result.response
        return response.text()

    } catch (error) {
        console.error("AI Briefing Error:", error)
        return "Günaydın Semih! Sistemler çalışıyor. Verileri çekerken ufak bir sorun yaşadım ama sen harika bir gün geçireceksin! 🚀"
    }
}

export async function getTodaysTasks() {
    const supabase = await createClient()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const shootsResult = await supabase.from('shoots')
        .select(`
            id, 
            title, 
            shoot_date, 
            shoot_time,
            location,
            customers (name)
        `)
        .gte('shoot_date', today.toISOString())
        .lt('shoot_date', tomorrow.toISOString())
        .order('shoot_time', { ascending: true })

    const shoots = shootsResult.data

    const typedShoots = (shoots || []).map((s: any) => ({
        id: s.id,
        title: s.title,
        shoot_date: s.shoot_date,
        shoot_time: s.shoot_time,
        location: s.location,
        customers: Array.isArray(s.customers) ? s.customers[0] : s.customers
    }))

    return {
        shoots: typedShoots
    }
}
