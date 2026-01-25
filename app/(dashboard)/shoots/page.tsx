import Link from "next/link"
import { Plus, Calendar, MapPin, User, Clock, Film } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getShoots } from "@/app/actions/shoots"
import { DeleteShootButton } from "@/components/modules/shoots/delete-shoot-button"

export default async function ShootsPage() {
    const shoots = await getShoots()

    // Tarihe göre gruplama veya sıralama zaten backend'de yapıldı.
    // Şimdi UI'ı çizelim.

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Çekim Takvimi</h1>
                    <p className="text-muted-foreground">
                        Yaklaşan prodüksiyonları ve set planlarını yönetin.
                    </p>
                </div>
                <Link href="/shoots/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Yeni Çekim Planla
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {shoots?.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center animate-in fade-in-50">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <Film className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">Henüz planlanmış çekim yok</h3>
                        <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
                            İlk set gününüzü planlamak için yukarıdaki butonu kullanın.
                        </p>
                        <Link href="/shoots/create">
                            <Button variant="outline">Çekim Planla</Button>
                        </Link>
                    </div>
                ) : (
                    shoots?.map((shoot) => {
                        const shootDate = new Date(shoot.shoot_date)
                        const today = new Date()
                        const diffTime = shootDate.getTime() - today.getTime()
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                        let statusColor = "bg-blue-500"
                        let statusText = "Planlandı"

                        if (shoot.status === 'completed') {
                            statusColor = "bg-green-500"
                            statusText = "Tamamlandı"
                        } else if (diffDays < 0) {
                            statusColor = "bg-gray-500"
                            statusText = "Geçmiş"
                        } else if (diffDays === 0) {
                            statusColor = "bg-red-500 animate-pulse"
                            statusText = "BUGÜN!"
                        }

                        return (
                            <div key={shoot.id} className="relative">
                                <Card className="hover:bg-muted/50 transition-all border-l-4 relative group" style={{ borderLeftColor: shoot.status === 'completed' ? '#22c55e' : '#3b82f6' }}>
                                    <DeleteShootButton id={shoot.id} />
                                    <Link href={`/shoots/${shoot.id}`} className="block">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <Badge variant="outline" className="mb-2">
                                                    {shoot.status === 'completed' ? 'Tamamlandı' :
                                                        diffDays === 0 ? 'BUGÜN' :
                                                            diffDays > 0 ? `${diffDays} Gün Kaldı` : 'Geçmiş'}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-lg font-bold line-clamp-1">
                                                {shoot.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-sm">
                                            <div className="flex items-center text-muted-foreground">
                                                <User className="mr-2 h-4 w-4" />
                                                <span className="truncate">{shoot.customers?.name} {shoot.customers?.company ? `(${shoot.customers.company})` : ''}</span>
                                            </div>
                                            <div className="flex items-center text-muted-foreground">
                                                <Calendar className="mr-2 h-4 w-4" />
                                                <span>{shootDate.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                            </div>
                                            <div className="flex items-center text-muted-foreground">
                                                <Clock className="mr-2 h-4 w-4" />
                                                <span>{shootDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            {shoot.location && (
                                                <div className="flex items-center text-muted-foreground">
                                                    <MapPin className="mr-2 h-4 w-4" />
                                                    <span className="truncate">{shoot.location}</span>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Link>
                                </Card>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
