'use client'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteProposal } from "@/app/actions/proposals"
import { useToast } from "@/hooks/use-toast"

export function DeleteProposalButton({ id, title }: { id: string, title: string }) {
    const { toast } = useToast()

    const handleDelete = async () => {
        const result = await deleteProposal(id)
        if (result.success) {
            toast({ title: "Teklif Silindi", description: "Teklif başarıyla silindi." })
        } else {
            toast({ title: "Hata", description: "Teklif silinemedi.", variant: "destructive" })
        }
    }

    return (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Teklifi Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu işlem geri alınamaz. <b>{title}</b> başlıklı teklifi silmek istediğinize emin misiniz?
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
        </div>
    )
}
