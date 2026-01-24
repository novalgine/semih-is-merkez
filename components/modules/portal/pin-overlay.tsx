"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { verifyPortalPin } from "@/app/actions/portal-public"
import { useToast } from "@/hooks/use-toast"

interface PinOverlayProps {
    token: string
    onSuccess: (validPin: string) => void
}

export function PinOverlay({ token, onSuccess }: PinOverlayProps) {
    const [pin, setPin] = useState("")
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const isValid = await verifyPortalPin(token, pin)
            if (isValid) {
                onSuccess(pin)
            } else {
                toast({
                    title: "Hatalı PIN",
                    description: "Lütfen tekrar deneyiniz.",
                    variant: "destructive"
                })
                setPin("")
            }
        } catch (error) {
            toast({
                title: "Hata",
                description: "Bir sorun oluştu.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-muted h-12 w-12 rounded-full flex items-center justify-center mb-4">
                        <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Güvenli Erişim</CardTitle>
                    <CardDescription>
                        Finansal verileri görüntülemek için lütfen 4 haneli PIN kodunuzu giriniz.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex justify-center">
                            <Input
                                type="password"
                                maxLength={4}
                                className="text-center text-2xl tracking-[1em] font-mono h-14 w-48"
                                placeholder="••••"
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                                autoFocus
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading || pin.length !== 4}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Giriş Yap
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
