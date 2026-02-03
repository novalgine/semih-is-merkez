"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Wallet,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    Filter,
    BarChart3,
    History,
    LayoutDashboard,
    Trash2,
    Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InteractiveCard } from "@/components/ui/interactive-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuickActionTemplates } from "./quick-action-templates";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
    deleteTemplate
} from "@/app/actions/finance";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface FinanceClientProps {
    netWealth: number;
    monthlyIncome: number;
    monthlyExpense: number;
    transactions: any[];
    expenseTemplates: any[];
    incomeTemplates: any[];
    incomes: any[];
    chartData: any[];
}

export function FinanceClient({
    netWealth,
    monthlyIncome,
    monthlyExpense,
    transactions,
    expenseTemplates,
    incomeTemplates,
    incomes,
    chartData
}: FinanceClientProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview");

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handleDeleteTemplate = async (type: 'income' | 'expense', id: string) => {
        const res = await deleteTemplate(type, id);
        if (res.success) {
            toast.success("Şablon silindi.");
            router.refresh();
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Finans Paneli</h1>
                    <p className="text-muted-foreground mt-1">Geleceği planla, geçmişi analiz et.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Rapor Al
                    </Button>
                    <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
                        <Plus className="h-4 w-4" />
                        Yeni Veri
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Net Wealth Card */}
                <InteractiveCard className="bg-[#050505] border-white/10 p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wallet className="h-24 w-24 text-white" />
                    </div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-[0.2em] mb-2">Net Varlık</p>
                    <h2 className="text-4xl font-bold text-white tabular-nums mb-4">{formatCurrency(netWealth)}</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-emerald-500 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/10 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Stabil
                        </span>
                    </div>
                </InteractiveCard>

                {/* Monthly Income */}
                <InteractiveCard className="bg-emerald-500/5 border-emerald-500/10 p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <ArrowUpRight className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest">Aylık</span>
                    </div>
                    <p className="text-xs font-semibold text-zinc-500 uppercase mb-1">Gelir</p>
                    <h3 className="text-2xl font-bold text-white tabular-nums">{formatCurrency(monthlyIncome)}</h3>
                </InteractiveCard>

                {/* Monthly Expense */}
                <InteractiveCard className="bg-red-500/5 border-red-500/10 p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                            <ArrowDownRight className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest">Aylık</span>
                    </div>
                    <p className="text-xs font-semibold text-zinc-500 uppercase mb-1">Gider</p>
                    <h3 className="text-2xl font-bold text-white tabular-nums">{formatCurrency(monthlyExpense)}</h3>
                </InteractiveCard>
            </div>

            {/* Quick Actions Bar */}
            <QuickActionTemplates
                expenseTemplates={expenseTemplates}
                incomeTemplates={incomeTemplates}
            />

            {/* Main Tabs UI */}
            <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="bg-black/40 border border-white/5 p-1 h-12 rounded-xl mb-6">
                    <TabsTrigger value="overview" className="gap-2 rounded-lg data-[state=active]:bg-white/10">
                        <LayoutDashboard className="h-4 w-4" />
                        Genel Bakış
                    </TabsTrigger>
                    <TabsTrigger value="history" className="gap-2 rounded-lg data-[state=active]:bg-white/10">
                        <History className="h-4 w-4" />
                        İşlem Geçmişi
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="gap-2 rounded-lg data-[state=active]:bg-white/10">
                        <Settings2 className="h-4 w-4" />
                        Şablon Yönetimi
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 6-Month Trend Chart */}
                        <InteractiveCard className="bg-white/[0.02] border-white/5 p-6 h-80 flex flex-col justify-between overflow-hidden">
                            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Finansal Trend (6 Ay)</h4>
                            <div className="flex-1 flex items-end gap-3 px-4 py-8">
                                {chartData.length > 0 ? chartData.map((data, i) => {
                                    const maxIncome = Math.max(...chartData.map(d => d.income), 1000);
                                    const incomeHeight = (data.income / maxIncome) * 100;
                                    const expenseHeight = (data.expense / maxIncome) * 100;

                                    return (
                                        <div key={i} className="flex-1 group relative flex flex-col justify-end h-full">
                                            {/* Tooltip */}
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-[10px] px-2 py-1 rounded whitespace-nowrap z-20">
                                                G: {formatCurrency(data.income)} | Ç: {formatCurrency(data.expense)}
                                            </div>

                                            <div className="flex gap-1 w-full items-end h-full">
                                                <div
                                                    className="flex-1 bg-emerald-500/40 rounded-t-sm transition-all group-hover:bg-emerald-500/60"
                                                    style={{ height: `${incomeHeight}%` }}
                                                />
                                                <div
                                                    className="flex-1 bg-red-500/40 rounded-t-sm transition-all group-hover:bg-red-500/60"
                                                    style={{ height: `${expenseHeight}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="w-full flex items-center justify-center text-zinc-600 text-xs italic">
                                        Yeterli veri yok
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-zinc-600 uppercase">
                                {chartData.map((data, i) => (
                                    <span key={i} className="flex-1 text-center">{data.label}</span>
                                ))}
                            </div>
                        </InteractiveCard>

                        {/* Category Breakdown Placeholder */}
                        <InteractiveCard className="bg-white/[0.02] border-white/5 p-6 h-80">
                            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6">Gider Dağılımı</h4>
                            <div className="space-y-4">
                                {[
                                    { label: "Ekipman", value: 45, color: "bg-amber-500" },
                                    { label: "Abonelikler", value: 25, color: "bg-blue-500" },
                                    { label: "Ofis / Kira", value: 20, color: "bg-emerald-500" },
                                    { label: "Kişisel", value: 10, color: "bg-zinc-500" },
                                ].map((cat) => (
                                    <div key={cat.label} className="space-y-1">
                                        <div className="flex justify-between text-xs font-semibold">
                                            <span>{cat.label}</span>
                                            <span>%{cat.value}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className={cn("h-full rounded-full", cat.color)} style={{ width: `${cat.value}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </InteractiveCard>
                    </div>
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                    <div className="rounded-2xl border border-white/[0.08] bg-black/40 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-zinc-500 uppercase bg-white/[0.02] border-b border-white/[0.05]">
                                <tr>
                                    <th className="px-6 py-4">İşlem</th>
                                    <th className="px-6 py-4">Kategori</th>
                                    <th className="px-6 py-4">Tarih</th>
                                    <th className="px-6 py-4 text-right">Tutar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.05]">
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4 font-medium text-zinc-200">{tx.description}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] font-bold uppercase">
                                                {tx.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500 tabular-nums">
                                            {format(new Date(tx.date), "d MMM yyyy", { locale: tr })}
                                        </td>
                                        <td className={cn(
                                            "px-6 py-4 text-right font-mono font-bold",
                                            tx.type === 'INCOME' ? "text-emerald-500" : "text-red-400"
                                        )}>
                                            {tx.type === 'INCOME' ? "+" : "-"}{formatCurrency(tx.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                <TabsContent value="templates" className="mt-0" id="templates">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Expense Templates Management */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest px-1">Gider Şablonları</h4>
                            <div className="space-y-2">
                                {expenseTemplates.map((t) => (
                                    <div key={t.id} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] group">
                                        <div>
                                            <p className="font-bold text-white">{t.name}</p>
                                            <p className="text-xs text-muted-foreground">{t.category} • {formatCurrency(t.default_amount)}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500/40 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                            onClick={() => handleDeleteTemplate('expense', t.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full border-dashed border-white/10 hover:border-white/20 h-16 rounded-xl gap-2 font-bold text-zinc-500">
                                    <Plus className="h-4 w-4" />
                                    Yeni Gider Şablonu
                                </Button>
                            </div>
                        </div>

                        {/* Income Templates Management */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-emerald-500 uppercase tracking-widest px-1">Gelir Şablonları</h4>
                            <div className="space-y-2">
                                {incomeTemplates.map((t) => (
                                    <div key={t.id} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] group">
                                        <div>
                                            <p className="font-bold text-white">{t.name}</p>
                                            <p className="text-xs text-muted-foreground">Müşteri: {t.customers?.name || 'Genel'} • {formatCurrency(t.default_amount)}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500/40 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                            onClick={() => handleDeleteTemplate('income', t.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full border-dashed border-white/10 hover:border-white/20 h-16 rounded-xl gap-2 font-bold text-zinc-500">
                                    <Plus className="h-4 w-4" />
                                    Yeni Gelir Şablonu
                                </Button>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
