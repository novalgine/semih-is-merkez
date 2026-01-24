"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Wallet, TrendingUp, Clock, CheckCircle2 } from "lucide-react"

import { getPortalFinance } from "@/app/actions/portal-public"
import { PinOverlay } from "@/components/modules/portal/pin-overlay"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface PageProps {
    params: Promise<{
        token: string
    }>
}

export default function PortalFinancePage({ params }: PageProps) {
    const { token } = use(params)
    const [isVerified, setIsVerified] = useState(false)
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    // PIN doğrulandıktan sonra veriyi çek
    useEffect(() => {
        if (isVerified) {
            setLoading(true)
            // PIN'i client side'da saklamıyoruz, server action içinde tekrar sorulmalı normalde.
            // Ancak MVP için overlay sadece UI engeli. 
            // Gerçek güvenlik için server action'a PIN parametresi geçilmeli.
            // Burada basitlik adına overlay'de doğrulanan PIN'i state'de tutup gönderiyoruz.
        }
    }, [isVerified])

    // Overlay component'i kendi içinde doğrulama yapıyor, ancak data çekmek için PIN'e ihtiyacımız var.
    // Bu yüzden overlay'i biraz modifiye edip PIN'i geri döndürmesini sağlayabiliriz veya
    // Overlay içinde doğrulama yapıp sadece "başarılı" sinyali alabiliriz.
    // Güvenlik notu: Server action (getPortalFinance) PIN istiyor mu? Evet.
    // O zaman Overlay'den PIN'i almalıyız.

    const [pin, setPin] = useState<string | null>(null)

    useEffect(() => {
        async function fetchData() {
            if (pin) {
                setLoading(true)
                const result = await getPortalFinance(token, pin)
                setData(result)
                setLoading(false)
            }
        }
        fetchData()
    }, [pin, token])

    if (!pin) {
        return (
            <PinOverlay
                token={token}
                onSuccess={(validPin) => {
                    setPin(validPin) // Overlay componentini güncellememiz gerekecek
                    setIsVerified(true)
                }}
            />
        )
    }

    if (loading || !data) {
        return <div className="flex justify-center py-20">Yükleniyor...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Finans & Faturalar</h1>
                    <p className="text-muted-foreground">
                        Harcama özetiniz ve proje bütçeleri.
                    </p>
                </div>
                <Link href={`/portal/${token}`}>
                    <Button variant="outline">Geri Dön</Button>
                </Link>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Harcama</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(data.totalSpent)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Onaylanan projeler toplamı.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bekleyen Teklifler</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(data.pendingAmount)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Henüz onaylanmamış projeler.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>İşlem Geçmişi</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tarih</TableHead>
                                <TableHead>Durum</TableHead>
                                <TableHead className="text-right">Tutar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.proposals.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                                        Kayıt bulunamadı.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.proposals.map((p: any, i: number) => (
                                    <TableRow key={i}>
                                        <TableCell>
                                            {format(new Date(p.created_at), "d MMM yyyy", { locale: tr })}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={p.status === 'Approved' ? 'default' : 'secondary'}>
                                                {p.status === 'Approved' ? 'Onaylandı' : 'Bekliyor'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p.total_amount)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
