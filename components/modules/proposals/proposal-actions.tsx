'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Copy, Video, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { duplicateProposal, convertProposalToShoot } from "@/app/actions/proposals"
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

interface ProposalActionsProps {
    id: string
    status: string
}

export function ProposalActions({ id, status }: ProposalActionsProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    const handleDuplicate = async () => {
        setLoading(true)
        try {
            const result = await duplicateProposal(id)
            if (result.success) {
                toast({ title: "Başarılı", description: "Teklif kopyalandı." })
                if (result.data?.id) router.push(`/proposals/${result.data.id}`)
            } else {
                toast({ title: "Hata", description: result.error || "Bir hata oluştu.", variant: "destructive" })
            }
        } catch (error) {
            console.error(error)
            toast({ title: "Hata", description: "Beklenmedik bir hata oluştu.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleConvertToShoot = async () => {
        setLoading(true)
        try {
            const result = await convertProposalToShoot(id)
            if (result.success) {
                toast({ title: "Başarılı", description: "Çekim oluşturuldu." })
                if (result.data?.id) router.push(`/shoots/${result.data.id}`)
            } else {
                toast({ title: "Hata", description: result.error || "Bir hata oluştu.", variant: "destructive" })
            }
        } catch (error) {
            console.error(error)
            toast({ title: "Hata", description: "Beklenmedik bir hata oluştu.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4" />}
                Kopyala
            </Button>

            {status === 'Approved' && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="default" size="sm" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Video className="mr-2 h-4 w-4" />}
                            Çekim Oluştur
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Çekim Oluştur</AlertDialogTitle>
                            <AlertDialogDescription>
                                Bu tekliften otomatik olarak yeni bir çekim kaydı oluşturulacak. Onaylıyor musunuz?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConvertToShoot}>Oluştur</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    )
}
