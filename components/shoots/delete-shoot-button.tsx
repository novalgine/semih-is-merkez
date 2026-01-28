"use client";

import { Trash2 } from "lucide-react";
import { deleteShoot } from "@/app/actions/shoots";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DeleteShootButton({ shootId }: { shootId: string }) {
    const router = useRouter();

    async function handleDelete() {
        if (!confirm("Bu çekimi silmek istediğinize emin misiniz?")) return;

        try {
            const result = await deleteShoot(shootId);
            if (result.success) {
                toast.success("Çekim silindi");
                router.refresh();
            } else {
                toast.error(result.error || "Silme başarısız");
            }
        } catch (error) {
            toast.error("Silme başarısız");
        }
    }

    return (
        <button
            onClick={handleDelete}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors group/delete"
            title="Çekimi Sil"
        >
            <Trash2 className="h-4 w-4 text-zinc-600 group-hover/delete:text-red-500 transition-colors" />
        </button>
    );
}
