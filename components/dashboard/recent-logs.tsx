import { createClient } from "@/lib/supabase/server";
import { InteractiveCard } from "@/components/ui/interactive-card";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const CATEGORY_COLORS = {
    "To-Do": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    "Idea": "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    "Thought": "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
    "Meeting Note": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

export async function RecentLogs() {
    const supabase = await createClient();

    const { data: logs } = await supabase
        .from('daily_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (!logs || logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-xl bg-muted/30">
                <p className="text-muted-foreground text-sm italic">Henüz sesli not kaydedilmemiş.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {logs.map((log) => (
                <InteractiveCard
                    key={log.id}
                    className="bg-card border-border p-4 rounded-xl hover:border-amber-500/30 transition-all duration-300"
                >
                    <div className="flex items-start gap-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border shrink-0 ${CATEGORY_COLORS[log.category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.Thought}`}>
                            {log.category}
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground font-medium leading-relaxed">
                                {log.content}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`h-1.5 w-1.5 rounded-full ${log.sentiment === 'Urgent' ? 'bg-red-500 animate-pulse' :
                                        log.sentiment === 'Positive' ? 'bg-emerald-500' : 'bg-zinc-400'
                                    }`} />
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                    {format(new Date(log.created_at), "d MMMM, HH:mm", { locale: tr })}
                                </span>
                            </div>
                        </div>
                    </div>
                </InteractiveCard>
            ))}
        </div>
    );
}
