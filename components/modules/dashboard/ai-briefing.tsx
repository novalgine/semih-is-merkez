'use client'

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { generateDashboardBriefing, DashboardStats } from "@/app/actions/dashboard"

export function AiBriefing({ stats }: { stats: DashboardStats }) {
    const [briefing, setBriefing] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isMounted = true

        async function fetchBriefing() {
            try {
                const text = await generateDashboardBriefing(stats)
                if (isMounted) {
                    setBriefing(text)
                    setLoading(false)
                }
            } catch (error) {
                if (isMounted) {
                    setBriefing("Günaydın! Bugün harika bir gün olsun. 🚀")
                    setLoading(false)
                }
            }
        }

        fetchBriefing()

        return () => { isMounted = false }
    }, [stats])

    if (loading) {
        return (
            <Card className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-none">
                <CardContent className="p-6 flex gap-4 items-start">
                    <div className="p-2 bg-primary/10 rounded-full shrink-0 animate-pulse">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-2 w-full">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-primary/20 shadow-sm overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
            <CardContent className="p-6 flex gap-4 items-start relative z-10">
                <div className="p-2 bg-primary/10 rounded-full shrink-0 mt-1">
                    <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold text-sm text-primary/80 uppercase tracking-wider">Günlük Asistan Özeti</h3>
                    <p className="text-lg font-medium leading-relaxed text-foreground/90">
                        {briefing}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
