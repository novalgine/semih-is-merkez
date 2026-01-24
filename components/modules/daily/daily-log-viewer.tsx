'use client'

import { useState } from "react"
import { format, isSameDay } from "date-fns"
import { tr } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface DailyLog {
    id: string
    content: string
    mood: string
    productivity_score: number
    ai_tags: string | null
    log_date: string
}

interface DailyLogViewerProps {
    logs: DailyLog[]
}

export function DailyLogViewer({ logs }: DailyLogViewerProps) {
    const [date, setDate] = useState<Date | undefined>(new Date())

    // Seçilen güne ait kayıtları filtrele
    const filteredLogs = logs.filter(log =>
        date ? isSameDay(new Date(log.log_date), date) : true
    )

    // Mood Emoji Map
    const moodMap: Record<string, string> = {
        fire: "🔥", happy: "🙂", neutral: "😐", tired: "😓", stressed: "😡"
    }

    // Takvimde nokta göstermek için kayıt olan günleri belirle
    const daysWithLogs = logs.map(log => new Date(log.log_date))

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Calendar Column */}
            <div className="md:col-span-5 lg:col-span-4">
                <Card className="border-none shadow-none bg-transparent">
                    <CardContent className="p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border bg-card shadow-sm w-full flex justify-center"
                            modifiers={{
                                hasLog: daysWithLogs
                            }}
                            modifiersStyles={{
                                hasLog: { fontWeight: 'bold', textDecoration: 'underline', textDecorationColor: 'var(--primary)' }
                            }}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Logs Column */}
            <div className="md:col-span-7 lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                        {date ? format(date, "d MMMM yyyy", { locale: tr }) : "Tüm Kayıtlar"}
                    </h2>
                    <Badge variant="outline">
                        {filteredLogs.length} Kayıt
                    </Badge>
                </div>

                <div className="space-y-4">
                    {filteredLogs.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                            Bu tarihte henüz bir kayıt yok.
                        </div>
                    ) : (
                        filteredLogs.map((log) => {
                            const logDate = new Date(log.log_date)
                            const aiTags = log.ai_tags ? JSON.parse(log.ai_tags as string) : []

                            return (
                                <Card key={log.id} className="overflow-hidden transition-all hover:shadow-md">
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="text-sm text-muted-foreground font-medium">
                                                {format(logDate, "HH:mm")}
                                            </div>
                                            <div className="flex flex-wrap gap-1 justify-end">
                                                {aiTags.map((tag: string, i: number) => {
                                                    let variant: "default" | "secondary" | "outline" = "secondary"
                                                    if (tag.startsWith("Client:")) variant = "default"
                                                    if (tag.startsWith("Mood:")) variant = "outline"

                                                    return (
                                                        <Badge key={i} variant={variant} className="text-[10px]">
                                                            {tag}
                                                        </Badge>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        <p className="whitespace-pre-wrap leading-relaxed text-sm">
                                            {log.content}
                                        </p>

                                        {log.mood && log.mood !== 'neutral' && (
                                            <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>Duygu Durumu:</span>
                                                <span className="text-lg" title={log.mood}>{moodMap[log.mood]}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
