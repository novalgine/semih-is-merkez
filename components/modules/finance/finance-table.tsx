"use client";

import { useState, useOptimistic } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Trash2, Check, X, TrendingUp, TrendingDown, Wallet, Loader2 } from "lucide-react";
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
    const [search, setSearch] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Local state for instant updates
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
        if (search && !t.description.toLowerCase().includes(search.toLowerCase()) && !t.category.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const handleAdd = async () => {
        if (!newRow.amount || !newRow.category || !newRow.description) {
            toast.error("Tüm alanları doldurun");
            return;
        }

        // Create temp ID for optimistic update
        const tempId = `temp-${Date.now()}`;
        const newTransaction: Transaction = {
            id: tempId,
            type: newRow.type,
            amount: parseFloat(newRow.amount),
            date: newRow.date,
            category: newRow.category,
            description: newRow.description
        };

        // INSTANT: Add to local state immediately
        setLocalTransactions(prev => [newTransaction, ...prev]);

        // Reset form immediately
        setNewRow({
            type: 'expense',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            category: '',
            description: ''
        });
        setIsAdding(false);

        // Show instant feedback
        toast.success(newRow.type === 'income' ? "✓ Gelir eklendi" : "✓ Gider eklendi");

        // Background: Save to database
        try {
            const result = await addTransaction({
                type: newTransaction.type,
                amount: newTransaction.amount,
                date: newTransaction.date,
                category: newTransaction.category,
                description: newTransaction.description
            });

            if (!result.success) {
                // Rollback on error
                setLocalTransactions(prev => prev.filter(t => t.id !== tempId));
                toast.error("Kayıt başarısız: " + (result.error || "Bilinmeyen hata"));
            } else {
                // Refresh to get real ID
                router.refresh();
            }
        } catch (err) {
            // Rollback on error
            setLocalTransactions(prev => prev.filter(t => t.id !== tempId));
            toast.error("Bağlantı hatası");
        }
    };

    const handleDelete = async (id: string, type: 'income' | 'expense') => {
        // INSTANT: Remove from local state
        const deletedTx = localTransactions.find(t => t.id === id);
        setLocalTransactions(prev => prev.filter(t => t.id !== id));
        toast.success("✓ Silindi");

        // Background: Delete from database
        try {
            const result = await deleteTransaction(id, type);
            if (!result.success && deletedTx) {
                // Rollback
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
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/[0.08] rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center">
                            <Wallet className="h-4 w-4 text-white/60" />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Net Varlık</span>
                    </div>
                    <p className={cn(
                        "text-2xl font-bold tabular-nums",
                        netWealth >= 0 ? "text-white" : "text-red-400"
                    )}>{formatCurrency(netWealth)}</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-950/50 to-zinc-950 border border-emerald-500/10 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Toplam Gelir</span>
                    </div>
                    <p className="text-2xl font-bold tabular-nums text-emerald-400">{formatCurrency(totalIncome)}</p>
                </div>

                <div className="bg-gradient-to-br from-red-950/50 to-zinc-950 border border-red-500/10 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Toplam Gider</span>
                    </div>
                    <p className="text-2xl font-bold tabular-nums text-red-400">{formatCurrency(totalExpense)}</p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex items-center gap-3">
                <div className="flex bg-white/[0.03] border border-white/[0.08] rounded-xl p-1">
                    {(['all', 'income', 'expense'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                                filter === f
                                    ? "bg-white/10 text-white"
                                    : "text-zinc-500 hover:text-white"
                            )}
                        >
                            {f === 'all' ? 'Tümü' : f === 'income' ? 'Gelir' : 'Gider'}
                        </button>
                    ))}
                </div>

                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Ara..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-white/[0.03] border-white/[0.08] h-10"
                    />
                </div>

                <Button
                    onClick={() => setIsAdding(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white h-10 px-4 gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Yeni
                </Button>
            </div>

            {/* Table */}
            <div className="bg-zinc-900/50 border border-white/[0.08] rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/[0.05]">
                            <th className="text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-4 py-3">Tarih</th>
                            <th className="text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-4 py-3">Açıklama</th>
                            <th className="text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-4 py-3">Kategori</th>
                            <th className="text-right text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-4 py-3">Tutar</th>
                            <th className="w-10"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {/* New Row Input */}
                            {isAdding && (
                                <motion.tr
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="border-b border-amber-500/20 bg-amber-500/5"
                                >
                                    <td className="px-4 py-2">
                                        <Input
                                            type="date"
                                            value={newRow.date}
                                            onChange={(e) => setNewRow({ ...newRow, date: e.target.value })}
                                            className="bg-transparent border-white/10 h-8 text-sm w-32"
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <Input
                                            placeholder="Açıklama..."
                                            value={newRow.description}
                                            onChange={(e) => setNewRow({ ...newRow, description: e.target.value })}
                                            className="bg-transparent border-white/10 h-8 text-sm"
                                            autoFocus
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex gap-2">
                                            <select
                                                value={newRow.type}
                                                onChange={(e) => setNewRow({ ...newRow, type: e.target.value as any, category: '' })}
                                                className="bg-zinc-800 border border-white/10 rounded-md h-8 text-xs px-2"
                                            >
                                                <option value="expense">Gider</option>
                                                <option value="income">Gelir</option>
                                            </select>
                                            <select
                                                value={newRow.category}
                                                onChange={(e) => setNewRow({ ...newRow, category: e.target.value })}
                                                className="bg-zinc-800 border border-white/10 rounded-md h-8 text-xs px-2 flex-1"
                                            >
                                                <option value="">Kategori...</option>
                                                {CATEGORIES[newRow.type].map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={newRow.amount}
                                            onChange={(e) => setNewRow({ ...newRow, amount: e.target.value })}
                                            className="bg-transparent border-white/10 h-8 text-sm text-right w-24 ml-auto"
                                        />
                                    </td>
                                    <td className="px-2 py-2">
                                        <div className="flex gap-1">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 text-emerald-500 hover:bg-emerald-500/10"
                                                onClick={handleAdd}
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 text-zinc-500 hover:bg-zinc-500/10"
                                                onClick={() => setIsAdding(false)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </motion.tr>
                            )}

                            {/* Data Rows */}
                            {filteredTransactions.map((tx, i) => (
                                <motion.tr
                                    key={tx.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className={cn(
                                        "border-b border-white/[0.03] hover:bg-white/[0.02] group transition-colors",
                                        tx.id.startsWith('temp-') && "opacity-70"
                                    )}
                                >
                                    <td className="px-4 py-3 text-sm text-zinc-400 tabular-nums">
                                        {format(new Date(tx.date), 'd MMM', { locale: tr })}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-white font-medium">
                                        {tx.description}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={cn(
                                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                            CATEGORY_COLORS[tx.category] || CATEGORY_COLORS['Diğer']
                                        )}>
                                            {tx.category}
                                        </span>
                                    </td>
                                    <td className={cn(
                                        "px-4 py-3 text-sm font-bold tabular-nums text-right",
                                        tx.type === 'income' ? "text-emerald-400" : "text-red-400"
                                    )}>
                                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                    </td>
                                    <td className="px-2 py-3">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleDelete(tx.id, tx.type)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>

                        {filteredTransactions.length === 0 && !isAdding && (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-zinc-600 italic">
                                    {search ? 'Sonuç bulunamadı' : 'Henüz işlem yok'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Quick Add Row */}
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full px-4 py-3 text-left text-sm text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.02] transition-colors flex items-center gap-2 border-t border-white/[0.03]"
                    >
                        <Plus className="h-4 w-4" />
                        Yeni satır ekle...
                    </button>
                )}
            </div>
        </div>
    );
}
