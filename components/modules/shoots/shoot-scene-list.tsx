'use client'

import { useState } from "react"
import { CheckCircle2, Circle, Clock, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { toggleSceneCompletion } from "@/app/actions/shoots"
import { useToast } from "@/hooks/use-toast"

interface Scene {
    id: string
    scene_number: number
    description: string
    angle: string
    duration: string
    is_completed: boolean
}

interface ShootSceneListProps {
    initialScenes: Scene[]
}

export function ShootSceneList({ initialScenes }: ShootSceneListProps) {
    const [scenes, setScenes] = useState(initialScenes)
    const { toast } = useToast()

    const handleToggle = async (sceneId: string, currentStatus: boolean) => {
        // 1. Optimistic Update (Hemen arayüzü güncelle)
        const newStatus = !currentStatus
        setScenes(prev => prev.map(s =>
            s.id === sceneId ? { ...s, is_completed: newStatus } : s
        ))

        // 2. Server Action'ı çağır
        const result = await toggleSceneCompletion(sceneId, newStatus)

        // 3. Hata varsa geri al
        if (!result.success) {
            setScenes(prev => prev.map(s =>
                s.id === sceneId ? { ...s, is_completed: currentStatus } : s
            ))
            toast({ title: "Hata", description: "Güncelleme başarısız oldu.", variant: "destructive" })
        }
    }

    // İlerleme Durumu
    const completedCount = scenes.filter(s => s.is_completed).length
    const totalCount = scenes.length
    const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)

    return (
        <div className="space-y-6">
            {/* Progress Bar */}
            <div className="bg-muted rounded-full h-4 w-full overflow-hidden relative">
                <div
                    className="bg-green-500 h-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground/70">
                    %{progress} Tamamlandı ({completedCount}/{totalCount})
                </div>
            </div>

            {/* Scene List */}
            <div className="space-y-3">
                {scenes.map((scene) => (
                    <div
                        key={scene.id}
                        className={cn(
                            "group flex items-start gap-4 p-4 rounded-xl border transition-all select-none",
                            scene.is_completed
                                ? "bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-900"
                                : "bg-card hover:border-primary/50"
                        )}
                    >
                        {/* Checkbox Icon */}
                        <div
                            onClick={() => handleToggle(scene.id, scene.is_completed)}
                            className={cn(
                                "mt-1 transition-colors cursor-pointer hover:scale-110 active:scale-95",
                                scene.is_completed ? "text-green-600 dark:text-green-500" : "text-muted-foreground group-hover:text-primary"
                            )}
                        >
                            {scene.is_completed ? (
                                <CheckCircle2 className="h-6 w-6" />
                            ) : (
                                <Circle className="h-6 w-6" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-start">
                                <span className={cn(
                                    "font-medium text-base",
                                    scene.is_completed && "text-muted-foreground line-through decoration-green-500/50"
                                )}>
                                    {scene.scene_number}. {scene.description}
                                </span>
                            </div>

                            <div className="flex gap-3 text-xs text-muted-foreground">
                                {scene.angle && (
                                    <div className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded">
                                        <Video className="h-3 w-3" />
                                        {scene.angle}
                                    </div>
                                )}
                                {scene.duration && (
                                    <div className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded">
                                        <Clock className="h-3 w-3" />
                                        {scene.duration}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
