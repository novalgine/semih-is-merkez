'use client'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteBundle } from "@/app/actions/bundles"
import { useToast } from "@/hooks/use-toast"

export function DeleteBundleButton({ id, name }: { id: string, name: string }) {
    const { toast } = useToast()

    const handleDelete = async () => {
        const result = await deleteBundle(id)
        if (result.success) {
            toast({ title: "Başarılı", description: "Paket silindi." })
        } else {
            toast({ title: "Hata", description: result.error, variant: "destructive" })
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Paketi Sil</AlertDialogTitle>
                    <AlertDialogDescription>
                        <b>{name}</b> adlı paketi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Sil
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
