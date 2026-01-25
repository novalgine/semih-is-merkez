"use client"

import { useState } from "react"
import { CheckCircle2, Clock, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { markProposalAsPaid, markProposalAsPending } from "@/app/actions/proposals"
import { useToast } from "@/hooks/use-toast"

interface PaymentStatusBadgeProps {
    proposalId: string
    paymentStatus: 'Pending' | 'Paid' | null
    paidAt?: string | null
    showActions?: boolean
}

export function PaymentStatusBadge({
    proposalId,
    paymentStatus,
    paidAt,
    showActions = true
}: PaymentStatusBadgeProps) {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const handleMarkAsPaid = async () => {
        setLoading(true)
        try {
            const result = await markProposalAsPaid(proposalId)
            if (result.success) {
                toast({
                    title: "Ödeme Kaydedildi",
                    description: "Teklif ödendi olarak işaretlendi.",
                })
            } else {
                toast({
                    title: "Hata",
                    description: result.error,
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Hata",
                description: "Bir sorun oluştu.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleMarkAsPending = async () => {
        setLoading(true)
        try {
            const result = await markProposalAsPending(proposalId)
            if (result.success) {
                toast({
                    title: "Güncellendi",
                    description: "Ödeme durumu bekliyor olarak işaretlendi.",
                })
            } else {
                toast({
                    title: "Hata",
                    description: result.error,
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Hata",
                description: "Bir sorun oluştu.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const isPaid = paymentStatus === 'Paid'

    if (!showActions) {
        // Simple badge without actions
        return (
            <Badge
                variant={isPaid ? "default" : "secondary"}
                className={isPaid ? "bg-green-500/10 text-green-600 dark:text-green-400" : ""}
            >
                {isPaid ? (
                    <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Ödendi
                    </>
                ) : (
                    <>
                        <Clock className="h-3 w-3 mr-1" />
                        Bekliyor
                    </>
                )}
            </Badge>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1"
                    disabled={loading}
                >
                    {loading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : isPaid ? (
                        <>
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            <span className="text-green-600">Ödendi</span>
                        </>
                    ) : (
                        <>
                            <Clock className="h-3 w-3 text-orange-600" />
                            <span className="text-orange-600">Bekliyor</span>
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {!isPaid ? (
                    <DropdownMenuItem onClick={handleMarkAsPaid}>
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                        Ödeme Alındı İşaretle
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem onClick={handleMarkAsPending}>
                        <Clock className="h-4 w-4 mr-2 text-orange-600" />
                        Bekliyor Olarak İşaretle
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
