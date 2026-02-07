import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Task } from "@/app/actions/tasks";
import { createClientSafe } from "@/lib/supabase/server";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { AlertTriangle } from "lucide-react";
import { TodaysTasksInteractive } from "./todays-tasks-interactive";
import { QuickActionsBar } from "./quick-actions-bar";
import { MiniStatsFooter } from "./mini-stats-footer";

export async function DailyCommandCenter() {
    const { client: supabase, envStatus } = await createClientSafe();

    // Get today's date
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    if (!supabase) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                <Card className="border-amber-500/40 bg-amber-500/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-700">
                            <AlertTriangle className="h-5 w-5" />
                            Konfigürasyon Eksik
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p>
                            Dashboard verileri yüklenemedi. Supabase bağlantısı için gerekli ortam değişkenleri tanımlı değil.
                        </p>
                        <p className="font-medium text-foreground">
                            Eksik anahtarlar: {envStatus.missingKeys.join(', ')}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    let tasks: Task[] = [];
    let activeClients: { id: string }[] = [];
    let nextShoot: { title: string; shoot_date: string } | null = null;
    let paidProposals: { total_amount: number | null }[] = [];
    let expenses: { amount: number | null }[] = [];

    // Fetch today's tasks
    try {
        const { data } = await supabase
            .from('tasks')
            .select('*')
            .eq('assigned_date', todayStr)
            .order('priority', { ascending: false })
            .order('position', { ascending: true });
        tasks = data || [];
    } catch (error) {
        console.error('Bugünün görevleri alınamadı:', error);
    }

    // Fetch mini stats
    try {
        const { data } = await supabase
            .from('customers')
            .select('id')
            .eq('status', 'active');
        activeClients = data || [];
    } catch (error) {
        console.error('Aktif müşteri sayısı alınamadı:', error);
    }

    try {
        const { data } = await supabase
            .from('shoots')
            .select('title, shoot_date')
            .gte('shoot_date', todayStr)
            .order('shoot_date', { ascending: true })
            .limit(1)
            .single();
        nextShoot = data;
    } catch (error) {
        console.error('Sıradaki çekim bilgisi alınamadı:', error);
    }

    try {
        const { data } = await supabase
            .from('proposals')
            .select('total_amount')
            .eq('payment_status', 'Paid');
        paidProposals = data || [];
    } catch (error) {
        console.error('Ödenen teklif verisi alınamadı:', error);
    }

    try {
        const { data } = await supabase
            .from('expenses')
            .select('amount');
        expenses = data || [];
    } catch (error) {
        console.error('Gider verisi alınamadı:', error);
    }

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
            <TodaysTasksInteractive initialTasks={tasks} />

            {/* Quick Actions Bar */}
            <QuickActionsBar />

            {/* Mini Stats Footer */}
            <MiniStatsFooter
                netWealth={netWealth}
                activeClientsCount={activeClients.length}
                nextShoot={nextShoot}
            />
        </div>
    );
}
