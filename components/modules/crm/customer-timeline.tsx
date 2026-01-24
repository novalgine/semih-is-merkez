import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { FileText, Video, MessageSquare, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TimelineItem {
    id: string
    type: 'proposal' | 'shoot' | 'interaction'
    date: string
    // Proposal fields
    project_title?: string
    total_amount?: number
    // Shoot fields
    title?: string
    shoot_date?: string
    // Interaction fields
    content?: string
    status?: string // Proposal/Shoot status
}

export function CustomerTimeline({ items }: { items: TimelineItem[] }) {
    if (items.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Zaman Tüneli</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Henüz bir aktivite yok.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Zaman Tüneli</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {items.map((item, index) => (
                        <div key={`${item.type}-${item.id}`} className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className={`flex h-8 w-8 items-center justify-center rounded-full border 
                                    ${item.type === 'proposal' ? 'bg-blue-100 text-blue-600 border-blue-200' :
                                        item.type === 'shoot' ? 'bg-purple-100 text-purple-600 border-purple-200' :
                                            'bg-orange-100 text-orange-600 border-orange-200'}`}>
                                    {item.type === 'proposal' && <FileText className="h-4 w-4" />}
                                    {item.type === 'shoot' && <Video className="h-4 w-4" />}
                                    {item.type === 'interaction' && <MessageSquare className="h-4 w-4" />}
                                </div>
                                {index !== items.length - 1 && (
                                    <div className="h-full w-px bg-border my-2" />
                                )}
                            </div>
                            <div className="flex-1 space-y-1 pb-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">
                                        {item.type === 'proposal' && "Teklif Oluşturuldu"}
                                        {item.type === 'shoot' && "Çekim Planlandı"}
                                        {item.type === 'interaction' && "Etkileşim"}
                                    </p>
                                    <span className="text-xs text-muted-foreground">
                                        {format(new Date(item.date), 'd MMM yyyy', { locale: tr })}
                                    </span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {item.type === 'proposal' && (
                                        <div className="flex flex-col gap-1">
                                            <span>{item.project_title}</span>
                                            <div className="flex gap-2 items-center">
                                                <Badge variant="outline" className="text-xs">{item.status}</Badge>
                                                {item.total_amount && <span>{item.total_amount.toLocaleString('tr-TR')} TL</span>}
                                            </div>
                                        </div>
                                    )}
                                    {item.type === 'shoot' && (
                                        <div className="flex flex-col gap-1">
                                            <span>{item.title}</span>
                                            <div className="flex gap-2 items-center">
                                                <Badge variant="outline" className="text-xs">{item.status}</Badge>
                                                {item.shoot_date && (
                                                    <span className="flex items-center gap-1 text-xs">
                                                        <Calendar className="h-3 w-3" />
                                                        {format(new Date(item.shoot_date), 'd MMM yyyy', { locale: tr })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {item.type === 'interaction' && (
                                        <p>{item.content}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
