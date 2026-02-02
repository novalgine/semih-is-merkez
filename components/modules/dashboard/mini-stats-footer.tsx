import { Wallet, Users, Calendar } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface MiniStatsFooterProps {
    netWealth: number;
    activeClientsCount: number;
    nextShoot: { title: string; shoot_date: string } | null;
}

export function MiniStatsFooter({ netWealth, activeClientsCount, nextShoot }: MiniStatsFooterProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Net Wealth */}
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Wallet className="h-5 w-5 text-amber-600" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs text-muted-foreground font-semibold">Net Varlık</p>
                    <p className="text-lg font-bold truncate">₺{netWealth.toLocaleString('tr-TR')}</p>
                </div>
            </div>

            {/* Active Clients */}
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs text-muted-foreground font-semibold">Aktif Müşteri</p>
                    <p className="text-lg font-bold">{activeClientsCount}</p>
                </div>
            </div>

            {/* Next Shoot */}
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground font-semibold">Sonraki Çekim</p>
                    {nextShoot ? (
                        <p className="text-sm font-bold truncate">
                            {format(new Date(nextShoot.shoot_date), "d MMM", { locale: tr })} • {nextShoot.title}
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">Yok</p>
                    )}
                </div>
            </div>
        </div>
    );
}
