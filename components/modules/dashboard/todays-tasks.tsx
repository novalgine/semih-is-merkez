'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Calendar, CheckCircle2, Clock, MapPin, PenTool, Video } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getTodaysTasks } from "@/app/actions/dashboard"

interface TaskData {
    shoots: {
        id: string
        title: string
        shoot_time?: string
        customers?: { name: string } | null
        location?: string | null
    }[]
    dailyLog: { content: string } | null
}

export function TodaysTasks() {
    const [data, setData] = useState<TaskData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getTodaysTasks()
                setData(result)
            } catch (error) {
                console.error("Failed to fetch tasks", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Bugünün İşleri</CardTitle>
                    <CardDescription>Yükleniyor...</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    const hasShoots = data?.shoots && data.shoots.length > 0
    const hasLog = !!data?.dailyLog

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Bugünün İşleri
                </CardTitle>
                <CardDescription>
                    {format(new Date(), "d MMMM yyyy, EEEE", { locale: tr })}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col gap-4">

                {/* 1. Çekimler Bölümü */}
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Video className="h-4 w-4" /> Çekimler
                    </h4>
                    {hasShoots && data ? (
                        <ScrollArea className="h-[120px] pr-4">
                            <div className="space-y-2">
                                {data.shoots.map((shoot) => (
                                    <div key={shoot.id} className="flex items-start gap-3 p-2 rounded-lg border bg-muted/40">
                                        <div className="bg-primary/10 text-primary rounded p-1.5">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between items-start">
                                                <p className="font-medium text-sm leading-none">{shoot.title}</p>
                                                <span className="text-xs font-mono text-muted-foreground">
                                                    {shoot.shoot_time?.slice(0, 5)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{shoot.customers?.name}</p>
                                            {shoot.location && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <MapPin className="h-3 w-3" />
                                                    <span className="truncate max-w-[150px]">{shoot.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="text-sm text-muted-foreground italic p-2 border border-dashed rounded-md text-center">
                            Bugün için planlanmış çekim yok.
                        </div>
                    )}
                </div>

                {/* 2. Günlük Bölümü */}
                <div className="space-y-2 flex-1 flex flex-col">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <PenTool className="h-4 w-4" /> Günlük
                    </h4>
                    {hasLog && data?.dailyLog ? (
                        <div className="flex-1 bg-green-50 border border-green-100 rounded-lg p-3 dark:bg-green-900/10 dark:border-green-900/20">
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="font-medium text-sm">Günlük Tamamlandı</span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-3 italic">
                                &quot;{data.dailyLog.content}&quot;
                            </p>
                            <div className="mt-2">
                                <Link href="/daily">
                                    <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                                        Tamamını Oku &rarr;
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center border border-dashed rounded-lg p-4 text-center bg-muted/20">
                            <p className="text-sm text-muted-foreground mb-3">Bugün henüz günlük yazmadın.</p>
                            <Link href="/daily">
                                <Button size="sm" variant="outline" className="gap-2">
                                    <PenTool className="h-4 w-4" />
                                    Şimdi Yaz
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

            </CardContent>
        </Card>
    )
}
