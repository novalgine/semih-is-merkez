"use client";

import { Trash2, Edit2 } from "lucide-react";
import { deleteShoot } from "@/app/actions/shoots";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ShootActionsProps {
    shootId: string;
}

export function ShootActions({ shootId }: ShootActionsProps) {
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
            toast.error("Bir hata oluştu");
        }
    }

    return (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link href={`/shoots/${shootId}`}>
                <div className="p-2 hover:bg-white/5 rounded-md transition-colors cursor-pointer group/edit">
                    <Edit2 className="h-4 w-4 text-zinc-500 group-hover/edit:text-amber-400" />
                </div>
            </Link>

            <button
                onClick={handleDelete}
                className="p-2 hover:bg-red-500/10 rounded-md transition-colors group/delete"
                title="Çekimi Sil"
            >
                <Trash2 className="h-4 w-4 text-zinc-500 group-hover/delete:text-red-500" />
            </button>
        </div>
    );
}
