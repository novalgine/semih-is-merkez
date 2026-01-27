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

import { InteractiveCard } from "@/components/ui/interactive-card";
import { Button } from "@/components/ui/button";
import { AIBriefingSummary } from "@/components/modules/dashboard/ai-briefing-summary";
import { staggerContainer, staggerItem } from "@/lib/motion-variants";

// Mock Data
const ACTIVE_CLIENTS = [
    { id: 1, name: "Afife Tiyatro", value: "50k" },
    { id: 2, name: "XYZ Holding", value: "120k" },
    { id: 3, name: "Studio A", value: "35k" },
];

const UPCOMING_SHOOTS = [
    { id: 1, title: "Afife - Prömiyer", date: "28 Jan", time: "19:00" },
    { id: 2, title: "XYZ - Reklam", date: "02 Feb", time: "09:00" },
];

export default function DashboardPage() {
    return (
        <motion.div
            className="space-y-6 pb-20 max-w-7xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
        >
            {/* 1. AI Briefing (Compressed) */}
            <motion.div variants={staggerItem}>
                <AIBriefingSummary />
            </motion.div>

            {/* 2. Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* TILE A: Net Wealth (Large - Spans 2 cols) */}
                <motion.div variants={staggerItem} className="md:col-span-2">
                    <InteractiveCard className="h-full bg-gradient-to-br from-zinc-900 to-black border-zinc-800 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent opacity-50" />

                        <div className="relative z-10 flex justify-between items-start">
                            <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                <Wallet className="h-5 w-5 text-amber-500" />
                            </div>
                            <span className="text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full text-xs font-medium border border-emerald-500/20">
                                +12% bu ay
                            </span>
                        </div>

                        <div className="relative z-10 mt-8">
                            <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Net Varlık</p>
                            <h2 className="text-4xl md:text-5xl font-mono text-white mt-2 tracking-tighter tabular-nums">
                                ₺159.000
                            </h2>
                        </div>
                    </InteractiveCard>
                </motion.div>

                {/* TILE B: Active Clients (Medium - 1 col) */}
                <motion.div variants={staggerItem} className="md:col-span-1">
                    <InteractiveCard className="h-full bg-zinc-900/50 border-zinc-800 p-6 rounded-2xl flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-zinc-400" />
                                <h3 className="font-semibold text-white">Aktif Müşteriler</h3>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-3 flex-1">
                            {ACTIVE_CLIENTS.map((client) => (
                                <div key={client.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-colors group/item cursor-pointer border border-white/[0.05]">
                                    <span className="text-sm font-medium text-zinc-300 group-hover/item:text-white transition-colors">
                                        {client.name}
                                    </span>
                                    <span className="text-xs font-mono text-zinc-500 bg-black/40 px-2 py-1 rounded-md border border-white/[0.05]">
                                        {client.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </InteractiveCard>
                </motion.div>

                {/* TILE C: Quick Actions (Small - 1 col) */}
                <motion.div variants={staggerItem} className="md:col-span-1">
                    <InteractiveCard className="h-full bg-zinc-900/50 border-zinc-800 p-6 rounded-2xl flex flex-col justify-center gap-3">
                        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-2">Hızlı İşlemler</h3>

                        <Link href="/proposals/create" className="w-full">
                            <Button variant="outline" className="w-full justify-start gap-3 h-12 text-zinc-300 hover:text-white hover:border-zinc-600 bg-zinc-900/50">
                                <div className="h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                    <Plus className="h-3 w-3 text-indigo-400" />
                                </div>
                                Yeni Teklif
                            </Button>
                        </Link>

                        <Link href="/finance" className="w-full">
                            <Button variant="outline" className="w-full justify-start gap-3 h-12 text-zinc-300 hover:text-white hover:border-zinc-600 bg-zinc-900/50">
                                <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <CreditCard className="h-3 w-3 text-emerald-400" />
                                </div>
                                Gider Ekle
                            </Button>
                        </Link>
                    </InteractiveCard>
                </motion.div>

                {/* TILE D: Upcoming Shoots (Medium - Spans 2 cols) */}
                <motion.div variants={staggerItem} className="md:col-span-2">
                    <InteractiveCard className="h-full bg-zinc-900/50 border-zinc-800 p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-zinc-400" />
                                <h3 className="font-semibold text-white">Yaklaşan Çekimler</h3>
                            </div>
                            <Link href="/shoots">
                                <Button variant="ghost" size="sm" className="text-xs gap-1 text-zinc-500 hover:text-white">
                                    Tümü <ArrowUpRight className="h-3 w-3" />
                                </Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {UPCOMING_SHOOTS.map((shoot) => (
                                <div key={shoot.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] transition-colors group/shoot">
                                    <div className="flex flex-col items-center justify-center h-12 w-12 rounded-lg bg-zinc-900 border border-zinc-800">
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase">{shoot.date.split(' ')[1]}</span>
                                        <span className="text-lg font-bold text-white">{shoot.date.split(' ')[0]}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-zinc-200 group-hover/shoot:text-white transition-colors">{shoot.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                                                {shoot.time}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </InteractiveCard>
                </motion.div>

            </div>
        </motion.div>
    );
}
