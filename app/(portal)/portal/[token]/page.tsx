import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import {
    Calendar,
    FileVideo,
    Wallet,
    ArrowRight,
    Clock,
    CheckCircle2
} from "lucide-react"

export const dynamic = 'force-dynamic'

import { getPortalCustomer, getPortalShoots, getPortalDeliverables } from "@/app/actions/portal-public"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface PageProps {
    params: Promise<{
        token: string
    }>
}

export default async function PortalDashboard({ params }: PageProps) {
    const { token } = await params
    let customer = null
    try {
        customer = await getPortalCustomer(token)
    } catch (error) {
        console.error("Failed to fetch customer:", error)
    }

    if (!customer) {
        return notFound()
    }

    let shoots: any[] = []
    let deliverables: any[] = []
    try {
        shoots = await getPortalShoots(token)
        deliverables = await getPortalDeliverables(token)
    } catch (error) {
        console.error("Failed to fetch portal data:", error)
    }

    // İstatistikler
    const upcomingShoots = shoots.filter(s => new Date(s.shoot_date) >= new Date())
    const nextShoot = upcomingShoots[0]
    const completedShoots = shoots.filter(s => s.status === 'completed').length

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Hoş Geldiniz, {customer.name}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {customer.company ? `${customer.company} - ` : ""}Proje Yönetim Paneli
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white px-4 py-2 rounded-full border shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Sistem Aktif
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Next Shoot Card */}
                <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Sıradaki Çekim
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {nextShoot ? (
                            <div>
                                <div className="text-2xl font-bold">
                                    {format(new Date(nextShoot.shoot_date), "d MMMM", { locale: tr })}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1 truncate">
                                    {nextShoot.title}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-blue-600 mt-2 font-medium">
                                    <Clock className="h-3 w-3" />
                                    {format(new Date(nextShoot.shoot_date), "HH:mm")} - {nextShoot.location || "Konum Belirsiz"}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="text-lg font-medium text-gray-900">Planlanmış çekim yok</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Yeni bir proje için iletişime geçebilirsiniz.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Deliverables Card */}
                <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <FileVideo className="h-4 w-4" />
                            Teslim Edilenler
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{deliverables.length} Dosya</div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Arşivinizde erişilebilir durumda.
                        </p>
                        <div className="mt-3">
                            <Link href={`/portal/${token}/archive`}>
                                <Button variant="link" className="p-0 h-auto text-purple-600 font-semibold">
                                    Arşive Git <ArrowRight className="ml-1 h-3 w-3" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Project Status Card */}
                <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Tamamlanan Projeler
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedShoots} Proje</div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Başarıyla tamamlandı.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href={`/portal/${token}/calendar`} className="group">
                    <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                        <CardHeader>
                            <CardTitle className="group-hover:text-primary transition-colors flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Proje Takvimi
                            </CardTitle>
                            <CardDescription>
                                Tüm geçmiş ve gelecek çekim planlamalarınızı görüntüleyin.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href={`/portal/${token}/archive`} className="group">
                    <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                        <CardHeader>
                            <CardTitle className="group-hover:text-primary transition-colors flex items-center gap-2">
                                <FileVideo className="h-5 w-5" />
                                Medya Arşivi
                            </CardTitle>
                            <CardDescription>
                                Teslim edilen video, fotoğraf ve belgelerinize erişin.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href={`/portal/${token}/finance`} className="group">
                    <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                        <CardHeader>
                            <CardTitle className="group-hover:text-primary transition-colors flex items-center gap-2">
                                <Wallet className="h-5 w-5" />
                                Finans & Faturalar
                            </CardTitle>
                            <CardDescription>
                                Ödeme geçmişi ve bekleyen bakiyeler (PIN Korumalı).
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
