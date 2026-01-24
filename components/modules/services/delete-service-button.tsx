'use client'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteService } from "@/app/actions/services"
import { useToast } from "@/hooks/use-toast"

export function DeleteServiceButton({ id, name }: { id: string, name: string }) {
    const { toast } = useToast()

    const handleDelete = async () => {
        const result = await deleteService(id)
        if (result.success) {
            toast({ title: "Hizmet Silindi", description: "Hizmet başarıyla silindi." })
        } else {
            toast({ title: "Hata", description: "Hizmet silinemedi.", variant: "destructive" })
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
                    <AlertDialogTitle>Hizmeti Sil</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bu işlem geri alınamaz. <b>{name}</b> adlı hizmeti silmek istediğinize emin misiniz?
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
