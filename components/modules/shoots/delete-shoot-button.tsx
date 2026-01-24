"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteShoot } from "@/app/actions/shoots"
import { useToast } from "@/hooks/use-toast"
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

export function DeleteShootButton({ id }: { id: string }) {
    const { toast } = useToast()

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault() // Link'e tıklamayı engelle
        e.stopPropagation()

        try {
            const result = await deleteShoot(id)
            if (result.success) {
                toast({ title: "Silindi", description: "Çekim başarıyla silindi." })
            } else {
                toast({ title: "Hata", description: "Silinirken bir sorun oluştu.", variant: "destructive" })
            }
        } catch (error) {
            toast({ title: "Hata", description: "Bir sorun oluştu.", variant: "destructive" })
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive absolute top-2 right-2 z-10"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bu işlem geri alınamaz. Bu çekim ve ilgili tüm veriler silinecektir.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={(e) => e.stopPropagation()}>İptal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Sil
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
