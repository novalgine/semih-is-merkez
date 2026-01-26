"use client";

import { motion } from "framer-motion";
import {
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    TrendingUp,
    CreditCard,
    MoreHorizontal,
    Download,
    Filter
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { staggerContainer, staggerItem } from "@/lib/motion-variants";
import { cn } from "@/lib/utils";

// Mock Data for Finance (Replace with real data later)
const TRANSACTIONS = [
    { id: 1, title: "Prodüksiyon Ödemesi - XYZ Holding", date: "2024-01-25", amount: 45000, type: "income", category: "Proje" },
    { id: 2, title: "Kamera Kiralama - Lens", date: "2024-01-24", amount: -3200, type: "expense", category: "Ekipman" },
    { id: 3, title: "Adobe CC Abonelik", date: "2024-01-23", amount: -980, type: "expense", category: "Yazılım" },
    { id: 4, title: "Drone Çekimi - Emlak Projesi", date: "2024-01-22", amount: 12500, type: "income", category: "Proje" },
    { id: 5, title: "Stüdyo Kirası", date: "2024-01-20", amount: -8500, type: "expense", category: "Ofis" },
];

export default function FinancePage() {
    return (
        <motion.div
            className="space-y-8 pb-20"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Finansal Durum</h1>
                    <p className="text-muted-foreground mt-1">Nakit akışı ve karlılık analizi.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-9 gap-2">
                        <Download className="h-4 w-4" />
                        Rapor
                    </Button>
                    <MagneticButton className="bg-amber-600 hover:bg-amber-700 text-white h-9">
                        <Wallet className="h-4 w-4 mr-2" />
                        Yeni İşlem
                    </MagneticButton>
                </div>
            </div>

            {/* 1. The "Black Card" Hero Section (Net Profit) */}
            <motion.div variants={staggerItem} className="w-full">
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#050505] p-8 shadow-2xl micro-lift group">
                    {/* Mesh Gradient Background */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/20 via-zinc-900/50 to-black opacity-60 transition-opacity duration-500 group-hover:opacity-80" />

                    {/* Noise Texture */}
                    <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-overlay" />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                    <Wallet className="h-5 w-5 text-amber-500" />
                                </div>
                                <span className="text-xs font-medium tracking-[0.2em] text-zinc-400 uppercase">Toplam Net Varlık</span>
                            </div>

                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl md:text-6xl font-mono font-medium text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 tracking-tighter tabular-nums">
                                    ₺154.000
                                </span>
                                <span className="text-sm text-emerald-500 font-medium flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                                    <TrendingUp className="h-3 w-3" />
                                    +12.5%
                                </span>
                            </div>

                            <p className="text-sm text-zinc-500 max-w-md">
                                Geçen aya göre <span className="text-zinc-300">₺18.500</span> artış. Tahmini yıllık ciro hedefinin %42'sindesiniz.
                            </p>
                        </div>

                        {/* Card Chip / Logo */}
                        <div className="hidden md:block opacity-20">
                            <CreditCard className="h-32 w-32 text-white" strokeWidth={1} />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* 2. The "Glass Indicators" (Income/Expense) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Income Card */}
                <motion.div variants={staggerItem}>
                    <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 micro-lift group">
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Aylık Gelir</p>
                                <h3 className="text-2xl font-mono text-white mt-1 tabular-nums">₺57.500</h3>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <ArrowUpRight className="h-4 w-4" />
                            </div>
                        </div>
                        {/* Visual Sparkline Suggestion */}
                        <div className="h-12 w-full flex items-end gap-1 opacity-30">
                            {[40, 60, 45, 70, 50, 80, 65, 90].map((h, i) => (
                                <div key={i} className="flex-1 bg-emerald-500 rounded-t-sm" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Expense Card */}
                <motion.div variants={staggerItem}>
                    <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 micro-lift group">
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500/0 via-red-500/50 to-red-500/0 opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Aylık Gider</p>
                                <h3 className="text-2xl font-mono text-white mt-1 tabular-nums">₺12.780</h3>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                <ArrowDownRight className="h-4 w-4" />
                            </div>
                        </div>
                        {/* Visual Sparkline Suggestion */}
                        <div className="h-12 w-full flex items-end gap-1 opacity-30">
                            {[30, 45, 20, 60, 35, 50, 40, 25].map((h, i) => (
                                <div key={i} className="flex-1 bg-red-500 rounded-t-sm" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* 3. Transaction History (The Ledger) */}
            <motion.div variants={staggerItem} className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-lg font-semibold text-white">Son İşlemler</h2>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtrele
                    </Button>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-black/40 overflow-hidden backdrop-blur-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-zinc-500 uppercase bg-white/[0.02] border-b border-white/[0.05]">
                            <tr>
                                <th className="px-6 py-4 font-medium">İşlem</th>
                                <th className="px-6 py-4 font-medium">Kategori</th>
                                <th className="px-6 py-4 font-medium">Tarih</th>
                                <th className="px-6 py-4 font-medium text-right">Tutar</th>
                                <th className="px-6 py-4 font-medium text-right">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                            {TRANSACTIONS.map((tx) => (
                                <tr
                                    key={tx.id}
                                    className="group transition-colors hover:bg-white/[0.02] relative"
                                >
                                    <td className="px-6 py-4 font-medium text-zinc-200 group-hover:text-white transition-colors relative">
                                        {/* Amber Indicator on Hover */}
                                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {tx.title}
                                    </td>
                                    <td className="px-6 py-4 text-zinc-500">
                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-white/[0.05] border border-white/[0.05] text-xs">
                                            {tx.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-500 tabular-nums">
                                        {format(new Date(tx.date), "d MMM yyyy", { locale: tr })}
                                    </td>
                                    <td className={cn(
                                        "px-6 py-4 text-right font-mono font-medium tabular-nums",
                                        tx.amount > 0 ? "text-emerald-500" : "text-zinc-300"
                                    )}>
                                        {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString('tr-TR')} ₺
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}
