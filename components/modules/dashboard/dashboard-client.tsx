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
import { Suspense } from "react";

import { InteractiveCard } from "@/components/ui/interactive-card";
import { Button } from "@/components/ui/button";
import { AIBriefingSummary } from "@/components/modules/dashboard/ai-briefing-summary";
import { staggerContainer, staggerItem } from "@/lib/motion-variants";
import { SummaryPoint } from "@/lib/generate-dashboard-summary";

interface DashboardClientProps {
    summaryPoints: SummaryPoint[];
    activeClients: any[];
    upcomingShoots: any[];
    netWealth: number;
    recentLogs: React.ReactNode;
}

export function DashboardClient({
    summaryPoints,
    activeClients,
    upcomingShoots,
    netWealth,
    recentLogs
}: DashboardClientProps) {
    const router = useRouter();
    return (
        <motion.div
            className="space-y-6 pb-20 max-w-7xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
        >
            {/* 1. AI Briefing (Compressed) */}
            <motion.div variants={staggerItem}>
                <AIBriefingSummary points={summaryPoints} />
            </motion.div>

            {/* Voice Logger Section */}
            <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <VoiceLogger onLogCreated={() => router.refresh()} />
                </div>
                <div className="md:col-span-2">
                    <InteractiveCard className="h-full bg-card border-border p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Son Sesli Notlar</h3>
                        <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {recentLogs}
                        </div>
                    </InteractiveCard>
                </div>
            </motion.div>

            {/* 2. Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* TILE A: Net Wealth (Large - Spans 2 cols) */}
                <motion.div variants={staggerItem} className="md:col-span-2">
                    <InteractiveCard className="h-full bg-card border-border p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-50 dark:from-amber-900/10" />

                        <div className="relative z-10 flex justify-between items-start">
                            <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                <Wallet className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                            </div>
                            <span className="text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full text-xs font-medium border border-emerald-500/20">
                                +12% bu ay
                            </span>
                        </div>

                        <div className="relative z-10 mt-8">
                            <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Net Varlık</p>
                            <h2 className="text-4xl md:text-5xl font-mono text-foreground mt-2 tracking-tighter tabular-nums">
                                ₺{netWealth.toLocaleString('tr-TR')}
                            </h2>
                        </div>
                    </InteractiveCard>
                </motion.div>

                {/* TILE B: Active Clients (Medium - 1 col) */}
                <motion.div variants={staggerItem} className="md:col-span-1">
                    <InteractiveCard className="h-full bg-card border-border p-6 rounded-2xl flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <h3 className="font-semibold text-foreground">Aktif Müşteriler</h3>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-3 flex-1">
                            {activeClients.length > 0 ? (
                                activeClients.map((client) => (
                                    <Link key={client.id} href={`/customers/${client.id}`}>
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group/item cursor-pointer border border-border">
                                            <span className="text-sm font-medium text-muted-foreground group-hover/item:text-foreground transition-colors">
                                                {client.name}
                                            </span>
                                            <span className="text-xs font-mono text-muted-foreground bg-background px-2 py-1 rounded-md border border-border">
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

                {/* TILE C: Quick Actions (Small - 1 col) */}
                <motion.div variants={staggerItem} className="md:col-span-1">
                    <InteractiveCard className="h-full bg-card border-border p-6 rounded-2xl flex flex-col justify-center gap-3 text-center md:text-left">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Hızlı İşlemler</h3>

                        <Link href="/proposals/create" className="w-full">
                            <Button variant="outline" className="w-full justify-start gap-3 h-12 text-muted-foreground hover:text-foreground hover:border-border/50 bg-background/50">
                                <div className="h-6 w-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                                    <Plus className="h-3 w-3 text-amber-600 dark:text-amber-500" />
                                </div>
                                Yeni Teklif
                            </Button>
                        </Link>

                        <Link href="/finance" className="w-full">
                            <Button variant="outline" className="w-full justify-start gap-3 h-12 text-muted-foreground hover:text-foreground hover:border-border/50 bg-background/50">
                                <div className="h-6 w-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                                    <CreditCard className="h-3 w-3 text-amber-600 dark:text-amber-500" />
                                </div>
                                Gider Ekle
                            </Button>
                        </Link>
                    </InteractiveCard>
                </motion.div>

                {/* TILE D: Upcoming Shoots (Medium - Spans 2 cols) */}
                <motion.div variants={staggerItem} className="md:col-span-2">
                    <InteractiveCard className="h-full bg-card border-border p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <h3 className="font-semibold text-foreground">Yaklaşan Çekimler</h3>
                            </div>
                            <Link href="/shoots">
                                <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-foreground">
                                    Tümü <ArrowUpRight className="h-3 w-3" />
                                </Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {upcomingShoots.length > 0 ? (
                                upcomingShoots.map((shoot) => (
                                    <Link key={shoot.id} href={`/shoots/${shoot.id}`}>
                                        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border hover:border-amber-500/50 transition-colors group/shoot">
                                            <div className="flex flex-col items-center justify-center h-12 w-12 rounded-lg bg-card border border-border">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                    {new Intl.DateTimeFormat('tr-TR', { month: 'short' }).format(new Date(shoot.shoot_date))}
                                                </span>
                                                <span className="text-lg font-bold text-foreground">
                                                    {new Date(shoot.shoot_date).getDate()}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-muted-foreground group-hover/shoot:text-foreground transition-colors">{shoot.title}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border">
                                                        {shoot.customers?.name || 'Bilinmeyen'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-sm italic col-span-2">Yaklaşan çekim bulunamadı.</p>
                            )}
                        </div>
                    </InteractiveCard>
                </motion.div>

            </div>
        </motion.div>
    );
}
