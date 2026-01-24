"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Trash2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Task, updateTask, deleteTask } from "@/app/actions/tasks"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface TaskCardProps {
    task: Task
}

export function TaskCard({ task }: TaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id, data: { task } })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const { toast } = useToast()
    const [isCompleted, setIsCompleted] = useState(task.is_completed)

    const handleToggle = async (checked: boolean) => {
        setIsCompleted(checked)
        try {
            await updateTask(task.id, { is_completed: checked })
        } catch (error) {
            setIsCompleted(!checked) // Revert on error
            toast({ title: "Hata", description: "Güncellenemedi", variant: "destructive" })
        }
    }

    const handleDelete = async () => {
        try {
            await deleteTask(task.id)
            toast({ title: "Silindi", description: "Görev silindi." })
        } catch (error) {
            toast({ title: "Hata", description: "Silinemedi", variant: "destructive" })
        }
    }

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-muted/50 border-2 border-primary/20 rounded-md p-3 h-[60px] opacity-50"
            />
        )
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "group relative bg-card hover:bg-accent/50 border rounded-md p-3 shadow-sm transition-all touch-none",
                isCompleted && "opacity-60 bg-muted"
            )}
        >
            <div className="flex items-start gap-3">
                <Checkbox
                    checked={isCompleted}
                    onCheckedChange={handleToggle}
                    className="mt-1 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                    // Checkbox'a tıklayınca sürüklemeyi engellemek için
                    onPointerDown={(e) => e.stopPropagation()}
                />
                <span className={cn(
                    "text-sm leading-relaxed flex-1 break-words",
                    isCompleted && "line-through text-muted-foreground"
                )}>
                    {task.content}
                </span>

                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        handleDelete()
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive absolute top-2 right-2 p-1 rounded-md hover:bg-muted"
                >
                    <Trash2 className="h-3 w-3" />
                </button>
            </div>
        </div>
    )
}
