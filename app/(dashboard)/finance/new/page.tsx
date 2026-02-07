"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InteractiveCard } from "@/components/ui/interactive-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createExpense } from "@/app/actions/finance";
import { toast } from "sonner";

export default function NewExpensePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);

        try {
            const result = await createExpense({
                amount: parseFloat(formData.get("amount") as string),
                category: formData.get("category") as string,
                description: formData.get("description") as string,
                date: formData.get("date") as string,
            });

            if (!result.success) throw new Error(result.error || 'İşlem eklenemedi');

            toast.success("İşlem başarıyla eklendi");
            router.push("/finance");
        } catch {
            toast.error("Hata oluştu");
            setLoading(false);
        }
    }

    return (
        <div className="max-w-md mx-auto py-12">
            <InteractiveCard className="bg-zinc-900/50 border-zinc-800 p-8 rounded-2xl">
                <h1 className="text-2xl font-bold mb-6">Yeni Gider</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">
                            Tutar (₺)
                        </label>
                        <Input
                            type="number"
                            name="amount"
                            step="0.01"
                            required
                            placeholder="0.00"
                            className="text-2xl font-bold tabular-nums"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">
                            Kategori
                        </label>
                        <Select name="category" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Ekipman">Ekipman</SelectItem>
                                <SelectItem value="Ofis">Ofis</SelectItem>
                                <SelectItem value="Yemek">Yemek</SelectItem>
                                <SelectItem value="Ulaşım">Ulaşım</SelectItem>
                                <SelectItem value="Yazılım">Yazılım</SelectItem>
                                <SelectItem value="Diğer">Diğer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">
                            Tarih
                        </label>
                        <Input
                            type="date"
                            name="date"
                            required
                            defaultValue={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">
                            Açıklama
                        </label>
                        <Textarea
                            name="description"
                            placeholder="Gider detayı..."
                            rows={3}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="flex-1"
                        >
                            İptal
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1"
                        >
                            {loading ? "Kaydediliyor..." : "Kaydet"}
                        </Button>
                    </div>
                </form>
            </InteractiveCard>
        </div>
    );
}
