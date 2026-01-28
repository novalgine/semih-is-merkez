import { createClient } from "@/lib/supabase/server";
import { InteractiveCard } from "@/components/ui/interactive-card";
import { ShootActions } from "@/components/modules/shoots/shoot-actions";
import { Plus, Calendar, Clock, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ShootsPage() {
    const supabase = await createClient();
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Fetch all shoots with customer names
    const { data: shoots, error } = await supabase
        .from('shoots')
        .select(`
      *,
      customers (name)
    `)
        .order('shoot_date', { ascending: true });

    if (error) {
        console.error("Error fetching shoots:", error);
    }

    // Auto-Archive Logic: Split into Upcoming and Past
    const upcomingShoots = (shoots || []).filter(s => s.shoot_date >= todayStr);
    const pastShoots = (shoots || []).filter(s => s.shoot_date < todayStr)
        .sort((a, b) => new Date(b.shoot_date).getTime() - new Date(a.shoot_date).getTime());

    const formatShootDate = (dateString: string) => {
        if (!dateString) return "Tarih Belirtilmedi";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('tr-TR', {
            day: 'numeric',
            month: 'long',
            weekday: 'long'
        }).format(date);
    };

    const isToday = (dateString: string) => dateString === todayStr;

    return (
        <div className="space-y-10 pb-20 max-w-7xl mx-auto">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Çekim Takvimi</h1>
                    <p className="text-zinc-500 mt-1">Prodüksiyon planları ve set yönetimi.</p>
                </div>
                <Link href="/shoots/create">
                    <Button className="bg-amber-600 hover:bg-amber-700 text-white border-none gap-2">
                        <Plus className="h-4 w-4" />
                        Yeni Çekim Planla
                    </Button>
                </Link>
            </div>

            {/* UPCOMING SECTION */}
            <section>
                <h2 className="text-sm font-medium text-zinc-500 mb-6 uppercase tracking-widest flex items-center gap-3">
                    Planlanan Çekimler
                    <div className="h-px flex-1 bg-zinc-800/50" />
                    <span className="text-zinc-600 font-mono text-xs">{upcomingShoots.length}</span>
                </h2>

                {upcomingShoots.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {upcomingShoots.map((shoot) => (
                            <InteractiveCard
                                key={shoot.id}
                                className="relative group border-zinc-800 bg-zinc-900/40 p-6 rounded-2xl flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                            {isToday(shoot.shoot_date) ? (
                                                <span className="px-3 py-1 text-[10px] font-bold tracking-tighter bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full animate-pulse">
                                                    BUGÜN
                                                </span>
                                            ) : (
                                                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                                                    {formatShootDate(shoot.shoot_date)}
                                                </span>
                                            )}
                                        </div>
                                        <ShootActions shootId={shoot.id} />
                                    </div>

                                    <h3 className="text-lg font-semibold text-white mb-4 group-hover:text-amber-400 transition-colors line-clamp-1">
                                        {shoot.title}
                                    </h3>

                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-2.5 text-sm text-zinc-400">
                                            <Users className="h-4 w-4 text-zinc-600" />
                                            <span className="truncate">{shoot.customers?.name || 'Bilinmeyen Müşteri'}</span>
                                        </div>
                                        {shoot.shoot_time && (
                                            <div className="flex items-center gap-2.5 text-sm text-zinc-400">
                                                <Clock className="h-4 w-4 text-zinc-600" />
                                                <span>{shoot.shoot_time}</span>
                                            </div>
                                        )}
                                        {shoot.location && (
                                            <div className="flex items-center gap-2.5 text-sm text-zinc-400">
                                                <MapPin className="h-4 w-4 text-zinc-600" />
                                                <span className="truncate">{shoot.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </InteractiveCard>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-zinc-900/20 rounded-3xl border border-dashed border-zinc-800">
                        <p className="text-zinc-500 text-sm">Planlanmış çekim yok</p>
                    </div>
                )}
            </section>

            {/* PAST SECTION */}
            <section>
                <h2 className="text-sm font-medium text-zinc-600 mb-6 uppercase tracking-widest flex items-center gap-3">
                    Geçmiş Çekimler
                    <div className="h-px flex-1 bg-zinc-800/30" />
                    <span className="text-zinc-700 font-mono text-xs">{pastShoots.length}</span>
                </h2>

                {pastShoots.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {pastShoots.map((shoot) => (
                            <InteractiveCard
                                key={shoot.id}
                                className="relative group border-zinc-800/50 bg-zinc-900/20 p-6 rounded-2xl opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0 transition-all"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-xs font-medium text-zinc-600 uppercase tracking-wide">
                                        {formatShootDate(shoot.shoot_date)}
                                    </span>
                                    <ShootActions shootId={shoot.id} />
                                </div>

                                <h3 className="text-lg font-semibold text-zinc-400 mb-3 group-hover:text-zinc-200 transition-colors truncate">
                                    {shoot.title}
                                </h3>

                                <div className="flex items-center gap-2 text-sm text-zinc-500">
                                    <Users className="h-4 w-4" />
                                    <span className="truncate">{shoot.customers?.name}</span>
                                </div>
                            </InteractiveCard>
                        ))}
                    </div>
                ) : (
                    <p className="text-zinc-600 text-sm italic">Geçmiş çekim yok</p>
                )}
            </section>
        </div>
    );
}
