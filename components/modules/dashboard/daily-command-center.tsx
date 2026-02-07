import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { TodaysTasksInteractive } from "./todays-tasks-interactive";
import { QuickActionsBar } from "./quick-actions-bar";
import { MiniStatsFooter } from "./mini-stats-footer";
import { getDailyCommandCenterData } from "./daily-command-center-data";

export async function DailyCommandCenter() {
    const supabase = await createClient();
    const { today, tasks, activeClientsCount, nextShoot, netWealth } = await getDailyCommandCenterData(supabase);

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
                activeClientsCount={activeClientsCount}
                nextShoot={nextShoot}
            />
        </div>
    );
}
