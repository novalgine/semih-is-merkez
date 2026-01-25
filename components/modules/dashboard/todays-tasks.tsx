'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Calendar, Clock, MapPin, Video } from "lucide-react"

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

            </CardContent>
        </Card>
    )
}
