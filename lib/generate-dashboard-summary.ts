import { createClient } from "@/lib/supabase/server";

export interface SummaryPoint {
    id: number;
    text: string;
    status: "done" | "waiting" | "alert";
}

export async function generateDashboardSummary(): Promise<SummaryPoint[]> {
    const supabase = await createClient();
    const points: SummaryPoint[] = [];

    // BULLET 1: Tomorrow's Shoot
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0)).toISOString();
    const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999)).toISOString();

    const { data: tomorrowShoot } = await supabase
        .from('shoots')
        .select('*, customers(name)')
        .gte('shoot_date', startOfTomorrow)
        .lte('shoot_date', endOfTomorrow)
        .limit(1)
        .single();

    if (tomorrowShoot) {
        points.push({
            id: 1,
            text: `Yarın çekim: ${tomorrowShoot.customers?.name || 'Müşteri'}`,
            status: "waiting",
        });
    } else {
        points.push({
            id: 1,
            text: "Yarın için planlanmış çekim yok",
            status: "done",
        });
    }

    // BULLET 2: Active Projects Count
    const { count: activeCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

    points.push({
        id: 2,
        text: `Şu an ${activeCount || 0} aktif proje`,
        status: "done",
    });

    // BULLET 3: Cash Alert (Net Wealth)
    // Income: Paid Proposals
    const { data: paidProposals } = await supabase
        .from('proposals')
        .select('total_amount')
        .eq('payment_status', 'Paid');

    const totalIncome = paidProposals?.reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0;

    // Expenses
    const { data: expenses } = await supabase
        .from('expenses')
        .select('amount');

    const totalExpense = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

    const netWealth = totalIncome - totalExpense;

    if (netWealth < 10000) {
        points.push({
            id: 3,
            text: `Nakit uyarısı: ${Math.round(netWealth / 1000)}k TL`,
            status: "alert",
        });
    } else {
        points.push({
            id: 3,
            text: "Finansal durum stabil",
            status: "done",
        });
    }

    return points;
}
