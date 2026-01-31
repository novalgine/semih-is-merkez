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
import { EditTaskDialog } from "@/components/modules/tasks/edit-task-dialog"

interface TaskData {
    shoots: {
        id: string
        title: string
        shoot_time?: string
        customers?: { name: string } | null
        location?: string | null
    }[]
    tasks: {
        id: string
        content: string
        category: string | null
        is_completed: boolean
    }[]
}

const categoryColors: Record<string, string> = {
    'To-Do': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    'Idea': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    'Meeting': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    'Meeting Note': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    'Finance': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    'Urgent': 'bg-red-500/10 text-red-600 border-red-500/20',
    'Thought': 'bg-slate-500/10 text-slate-600 border-slate-500/20',
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
    const hasTasks = data?.tasks && data.tasks.length > 0

    const [editingTask, setEditingTask] = useState<any>(null);

    return (
        <>
            <Card className="h-full flex flex-col border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Calendar className="h-5 w-5 text-primary" />
                        Bugünün İşleri
                    </CardTitle>
                    <CardDescription suppressHydrationWarning>
                        {format(new Date(), "d MMMM yyyy, EEEE", { locale: tr })}
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 flex-1 overflow-hidden flex flex-col gap-6">

                    {/* 1. Çekimler Bölümü */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <Video className="h-3 w-3" /> Çekimler
                        </h4>
                        {hasShoots && data ? (
                            <div className="space-y-2">
                                {data.shoots.map((shoot) => (
                                    <div key={shoot.id} className="flex items-start gap-4 p-3 rounded-xl border bg-card hover:border-primary/50 transition-colors">
                                        <div className="bg-primary/10 text-primary rounded-lg p-2 mt-0.5">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between items-start">
                                                <p className="font-semibold text-sm leading-none">{shoot.title}</p>
                                                <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                                    {shoot.shoot_time?.slice(0, 5)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground font-medium">{shoot.customers?.name}</p>
                                            {shoot.location && (
                                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground pt-1">
                                                    <MapPin className="h-3 w-3" />
                                                    <span className="truncate">{shoot.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-xs text-muted-foreground italic p-4 border border-dashed rounded-xl text-center">
                                Bugün için planlanmış çekim yok.
                            </div>
                        )}
                    </div>

                    {/* 2. Günlük Görevler Bölümü */}
                    <div className="space-y-3 flex-1 flex flex-col min-h-0">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Clock className="h-3 w-3" /> Yapılacaklar
                            </h4>
                        </div>

                        {hasTasks && data ? (
                            <ScrollArea className="flex-1 -mr-4 pr-4">
                                <div className="space-y-2 pb-2">
                                    {data.tasks.map((task) => (
                                        <div
                                            key={task.id}
                                            onClick={() => setEditingTask(task)}
                                            className="group flex items-start gap-3 p-3 rounded-xl border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all cursor-pointer"
                                        >
                                            <div
                                                className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 ring-2 ring-offset-2 ring-offset-card ${task.is_completed ? 'bg-emerald-500 ring-emerald-500/20' : 'bg-amber-500 ring-amber-500/20 group-hover:bg-amber-600'}`}
                                            />
                                            <div className="flex-1 space-y-1.5 overflow-hidden">
                                                <span className={`text-sm block leading-snug ${task.is_completed ? 'line-through text-muted-foreground' : 'text-foreground font-medium'}`}>
                                                    {task.content}
                                                </span>
                                                {task.category && (
                                                    <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border font-bold ${categoryColors[task.category] || 'bg-muted text-muted-foreground border-border'}`}>
                                                        {task.category}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        ) : (
                            <div className="text-xs text-muted-foreground italic p-4 border border-dashed rounded-xl text-center">
                                Bugün için yapılacak bir iş kalmadı.
                            </div>
                        )}
                    </div>

                </CardContent>
            </Card>

            {editingTask && (
                <EditTaskDialog
                    open={!!editingTask}
                    onOpenChange={(open) => !open && setEditingTask(null)}
                    task={editingTask}
                    onTaskUpdated={() => window.location.reload()} // For quick update, ideally revalidateTags
                />
            )}
        </>
    )
}
