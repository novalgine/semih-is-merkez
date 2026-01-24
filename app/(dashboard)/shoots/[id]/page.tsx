import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { MapPin, Calendar, Clock, Phone, Share2, ArrowLeft, Camera, CheckSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { getShootById } from "@/app/actions/shoots"
import { ShootSceneList } from "@/components/modules/shoots/shoot-scene-list"
import { EditShootDialog } from "@/components/modules/shoots/edit-shoot-dialog"
import { ShootChecklist } from "@/components/modules/shoots/shoot-checklist"

// WhatsApp Paylaşım Linki Oluşturucu
function getWhatsAppLink(shoot: any) {
    const date = new Date(shoot.shoot_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
    const time = new Date(shoot.shoot_date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    const equipmentList = shoot.equipment_list ? JSON.parse(shoot.equipment_list as string) : []

    let text = `🎬 *ÇEKİM PLANI (CALL SHEET)*%0A%0A` +
        `📌 *Proje:* ${shoot.title}%0A` +
        `👤 *Müşteri:* ${shoot.customers?.name}%0A` +
        `📅 *Tarih:* ${date} - ${time}%0A` +
        `📍 *Konum:* ${shoot.location || 'Belirtilmemiş'}%0A%0A`

    if (shoot.shoot_scenes && shoot.shoot_scenes.length > 0) {
        text += `📋 *AKIŞ:*%0A`
        shoot.shoot_scenes.sort((a: any, b: any) => (a.scene_number || 0) - (b.scene_number || 0)).forEach((scene: any, index: number) => {
            text += `${index + 1}. ${scene.description} ${scene.duration ? `(${scene.duration})` : ''}%0A`
        })
        text += `%0A`
    }

    if (equipmentList.length > 0) {
        text += `🎒 *EKİPMAN:* ${equipmentList.join(', ')}%0A%0A`
    }

    text += `Hazır olun! 🚀`

    return `https://wa.me/?text=${text}`
}

export default async function ShootDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const shoot = await getShootById(id)

    if (!shoot) {
        notFound()
    }

    const shootDate = new Date(shoot.shoot_date)
    const equipmentList = shoot.equipment_list ? JSON.parse(shoot.equipment_list as string) : []
    const checklist = shoot.checklist ? JSON.parse(shoot.checklist as string) : null

    return (
        <div className="max-w-2xl mx-auto pb-20">
            {/* Header / Nav */}
            <div className="flex items-center gap-2 mb-6 text-muted-foreground">
                <Link href="/shoots">
                    <Button variant="ghost" size="icon" className="-ml-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <span>Çekim Detayı</span>
            </div>

            {/* Main Info Card */}
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold leading-tight mb-2">{shoot.title}</h1>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-sm py-1">
                            {shoot.customers?.name}
                        </Badge>
                        <Badge className={shoot.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}>
                            {shoot.status === 'completed' ? 'Tamamlandı' : 'Planlandı'}
                        </Badge>
                    </div>
                </div>

                <Card className="bg-muted/30 border-none shadow-sm">
                    <CardContent className="p-4 space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="font-medium">
                                {format(shootDate, "d MMMM yyyy, EEEE", { locale: tr })}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-primary" />
                            <span className="font-medium">
                                {format(shootDate, "HH:mm")} (Call Time)
                            </span>
                        </div>
                        {shoot.location && (
                            <div className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 text-primary" />
                                <a
                                    href={shoot.location.startsWith('http') ? shoot.location : `https://maps.google.com/?q=${shoot.location}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline truncate"
                                >
                                    {shoot.location}
                                </a>
                            </div>
                        )}
                        {shoot.customers?.phone && (
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-primary" />
                                <a href={`tel:${shoot.customers.phone}`} className="hover:underline">
                                    {shoot.customers.phone}
                                </a>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <a href={getWhatsAppLink(shoot)} target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button variant="outline" className="w-full gap-2 border-green-200 hover:bg-green-50 hover:text-green-700 dark:border-green-900 dark:hover:bg-green-900/20">
                            <Share2 className="h-4 w-4" />
                            WhatsApp'ta Paylaş
                        </Button>
                    </a>
                    {/* Gelecekte buraya "Takvime Ekle" veya "Düzenle" gelebilir */}
                    {/* Düzenleme Dialogu */}
                    <EditShootDialog shoot={shoot} />
                </div>

                {/* Checklist */}
                <ShootChecklist shootId={shoot.id} initialChecklist={checklist} />

                {/* Equipment List (Accordion) */}
                {equipmentList.length > 0 && (
                    <Accordion type="single" collapsible className="w-full border rounded-lg bg-card px-4">
                        <AccordionItem value="equipment" className="border-none">
                            <AccordionTrigger className="hover:no-underline py-3">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Camera className="h-4 w-4 text-muted-foreground" />
                                    Ekipman Listesi ({equipmentList.length})
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <ul className="space-y-2 pb-3">
                                    {equipmentList.map((item: string, i: number) => (
                                        <li key={i} className="text-sm flex items-start gap-2 text-muted-foreground">
                                            <span className="block w-1.5 h-1.5 mt-1.5 rounded-full bg-primary/50 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )}

                {/* Scene List */}
                <div>
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <CheckSquare className="h-5 w-5" />
                        Çekim Planı (Shot List)
                    </h2>
                    <ShootSceneList
                        initialScenes={shoot.shoot_scenes || []}
                    />
                </div>

                {/* Notes */}
                {shoot.notes && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-100 dark:border-yellow-900/30 text-sm">
                        <h3 className="font-bold text-yellow-800 dark:text-yellow-500 mb-1">Notlar:</h3>
                        <p className="text-yellow-700 dark:text-yellow-400/80">{shoot.notes}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
