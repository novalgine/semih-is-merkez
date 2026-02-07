import { createClient } from "@/lib/supabase/server";

export interface SummaryPoint {
    id: number;
    text: string;
    status: "done" | "waiting" | "alert" | "info";
}

// Random motivation/tips to mix things up when it's quiet
const MOTIVATIONS = [
    "Bugün işleri bitirip kendine vakit ayır!",
    "Harika gidiyorsun, bu tempoyu koru.",
    "Küçük adımlar büyük hedeflere götürür.",
    "Bir kahve molası verip planını gözden geçir.",
    "Odaklan ve listeyi erit!",
];


type CustomerSummary = {
    name: string
}

function getCustomerName(customers: CustomerSummary | CustomerSummary[] | null): string | undefined {
    if (!customers) {
        return undefined;
    }

    return Array.isArray(customers) ? customers[0]?.name : customers.name;
}

export async function generateDashboardSummary(): Promise<SummaryPoint[]> {
    const supabase = await createClient();
    const points: SummaryPoint[] = [];
    const today = new Date();

    // --- 1. OPERASYONEL DURUM (ÇEKİMLER & GÖREVLER) ---
    const startOfToday = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfWeek = new Date(today.setDate(today.getDate() + 7)).toISOString();

    // Get upcoming shoots (next 3 days)
    const { data: upcomingShoots } = await supabase
        .from('shoots')
        .select('*, customers(name)')
        .gte('shoot_date', startOfToday)
        .lt('shoot_date', endOfWeek)
        .order('shoot_date', { ascending: true })
        .limit(3);

    // Get overdue tasks
    const { count: overdueCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .lt('assigned_date', new Date().toISOString().split('T')[0])
        .eq('is_completed', false);

    if (upcomingShoots && upcomingShoots.length > 0) {
        const shoot = upcomingShoots[0];
        const date = new Date(shoot.shoot_date);
        const dayName = date.toLocaleDateString('tr-TR', { weekday: 'long' });
        const isToday = date.toDateString() === new Date().toDateString();

        points.push({
            id: 1,
            text: `${isToday ? 'BUGÜN' : dayName} çekim var: ${shoot.customers?.name || 'Müşteri'} - ${shoot.title}`,
            status: "waiting", // Yellow/Orange
        });
    } else if (overdueCount && overdueCount > 0) {
        points.push({
            id: 1,
            text: `Dikkat: ${overdueCount} gecikmiş görevin var. Eritmeye başla!`,
            status: "alert", // Red
        });
    } else {
        const motivation = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];
        points.push({
            id: 1,
            text: `Takvim sakin. ${motivation}`,
            status: "done", // Green
        });
    }

    // --- 2. FİNANSAL SAĞLIK ---
    // Pending high-value proposals
    const { data: activeProposals } = await supabase
        .from('proposals')
        .select('total_amount, customers(name)')
        .eq('status', 'Sent')
        .order('total_amount', { ascending: false })
        .limit(1);

    // Calculate pending income
    const { data: pendingProps } = await supabase
        .from('proposals')
        .select('total_amount')
        .eq('status', 'Sent');

    const pendingTotal = pendingProps?.reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0;

    if (activeProposals && activeProposals.length > 0 && (activeProposals[0].total_amount || 0) > 20000) {
        const topProp = activeProposals[0];
        const customerName = getCustomerName(topProp.customers as CustomerSummary | CustomerSummary[] | null);

        points.push({
            id: 2,
            text: `Fırsat: ${customerName || 'Müşteri'} teklifi (${Math.round((topProp.total_amount || 0) / 1000)}k) onay bekliyor.`,
            status: "info",
        });
    } else if (pendingTotal > 0) {
        points.push({
            id: 2,
            text: `Masada bekleyen toplam ${Math.round(pendingTotal / 1000)}k TL potansiyel ciro var.`,
            status: "waiting",
        });
    } else {
        // Fallback to active projects count
        const { count: activeCount } = await supabase
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');

        points.push({
            id: 2,
            text: `${activeCount || 0} aktif müşteriyle operasyon devam ediyor.`,
            status: "done",
        });
    }

    // --- 3. KRİTİK UYARI / İSTATİSTİK ---
    // Check expenses vs income ratio or low stats
    // Or just check unpaid invoices
    const { count: unpaidCount } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Approved')
        .neq('payment_status', 'Paid');

    if (unpaidCount && unpaidCount > 0) {
        points.push({
            id: 3,
            text: `Tahsilat Zamanı: ${unpaidCount} onaylı işin ödemesi alınmamış.`,
            status: "alert",
        });
    } else {
        // Net Wealth Check logic preserved but refined
        // Income
        const { data: paidProposals } = await supabase
            .from('proposals')
            .select('total_amount')
            .eq('payment_status', 'Paid');
        const totalIncome = paidProposals?.reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0;
        // Expenses
        const { data: expenses } = await supabase.from('expenses').select('amount');
        const totalExpense = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

        const wealth = totalIncome - totalExpense;

        if (wealth < 5000) {
            points.push({
                id: 3,
                text: `Nakit akışına dikkat et. Kasa: ${Math.round(wealth / 1000)}k TL`,
                status: "alert",
            });
        } else {
            points.push({
                id: 3,
                text: "Nakit akışın sağlıklı, harika gidiyorsun.",
                status: "done",
            });
        }
    }

    return points;
}
