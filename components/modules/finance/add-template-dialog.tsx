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
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/select";
import { addExpenseTemplate, addIncomeTemplate } from "@/app/actions/finance";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

interface AddTemplateDialogProps {
    type: "income" | "expense";
    children?: React.ReactNode;
}

export function AddTemplateDialog({ type, children }: AddTemplateDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);

        try {
            if (type === "expense") {
                await addExpenseTemplate({
                    name: formData.get("name") as string,
                    default_amount: parseFloat(formData.get("amount") as string),
                    category: formData.get("category") as string,
                    is_mandatory: formData.get("is_mandatory") === "true",
                });
                toast.success("Gider şablonu oluşturuldu");
            } else {
                await addIncomeTemplate({
                    name: formData.get("name") as string,
                    default_amount: parseFloat(formData.get("amount") as string),
                    category: formData.get("category") as string,
                });
                toast.success("Gelir şablonu oluşturuldu");
            }
            setOpen(false);
            router.refresh();
        } catch (error) {
            toast.error("Şablon oluşturulamadı");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" className="w-full border-dashed border-white/10 h-16 rounded-xl gap-2 font-bold text-zinc-500">
                        <Plus className="h-4 w-4" />
                        Yeni {type === 'income' ? 'Gelir' : 'Gider'} Şablonu
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] bg-[#0a0a0a] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Yeni {type === 'income' ? 'Gelir' : 'Gider'} Şablonu</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Şablon Adı</label>
                        <Input
                            name="name"
                            required
                            placeholder={type === 'income' ? "Müşteri veya İş Adı" : "Fatura, Abonelik vb."}
                            className="bg-white/5 border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Varsayılan Tutar (₺)</label>
                        <Input
                            name="amount"
                            type="number"
                            step="0.01"
                            required
                            placeholder="0.00"
                            className="bg-white/5 border-white/10 font-bold"
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

                    {type === "expense" && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Tip</label>
                            <Select name="is_mandatory" defaultValue="false">
                                <SelectTrigger className="bg-white/5 border-white/10 h-10">
                                    <SelectValue placeholder="Seçiniz" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0f0f0f] border-white/10 text-white">
                                    <SelectItem value="false">Normal (İsteğe Bağlı)</SelectItem>
                                    <SelectItem value="true">Zorunlu (Fatura vb.)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="pt-4 flex gap-2">
                        <Button type="button" variant="ghost" className="flex-1 text-zinc-500" onClick={() => setOpen(false)}>
                            İptal
                        </Button>
                        <Button type="submit" disabled={loading} className="flex-1 bg-amber-600 hover:bg-amber-700">
                            {loading ? "Oluşturuluyor..." : "Şablonu Oluştur"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
