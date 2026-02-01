"use client";

import { motion } from "framer-motion";
import {
    Wallet,
    Users,
    Plus,
    CreditCard,
    Calendar,
    ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { VoiceLogger } from "@/components/dashboard/voice-logger";
import { InteractiveCard } from "@/components/ui/interactive-card";
import { Button } from "@/components/ui/button";
import { AIBriefingSummary } from "@/components/modules/dashboard/ai-briefing-summary";
import { TodaysTasks } from "@/components/modules/dashboard/todays-tasks";
import { staggerContainer, staggerItem } from "@/lib/motion-variants";
import { SummaryPoint } from "@/lib/generate-dashboard-summary";

export interface DashboardClientProps {
    summaryPoints: SummaryPoint[];
    activeClients: any[];
    upcomingShoots: any[];
    netWealth: number;
}

export function DashboardClient({
    summaryPoints,
    activeClients,
    upcomingShoots,
    netWealth
}: DashboardClientProps) {
    const router = useRouter();

    const handleLogCreated = useCallback(() => {
        router.refresh();
    }, [router]);

    return (
        <motion.div
            className="max-w-7xl mx-auto px-4 py-8 md:px-6 space-y-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
        >
            {/* BENTO GRID CONTAINER */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">

                {/* 1. GÜNÜN ÖZETİ (Tam Genişlik - En Üst) */}
                <motion.div variants={staggerItem} className="col-span-1 md:col-span-2 lg:col-span-3">
                    <AIBriefingSummary points={summaryPoints} />
                </motion.div>

                {/* 2. SESLİ NOT (Sol Üst) */}
                <motion.div variants={staggerItem} className="col-span-1 h-full">
                    <VoiceLogger onLogCreated={handleLogCreated} />
                </motion.div>

                {/* 3. NET VARLIK (Orta Üst) */}
                <motion.div variants={staggerItem} className="col-span-1 h-full">
                    <InteractiveCard className="h-full bg-card border-border p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group shadow-sm min-h-[160px]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-50 dark:from-amber-900/10" />

                        <div className="relative z-10 flex justify-between items-start">
                            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                <Wallet className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                            </div>
                            <span className="text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/20">
                                +12%
                            </span>
                        </div>

                        <div className="relative z-10 mt-4">
                            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Net Varlık</p>
                            <div className="flex items-baseline gap-1 mt-1">
                                <h2 className="text-3xl font-bold text-foreground tracking-tight tabular-nums">
                                    ₺{netWealth.toLocaleString('tr-TR')}
                                </h2>
                            </div>
                        </div>
                    </InteractiveCard>
                </motion.div>

                {/* 4. HIZLI ERİŞİM (Sağ Üst) */}
                <motion.div variants={staggerItem} className="col-span-1 h-full">
                    <InteractiveCard className="h-full bg-card border-border p-6 rounded-2xl flex flex-col shadow-sm min-h-[160px]">
                        <h3 className="font-bold text-sm text-foreground mb-4 flex items-center gap-2">
                            <Plus className="h-4 w-4 text-purple-600" /> Hızlı Erişim
                        </h3>
                        <div className="grid grid-cols-2 gap-3 flex-1">
                            <Link href="/proposals/create" className="h-full">
                                <button className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-muted/50 hover:bg-muted border border-transparent hover:border-border transition-all group">
                                    <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Plus className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <span className="text-[10px] font-bold">Teklif</span>
                                </button>
                            </Link>

                            <Link href="/finance" className="h-full">
                                <button className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-muted/50 hover:bg-muted border border-transparent hover:border-border transition-all group">
                                    <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <CreditCard className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <span className="text-[10px] font-bold">Gider</span>
                                </button>
                            </Link>
                        </div>
                    </InteractiveCard>
                </motion.div>

                {/* 5. BUGÜNÜN İŞLERİ (Sol Alt - Dikey Uzun) */}
                <motion.div variants={staggerItem} className="col-span-1 lg:row-span-2 h-full">
                    <InteractiveCard className="h-full bg-card border-border p-6 rounded-2xl shadow-sm flex flex-col min-h-[300px]">
                        <TodaysTasks />
                        <div className="mt-auto pt-4 border-t border-border/50">
                            <Link href="/daily" className="w-full">
                                <Button variant="secondary" size="sm" className="w-full rounded-lg gap-2 font-semibold h-9 text-xs">
                                    Tüm Planı Gör <Calendar className="h-3 w-3" />
                                </Button>
                            </Link>
                        </div>
                    </InteractiveCard>
                </motion.div>

                {/* 6. MÜŞTERİLER (Orta Alt) */}
                <motion.div variants={staggerItem} className="col-span-1 h-full">
                    <InteractiveCard className="h-full bg-card border-border p-6 rounded-2xl shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                                </div>
                                <h3 className="font-bold text-sm text-foreground">Müşteriler</h3>
                            </div>
                            <Link href="/customers">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                    <ArrowUpRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>

                        <div className="space-y-2 flex-1 overflow-auto max-h-[200px] pr-1">
                            {activeClients.length > 0 ? (
                                activeClients.map((client) => (
                                    <Link key={client.id} href={`/customers/${client.id}`}>
                                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 transition-all border border-transparent hover:border-border cursor-pointer group/item">
                                            <span className="text-xs font-semibold text-foreground group-hover/item:text-blue-600 transition-colors truncate max-w-[120px]">
                                                {client.name}
                                            </span>
                                            <span className="text-[9px] uppercase font-bold text-muted-foreground/60 truncate max-w-[80px]">
                                                {client.company || 'Bireysel'}
                                            </span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-xs italic">Aktif müşteri yok.</p>
                            )}
                        </div>
                    </InteractiveCard>
                </motion.div>

                {/* 7. YAKLAŞAN ÇEKİMLER (Sağ Alt - ve Alt Orta Genişlik) */}
                <motion.div variants={staggerItem} className="col-span-1 h-full">
                    <InteractiveCard className="h-full bg-card border-border p-6 rounded-2xl shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                    <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-500" />
                                </div>
                                <h3 className="font-bold text-sm text-foreground">Çekimler</h3>
                            </div>
                            <Link href="/shoots">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                    <ArrowUpRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>

                        <div className="space-y-3 flex-1 overflow-auto max-h-[200px] pr-1">
                            {upcomingShoots.length > 0 ? (
                                upcomingShoots.map((shoot) => {
                                    const date = shoot.shoot_date ? new Date(shoot.shoot_date) : new Date();
                                    const day = date.getDate();
                                    const month = new Intl.DateTimeFormat('tr-TR', { month: 'short' }).format(date);

                                    return (
                                        <Link key={shoot.id} href={`/shoots/${shoot.id}`}>
                                            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 border border-transparent hover:border-border transition-all">
                                                <div className="flex flex-col items-center justify-center h-10 w-10 rounded-lg bg-background border border-border shadow-sm shrink-0">
                                                    <span className="text-[8px] font-bold text-orange-600 uppercase leading-none">{month}</span>
                                                    <span className="text-xs font-bold text-foreground leading-none mt-0.5">{day}</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-semibold text-xs text-foreground truncate">{shoot.title}</h4>
                                                    <p className="text-[10px] text-muted-foreground truncate">{shoot.customers?.name}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })
                            ) : (
                                <p className="text-muted-foreground text-xs italic">Yakında çekim yok.</p>
                            )}
                        </div>
                    </InteractiveCard>
                </motion.div>

            </div>
        </motion.div>
    );
}
