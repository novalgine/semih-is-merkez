import { notFound } from "next/navigation"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Calendar as CalendarIcon, MapPin, Clock } from "lucide-react"

export const dynamic = 'force-dynamic'

import { getPortalCustomer, getPortalShoots } from "@/app/actions/portal-public"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface PageProps {
    params: Promise<{
        token: string
    }>
}

export default async function PortalCalendarPage({ params }: PageProps) {
    const { token } = await params
    let customer = null
    try {
        customer = await getPortalCustomer(token)
    } catch (error) {
        console.error("Failed to fetch customer:", error)
    }

    if (!customer) return notFound()

    let shoots: any[] = []
    try {
        shoots = await getPortalShoots(token)
    } catch (error) {
        console.error("Failed to fetch shoots:", error)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Proje Takvimi</h1>
                    <p className="text-muted-foreground">
                        Planlanan ve tamamlanan tüm çekimleriniz.
                    </p>
                </div>
                <Link href={`/portal/${token}`}>
                    <Button variant="outline">Geri Dön</Button>
                </Link>
            </div>

            <div className="space-y-4">
                {shoots.length === 0 ? (
                    <Card>
                        <CardContent className="py-10 text-center text-muted-foreground">
                            Henüz planlanmış bir çekim bulunmuyor.
                        </CardContent>
                    </Card>
                ) : (
                    shoots.map((shoot) => (
                        <Card key={shoot.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row">
                                {/* Date Box */}
                                <div className="bg-muted/50 p-6 flex flex-col items-center justify-center min-w-[120px] border-b md:border-b-0 md:border-r">
                                    <span className="text-sm font-medium text-muted-foreground uppercase">
                                        {format(new Date(shoot.shoot_date), "MMMM", { locale: tr })}
                                    </span>
                                    <span className="text-4xl font-bold text-foreground">
                                        {format(new Date(shoot.shoot_date), "dd")}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {format(new Date(shoot.shoot_date), "yyyy")}
                                    </span>
                                </div>

                                {/* Details */}
                                <div className="flex-1 p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-lg font-semibold">{shoot.title}</h3>
                                            <p className="text-muted-foreground mt-1 text-sm">
                                                {shoot.description || "Açıklama yok."}
                                            </p>
                                        </div>
                                        <Badge variant={shoot.status === 'completed' ? 'default' : 'secondary'}>
                                            {shoot.status === 'completed' ? 'Tamamlandı' :
                                                shoot.status === 'confirmed' ? 'Onaylandı' : 'Planlanıyor'}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            {shoot.shoot_time ? shoot.shoot_time.slice(0, 5) : "Saatsiz"}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            {shoot.location || "Konum Belirsiz"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
