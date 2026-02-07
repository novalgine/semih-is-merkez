"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addIncome, createExpense } from "@/app/actions/finance";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";

export function AddTransactionDialog({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<"income" | "expense">("expense");
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            amount: parseFloat(formData.get("amount") as string),
            category: formData.get("category") as string,
            description: formData.get("description") as string,
            date: formData.get("date") as string,
        };

        try {
            if (type === "expense") {
                const result = await createExpense(data);
                if (!result.success) throw new Error(result.error || 'Gider kaydedilemedi');
                toast.success("Gider kaydedildi");
            } else {
                const result = await addIncome(data);
                if (!result.success) throw new Error(result.error || 'Gelir kaydedilemedi');
                toast.success("Gelir kaydedildi");
            }
            setOpen(false);
            router.refresh();
        } catch {
            toast.error("İşlem sırasında hata oluştu");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
                        <Plus className="h-4 w-4" />
                        Yeni Veri
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#0a0a0a] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Yeni İşlem Ekle</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="expense" className="w-full" onValueChange={(v) => setType(v as "income" | "expense")}>
                    <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 p-1 mb-6">
                        <TabsTrigger value="expense" className="gap-2 data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
                            <ArrowDownRight className="h-4 w-4" />
                            Gider
                        </TabsTrigger>
                        <TabsTrigger value="income" className="gap-2 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                            <ArrowUpRight className="h-4 w-4" />
                            Gelir
                        </TabsTrigger>
                    </TabsList>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Tutar (₺)</label>
                            <Input
                                name="amount"
                                type="number"
                                step="0.01"
                                required
                                placeholder="0.00"
                                className="bg-white/5 border-white/10 text-xl font-bold h-12 tabular-nums focus:border-amber-500/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Kategori</label>
                            <Select name="category" required>
                                <SelectTrigger className="bg-white/5 border-white/10 h-10">
                                    <SelectValue placeholder="Seçiniz" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0f0f0f] border-white/10 text-white">
                                    {type === "expense" ? (
                                        <>
                                            <SelectItem value="Sigara">Sigara</SelectItem>
                                            <SelectItem value="Yemek">Yemek</SelectItem>
                                            <SelectItem value="Ulaşım">Ulaşım</SelectItem>
                                            <SelectItem value="Abonelik">Abonelik</SelectItem>
                                            <SelectItem value="Fatura">Fatura</SelectItem>
                                            <SelectItem value="Ekipman">Ekipman</SelectItem>
                                            <SelectItem value="Diğer">Diğer</SelectItem>
                                        </>
                                    ) : (
                                        <>
                                            <SelectItem value="Proje Geliri">Proje Geliri</SelectItem>
                                            <SelectItem value="Danışmanlık">Danışmanlık</SelectItem>
                                            <SelectItem value="Kurgu">Kurgu</SelectItem>
                                            <SelectItem value="Nakit İş">Nakit İş</SelectItem>
                                            <SelectItem value="Diğer">Diğer</SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Tarih</label>
                            <Input
                                name="date"
                                type="date"
                                required
                                defaultValue={new Date().toISOString().split('T')[0]}
                                className="bg-white/5 border-white/10 h-10"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Açıklama</label>
                            <Textarea
                                name="description"
                                placeholder="Detay yazın..."
                                className="bg-white/5 border-white/10 resize-none min-h-[80px]"
                            />
                        </div>

                        <div className="pt-4 flex gap-2">
                            <Button type="button" variant="ghost" className="flex-1 text-zinc-500 hover:text-white" onClick={() => setOpen(false)}>
                                İptal
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className={type === 'expense' ? "flex-1 bg-red-600 hover:bg-red-700" : "flex-1 bg-emerald-600 hover:bg-emerald-700"}
                            >
                                {loading ? "Kaydediliyor..." : "Kaydet"}
                            </Button>
                        </div>
                    </form>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
