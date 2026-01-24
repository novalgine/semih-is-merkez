'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { subDays, format, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns"
import { tr } from "date-fns/locale"

interface ActivityHeatmapProps {
    data: { date: string; count: number }[]
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
    // Son 365 günü hesapla (veya son 6 ay)
    const today = new Date()
    const startDate = subDays(today, 180) // Son 6 ay yeterli

    // Tarih aralığındaki tüm günleri oluştur
    const days = eachDayOfInterval({
        start: startDate,
        end: today
    })

    // Veriyi hızlı erişim için Map'e çevir
    const dataMap = new Map(data.map(d => [d.date, d.count]))

    // Renk skalası (GitHub stili)
    const getColor = (count: number) => {
        if (count === 0) return "bg-muted/50"
        if (count === 1) return "bg-green-200 dark:bg-green-900/40"
        if (count === 2) return "bg-green-300 dark:bg-green-800/60"
        if (count === 3) return "bg-green-400 dark:bg-green-700/80"
        return "bg-green-500 dark:bg-green-600"
    }

    return (
        <div className="w-full overflow-x-auto pb-2">
            <div className="flex gap-1 min-w-max">
                {/* Haftaları grupla (Basit versiyon: Sadece grid döküyoruz) */}
                <div className="grid grid-rows-7 grid-flow-col gap-1">
                    {days.map((day) => {
                        const dateStr = format(day, 'yyyy-MM-dd')
                        const count = dataMap.get(dateStr) || 0

                        return (
                            <TooltipProvider key={dateStr}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div
                                            className={cn(
                                                "w-3 h-3 rounded-sm transition-colors",
                                                getColor(count)
                                            )}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-xs">
                                            {format(day, 'd MMMM yyyy', { locale: tr })}: {count} Giriş
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )
                    })}
                </div>
            </div>
            <div className="flex justify-end items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                <span>Az</span>
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-sm bg-muted/50" />
                    <div className="w-2 h-2 rounded-sm bg-green-200 dark:bg-green-900/40" />
                    <div className="w-2 h-2 rounded-sm bg-green-400 dark:bg-green-700/80" />
                    <div className="w-2 h-2 rounded-sm bg-green-500 dark:bg-green-600" />
                </div>
                <span>Çok</span>
            </div>
        </div>
    )
}
