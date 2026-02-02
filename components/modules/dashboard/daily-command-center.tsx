import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { TodaysTasksInteractive } from "./todays-tasks-interactive";
import { QuickActionsBar } from "./quick-actions-bar";
import { MiniStatsFooter } from "./mini-stats-footer";

export async function DailyCommandCenter() {
    const supabase = await createClient();

    // Get today's date
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    // Fetch today's tasks
    const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_date', todayStr)
        .order('priority', { ascending: false })
        .order('position', { ascending: true });

    // Fetch mini stats
    const { data: activeClients } = await supabase
        .from('customers')
        .select('id')
        .eq('status', 'active');

    const { data: nextShoot } = await supabase
        .from('shoots')
        .select('title, shoot_date')
        .gte('shoot_date', todayStr)
        .order('shoot_date', { ascending: true })
        .limit(1)
        .single();

    const { data: paidProposals } = await supabase
        .from('proposals')
        .select('total_amount')
        .eq('payment_status', 'Paid');

    const { data: expenses } = await supabase
        .from('expenses')
        .select('amount');

    const totalIncome = paidProposals?.reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0;
    const totalExpense = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
    const netWealth = totalIncome - totalExpense;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                    Günaydın Semih! 🎬
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">
                    {format(today, "d MMMM yyyy, EEEE", { locale: tr })}
                </p>
            </div>

            {/* Today's Tasks Hero */}
            <TodaysTasksInteractive initialTasks={tasks || []} />

            {/* Quick Actions Bar */}
            <QuickActionsBar />

            {/* Mini Stats Footer */}
            <MiniStatsFooter
                netWealth={netWealth}
                activeClientsCount={activeClients?.length || 0}
                nextShoot={nextShoot}
            />
        </div>
    );
}
