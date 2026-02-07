"use client";

import { useState } from "react";
import { Plus, Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    createExpense,
    addIncome,
    deleteTemplate
} from "@/app/actions/finance";
import { useRouter } from "next/navigation";

interface Template {
    id: string;
    name: string;
    default_amount: number;
    category: string;
    is_mandatory?: boolean;
}

interface QuickActionTemplatesProps {
    expenseTemplates: Template[];
    incomeTemplates: Template[];
}

export function QuickActionTemplates({ expenseTemplates, incomeTemplates }: QuickActionTemplatesProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const router = useRouter();

    const handleAction = async (template: Template, type: 'income' | 'expense') => {
        setLoadingId(template.id);
        try {
            const today = new Date().toISOString().split('T')[0];

            if (type === 'expense') {
                const result = await createExpense({
                    description: template.name,
                    amount: template.default_amount,
                    category: template.category,
                    date: today
                });
                if (!result.success) throw new Error(result.error || 'Gider eklenemedi');
                toast.success(`${template.name} gideri eklendi.`);
            } else {
                const result = await addIncome({
                    description: template.name,
                    amount: template.default_amount,
                    category: template.category,
                    date: today
                });
                if (!result.success) throw new Error(result.error || 'Gelir eklenemedi');
                toast.success(`${template.name} geliri eklendi.`);
            }
            router.refresh();
        } catch {
            toast.error("İşlem başarısız.");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Hızlı İşlemler</h3>
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-2" asChild>
                    <a href="#templates">
                        <Settings2 className="h-3 w-3" />
                        Şablonları Yönet
                    </a>
                </Button>
            </div>

            <div className="flex flex-wrap gap-2">
                {/* Income Templates */}
                {incomeTemplates.map((template) => (
                    <Button
                        key={template.id}
                        variant="outline"
                        size="sm"
                        disabled={loadingId === template.id}
                        onClick={() => handleAction(template, 'income')}
                        className="bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 text-emerald-500 rounded-full py-1 h-auto"
                    >
                        {loadingId === template.id ? "..." : `+ ${template.name}`}
                    </Button>
                ))}

                {/* Expense Templates */}
                {expenseTemplates.map((template) => (
                    <Button
                        key={template.id}
                        variant="outline"
                        size="sm"
                        disabled={loadingId === template.id}
                        onClick={() => handleAction(template, 'expense')}
                        className="bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/20 text-amber-500 rounded-full py-1 h-auto"
                    >
                        {loadingId === template.id ? "..." : `- ${template.name}`}
                    </Button>
                ))}

                {expenseTemplates.length === 0 && incomeTemplates.length === 0 && (
                    <p className="text-xs text-zinc-500 italic">Henüz şablon eklenmemiş.</p>
                )}
            </div>
        </div>
    );
}
