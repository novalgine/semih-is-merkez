"use client";

import { motion } from "framer-motion";
import {
    Wallet,
    Users,
    Plus,
    CreditCard,
    Calendar,
    ArrowUpRight,
    MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import { VoiceLogger } from "@/components/dashboard/voice-logger";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

// ... existing imports

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
            className="space-y-8 pb-24 max-w-7xl mx-auto px-4 md:px-0"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
        >
            {/* Header Area with Voice Assistant */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <motion.div variants={staggerItem} className="flex-1">
                    <AIBriefingSummary points={summaryPoints} />
                </motion.div>

                <motion.div variants={staggerItem} className="w-full md:w-auto">
                    <VoiceLogger onLogCreated={handleLogCreated} />
                </motion.div>
            </div>

            {/* Rest of the component ... */}

            {/* Main Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">

                {/* 1. Net Wealth (Large - Spans 8 cols) */}
                <motion.div variants={staggerItem} className="md:col-span-8 md:row-span-2">
                    <InteractiveCard className="h-full bg-card border-border p-8 rounded-[2rem] flex flex-col justify-between relative overflow-hidden group border-none shadow-sm">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-50 dark:from-amber-900/10" />

                        <div className="relative z-10 flex justify-between items-start">
                            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                <Wallet className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                                    +12% bu ay
                                </span>
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Finansal Sağlık</span>
                            </div>
                        </div>

                        <div className="relative z-10 mt-12">
                            <p className="text-muted-foreground text-sm font-semibold uppercase tracking-[0.2em]">Net Varlık</p>
                            <div className="flex items-baseline gap-2 mt-2">
                                <h2 className="text-5xl md:text-7xl font-bold text-foreground tracking-tighter tabular-nums">
                                    ₺{netWealth.toLocaleString('tr-TR')}
                                </h2>
                                <span className="text-xl font-medium text-muted-foreground/50">TRY</span>
                            </div>
                        </div>

                        {/* Subtle decorative graph or element can go here */}
                        <div className="absolute bottom-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ArrowUpRight className="h-32 w-32" />
                        </div>
                    </InteractiveCard>
                </motion.div>

                {/* 2. Today's Tasks (Vertical - Spans 4 cols) */}
                <motion.div variants={staggerItem} className="md:col-span-4 md:row-span-4">
                    <InteractiveCard className="h-full bg-card border-border p-8 rounded-[2rem] border-none shadow-sm overflow-hidden flex flex-col">
                        <TodaysTasks />
                        <div className="mt-auto pt-6 border-t border-border/50">
                            <Link href="/daily" className="w-full">
                                <Button variant="secondary" className="w-full rounded-xl gap-2 font-semibold">
                                    Tüm Planı Gör <Calendar className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </InteractiveCard>
                </motion.div>

                {/* 3. Active Clients (Medium - 4 cols) */}
                <motion.div variants={staggerItem} className="md:col-span-4 md:row-span-2">
                    <InteractiveCard className="h-full bg-card border-border p-8 rounded-[2rem] flex flex-col border-none shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                                </div>
                                <h3 className="font-bold text-lg text-foreground">Müşteriler</h3>
                            </div>
                            <Link href="/customers">
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <ArrowUpRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>

                        <div className="space-y-3 flex-1">
                            {activeClients.length > 0 ? (
                                activeClients.map((client) => (
                                    <Link key={client.id} href={`/customers/${client.id}`}>
                                        <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 hover:bg-muted/60 transition-all border border-transparent hover:border-border cursor-pointer group/item">
                                            <span className="text-sm font-semibold text-foreground italic group-hover/item:not-italic group-hover/item:text-blue-600 transition-all">
                                                {client.name}
                                            </span>
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground/60">
                                                {client.company || 'Bireysel'}
                                            </span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-sm italic">Aktif müşteri bulunamadı.</p>
                            )}
                        </div>
                    </InteractiveCard>
                </motion.div>

                {/* 4. Quick Actions (Medium - 4 cols) */}
                <motion.div variants={staggerItem} className="md:col-span-4 md:row-span-2">
                    <InteractiveCard className="h-full bg-card border-border p-8 rounded-[2rem] flex flex-col border-none shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <Plus className="h-5 w-5 text-purple-600 dark:text-purple-500" />
                            </div>
                            <h3 className="font-bold text-lg text-foreground">Hızlı Erişim</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4 flex-1">
                            <Link href="/proposals/create">
                                <button className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 rounded-[1.5rem] bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 hover:border-amber-500/30 transition-all group">
                                    <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Plus className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <span className="text-xs font-bold text-amber-900/70 dark:text-amber-500">Teklif</span>
                                </button>
                            </Link>

                            <Link href="/finance">
                                <button className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 rounded-[1.5rem] bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/30 transition-all group">
                                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <CreditCard className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <span className="text-xs font-bold text-emerald-900/70 dark:text-emerald-500">Gider</span>
                                </button>
                            </Link>
                        </div>
                    </InteractiveCard>
                </motion.div>

                {/* 5. Upcoming Shoots (Lower Large - 8 cols) */}
                <motion.div variants={staggerItem} className="md:col-span-8 md:row-span-2">
                    <InteractiveCard className="h-full bg-card border-border p-8 rounded-[2rem] border-none shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                    <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                                </div>
                                <h3 className="font-bold text-lg text-foreground">Yaklaşan Çekimler</h3>
                            </div>
                            <Link href="/shoots">
                                <Button variant="link" size="sm" className="font-bold text-muted-foreground hover:text-foreground">
                                    Tümünü Gör
                                </Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {upcomingShoots.length > 0 ? (
                                upcomingShoots.map((shoot) => (
                                    <Link key={shoot.id} href={`/shoots/${shoot.id}`}>
                                        <div className="flex items-center gap-5 p-5 rounded-2xl bg-muted/40 border border-transparent hover:border-orange-500/30 transition-all group/shoot">
                                            <div className="flex flex-col items-center justify-center h-16 w-16 rounded-[1.2rem] bg-card border border-border shadow-sm">
                                                <span className="text-[10px] font-black text-orange-600 uppercase tracking-tighter" suppressHydrationWarning>
                                                    {new Intl.DateTimeFormat('tr-TR', { month: 'short' }).format(new Date(shoot.shoot_date))}
                                                </span>
                                                <span className="text-2xl font-black text-foreground" suppressHydrationWarning>
                                                    {new Date(shoot.shoot_date).getDate()}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-foreground transition-colors line-clamp-1">{shoot.title}</h4>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-[10px] font-bold text-muted-foreground/70 bg-background px-3 py-1 rounded-full border border-border">
                                                        {shoot.customers?.name || 'Bireysel'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-sm italic col-span-2">Ortalık sakin, yakında çekim görünmüyor.</p>
                            )}
                        </div>
                    </InteractiveCard>
                </motion.div>

            </div>
        </motion.div>
    );
}
