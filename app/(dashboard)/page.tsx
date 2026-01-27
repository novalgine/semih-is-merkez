import { createClient } from "@/lib/supabase/server";
import { generateDashboardSummary } from "@/lib/generate-dashboard-summary";
import { DashboardClient } from "@/components/modules/dashboard/dashboard-client";

export default async function DashboardPage() {
    const supabase = await createClient();

    let activeClients: any[] = [];
    let upcomingShoots: any[] = [];
    let summaryPoints: any[] = [];
    let netWealth: number = 0;

    try {
        // 1. Fetch Active Clients
        const { data: clients } = await supabase
            .from('customers')
            .select('id, name, company')
            .eq('status', 'active')
            .limit(3)
            .order('created_at', { ascending: false });

        activeClients = clients || [];

        // 2. Fetch Upcoming Shoots
        const { data: shoots } = await supabase
            .from('shoots')
            .select(`
                id, 
                title, 
                shoot_date,
                customers (name)
            `)
            .gte('shoot_date', new Date().toISOString())
            .limit(2)
            .order('shoot_date', { ascending: true });

        upcomingShoots = shoots || [];

        // 3. Generate AI Summary
        summaryPoints = await generateDashboardSummary();

        // 4. Calculate Net Wealth
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

        netWealth = totalIncome - totalExpense;

    } catch (error) {
        console.error("Dashboard data fetch error:", error);
    }

    return (
        <DashboardClient
            summaryPoints={summaryPoints}
            activeClients={activeClients}
            upcomingShoots={upcomingShoots}
            netWealth={netWealth}
        />
    );
}
