"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Check, X, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { addTransaction, deleteTransaction } from "@/app/actions/finance-simple";

interface Transaction {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    date: string;
    category: string;
    description: string;
}

interface FinanceTableProps {
    transactions: Transaction[];
    netWealth: number;
    totalIncome: number;
    totalExpense: number;
}

const CATEGORIES = {
    income: ['Proje', 'Danışmanlık', 'Kurgu', 'Nakit İş', 'Diğer'],
    expense: ['Sigara', 'Yemek', 'Ulaşım', 'Abonelik', 'Fatura', 'Ekipman', 'Kişisel', 'Diğer']
};

const CATEGORY_COLORS: Record<string, string> = {
    'Proje': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Danışmanlık': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Kurgu': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Nakit İş': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Sigara': 'bg-red-500/20 text-red-400 border-red-500/30',
    'Yemek': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Ulaşım': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Abonelik': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    'Fatura': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Ekipman': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    'Kişisel': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    'Diğer': 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
};

export function FinanceTable({
    transactions: initialTransactions,
    netWealth,
    totalIncome,
    totalExpense
}: FinanceTableProps) {
    const router = useRouter();
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [isAdding, setIsAdding] = useState(false);
    const [localTransactions, setLocalTransactions] = useState(initialTransactions);

    const [newRow, setNewRow] = useState({
        type: 'expense' as 'income' | 'expense',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        description: ''
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const filteredTransactions = localTransactions.filter(t => {
        if (filter !== 'all' && t.type !== filter) return false;
        return true;
    });

    const handleAdd = async () => {
        if (!newRow.amount || parseFloat(newRow.amount) <= 0) {
            toast.error("Tutar girin");
            return;
        }
        if (!newRow.category) {
            toast.error("Kategori seçin");
            return;
        }
        if (!newRow.description || newRow.description.trim() === '') {
            toast.error("Açıklama girin");
            return;
        }

        const tempId = `temp-${Date.now()}`;
        const newTransaction: Transaction = {
            id: tempId,
            type: newRow.type,
            amount: parseFloat(newRow.amount),
            date: newRow.date,
            category: newRow.category,
            description: newRow.description
        };

        setLocalTransactions(prev => [newTransaction, ...prev]);
        setNewRow({
            type: 'expense',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            category: '',
            description: ''
        });
        setIsAdding(false);
        toast.success(newRow.type === 'income' ? "✓ Gelir eklendi" : "✓ Gider eklendi");

        try {
            const result = await addTransaction({
                type: newTransaction.type,
                amount: newTransaction.amount,
                date: newTransaction.date,
                category: newTransaction.category,
                description: newTransaction.description
            });

            if (!result.success) {
                setLocalTransactions(prev => prev.filter(t => t.id !== tempId));
                console.error('Transaction failed:', result.error);
                toast.error("Kayıt başarısız: " + (result.error || "Bilinmeyen hata"), { duration: 5000 });
            } else {
                router.refresh();
            }
        } catch (err) {
            setLocalTransactions(prev => prev.filter(t => t.id !== tempId));
            toast.error("Bağlantı hatası");
        }
    };

    const handleDelete = async (id: string, type: 'income' | 'expense') => {
        if (id.startsWith('temp-')) {
            setLocalTransactions(prev => prev.filter(t => t.id !== id));
            toast.success("✓ Silindi");
            return;
        }

        const deletedTx = localTransactions.find(t => t.id === id);
        setLocalTransactions(prev => prev.filter(t => t.id !== id));
        toast.success("✓ Silindi");

        try {
            const result = await deleteTransaction(id, type);
            if (!result.success && deletedTx) {
                setLocalTransactions(prev => [...prev, deletedTx]);
                toast.error("Silme başarısız");
            } else {
                router.refresh();
            }
        } catch {
            if (deletedTx) {
                setLocalTransactions(prev => [...prev, deletedTx]);
                toast.error("Bağlantı hatası");
            }
        }
    };

    return (
        <div className="space-y-4">
            {/* Stats - Mobile: Stacked, Desktop: Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/[0.08] rounded-xl p-4">
                    <div className="flex items-center justify-between sm:flex-col sm:items-start sm:gap-2">
                        <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-white/40" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">Net</span>
                        </div>
                        <p className={cn(
                            "text-xl sm:text-2xl font-bold tabular-nums",
                            netWealth >= 0 ? "text-white" : "text-red-400"
                        )}>{formatCurrency(netWealth)}</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-950/50 to-zinc-950 border border-emerald-500/10 rounded-xl p-4">
                    <div className="flex items-center justify-between sm:flex-col sm:items-start sm:gap-2">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">Gelir</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold tabular-nums text-emerald-400">{formatCurrency(totalIncome)}</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-red-950/50 to-zinc-950 border border-red-500/10 rounded-xl p-4">
                    <div className="flex items-center justify-between sm:flex-col sm:items-start sm:gap-2">
                        <div className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-red-500" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">Gider</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold tabular-nums text-red-400">{formatCurrency(totalExpense)}</p>
                    </div>
                </div>
            </div>

            {/* Filters + Add Button */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex bg-white/[0.03] border border-white/[0.08] rounded-lg p-0.5">
                    {(['all', 'income', 'expense'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all",
                                filter === f
                                    ? "bg-white/10 text-white"
                                    : "text-zinc-500"
                            )}
                        >
                            {f === 'all' ? 'Tümü' : f === 'income' ? 'Gelir' : 'Gider'}
                        </button>
                    ))}
                </div>

                <Button
                    onClick={() => setIsAdding(true)}
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white gap-1 h-8"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Yeni</span>
                </Button>
            </div>

            {/* Add Form - Mobile Friendly */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-3"
                    >
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">Tip</label>
                                <select
                                    value={newRow.type}
                                    onChange={(e) => setNewRow({ ...newRow, type: e.target.value as any, category: '' })}
                                    className="w-full bg-zinc-800 border border-white/10 rounded-lg h-10 text-sm px-3"
                                >
                                    <option value="expense">Gider</option>
                                    <option value="income">Gelir</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">Kategori</label>
                                <select
                                    value={newRow.category}
                                    onChange={(e) => setNewRow({ ...newRow, category: e.target.value })}
                                    className="w-full bg-zinc-800 border border-white/10 rounded-lg h-10 text-sm px-3"
                                >
                                    <option value="">Seçin...</option>
                                    {CATEGORIES[newRow.type].map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">Açıklama</label>
                            <Input
                                placeholder="Ne için?"
                                value={newRow.description}
                                onChange={(e) => setNewRow({ ...newRow, description: e.target.value })}
                                className="bg-zinc-800 border-white/10 h-10"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">Tarih</label>
                                <Input
                                    type="date"
                                    value={newRow.date}
                                    onChange={(e) => setNewRow({ ...newRow, date: e.target.value })}
                                    className="bg-zinc-800 border-white/10 h-10"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">Tutar (₺)</label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={newRow.amount}
                                    onChange={(e) => setNewRow({ ...newRow, amount: e.target.value })}
                                    className="bg-zinc-800 border-white/10 h-10 text-right font-bold"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button
                                variant="ghost"
                                className="flex-1 text-zinc-500"
                                onClick={() => setIsAdding(false)}
                            >
                                İptal
                            </Button>
                            <Button
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                onClick={handleAdd}
                            >
                                <Check className="h-4 w-4 mr-1" />
                                Kaydet
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Transaction List - Card Style for Mobile */}
            <div className="space-y-2">
                <AnimatePresence>
                    {filteredTransactions.map((tx) => (
                        <motion.div
                            key={tx.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            className={cn(
                                "bg-zinc-900/50 border border-white/[0.05] rounded-xl p-3 flex items-center gap-3",
                                tx.id.startsWith('temp-') && "opacity-60"
                            )}
                        >
                            {/* Left: Date & Description */}
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{tx.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-zinc-500">
                                        {format(new Date(tx.date), 'd MMM', { locale: tr })}
                                    </span>
                                    <span className={cn(
                                        "text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase border",
                                        CATEGORY_COLORS[tx.category] || CATEGORY_COLORS['Diğer']
                                    )}>
                                        {tx.category}
                                    </span>
                                </div>
                            </div>

                            {/* Right: Amount & Delete */}
                            <div className="flex items-center gap-2">
                                <p className={cn(
                                    "text-base font-bold tabular-nums whitespace-nowrap",
                                    tx.type === 'income' ? "text-emerald-400" : "text-red-400"
                                )}>
                                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                </p>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 shrink-0"
                                    onClick={() => handleDelete(tx.id, tx.type)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredTransactions.length === 0 && !isAdding && (
                    <div className="text-center py-12 text-zinc-600 italic">
                        Henüz işlem yok
                    </div>
                )}
            </div>

            {/* Quick Add Button */}
            {!isAdding && (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full py-3 text-sm text-zinc-600 hover:text-zinc-400 transition-colors flex items-center justify-center gap-2 border border-dashed border-white/10 rounded-xl"
                >
                    <Plus className="h-4 w-4" />
                    Yeni işlem ekle
                </button>
            )}
        </div>
    );
}
