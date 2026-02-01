"use client"

import { useState, useEffect } from "react"
import { Copy, RefreshCw, Check, Link as LinkIcon, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { generatePortalToken, updatePortalPin } from "@/app/actions/portal-admin"
import { useToast } from "@/hooks/use-toast"

interface PortalManagerProps {
    customerId: string
    currentToken: string | null
    currentPin: string | null
}

export function PortalManager({ customerId, currentToken, currentPin }: PortalManagerProps) {
    const [token, setToken] = useState<string | null>(currentToken)
    const [pin, setPin] = useState<string>(currentPin || "")
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [portalUrl, setPortalUrl] = useState<string>("")
    const { toast } = useToast()

    // Update portal URL when token changes (client-side only)
    useEffect(() => {
        if (token && typeof window !== 'undefined') {
            setPortalUrl(`${window.location.origin}/portal/${token}`)
        } else {
            setPortalUrl("")
        }
    }, [token])

    const handleGenerateToken = async () => {
        if (!confirm("Yeni bir token oluşturmak eski linki geçersiz kılacaktır. Devam edilsin mi?")) return

        setLoading(true)
        try {
            const result = await generatePortalToken(customerId)
            if (result.success && result.token) {
                setToken(result.token)
                toast({ title: "Başarılı", description: "Yeni portal linki oluşturuldu." })
            } else {
                toast({ title: "Hata", description: result.error as string, variant: "destructive" })
            }
        } catch (error) {
            toast({ title: "Hata", description: "Bir sorun oluştu.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleUpdatePin = async () => {
        if (pin.length !== 4) {
            toast({ title: "Hata", description: "PIN 4 haneli olmalıdır.", variant: "destructive" })
            return
        }

        setLoading(true)
        try {
            const result = await updatePortalPin(customerId, pin)
            if (result.success) {
                toast({ title: "Başarılı", description: "PIN güncellendi." })
            } else {
                toast({ title: "Hata", description: result.error as string, variant: "destructive" })
            }
        } catch (error) {
            toast({ title: "Hata", description: "Bir sorun oluştu.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = () => {
        if (!portalUrl) return
        navigator.clipboard.writeText(portalUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast({ title: "Kopyalandı", description: "Link panoya kopyalandı." })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-primary" />
                    Müşteri Portalı Yönetimi
                </CardTitle>
                <CardDescription>
                    Müşterinin erişebileceği özel portal ayarları.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Token / Link Section */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Portal Linki</label>
                    <div className="flex gap-2">
                        <Input
                            value={portalUrl || "Henüz link oluşturulmadı"}
                            readOnly
                            className="bg-muted font-mono text-xs"
                        />
                        <Button variant="outline" size="icon" onClick={copyToClipboard} disabled={!token}>
                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleGenerateToken} disabled={loading} title="Yenile">
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                        Bu linki müşteriye göndererek portala erişmesini sağlayabilirsiniz.
                    </p>
                </div>

                {/* PIN Section */}
                <div className="space-y-2 pt-4 border-t">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Lock className="h-3 w-3" /> Güvenlik PIN'i
                    </label>
                    <div className="flex gap-2">
                        <Input
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                            placeholder="4 haneli PIN"
                            className="font-mono tracking-widest max-w-[120px]"
                        />
                        <Button variant="secondary" onClick={handleUpdatePin} disabled={loading || pin.length !== 4}>
                            Güncelle
                        </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                        Finansal verilere erişim için müşteriye bu PIN kodunu iletmelisiniz.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
