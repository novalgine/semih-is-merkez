import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Task, updateTask } from "@/app/actions/tasks"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface TaskCardProps {
    task: Task
    onEdit?: (task: Task) => void
}

const categoryColors: Record<string, string> = {
    'To-Do': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    'Idea': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    'Meeting': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    'Meeting Note': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    'Finance': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    'Urgent': 'bg-red-500/10 text-red-600 border-red-500/20',
    'Thought': 'bg-slate-500/10 text-slate-600 border-slate-500/20',
    'Personal': 'bg-pink-500/10 text-pink-600 border-pink-500/20',
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
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
            await updateTask({ id: task.id, updates: { is_completed: checked }, currentAssignedDate: task.assigned_date })
        } catch (error) {
            setIsCompleted(!checked) // Revert on error
            toast({ title: "Hata", description: "Güncellenemedi", variant: "destructive" })
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
            onClick={() => onEdit?.(task)}
            className={cn(
                "group relative bg-card hover:bg-accent/50 border rounded-xl p-3 shadow-sm transition-all touch-none cursor-pointer",
                isCompleted && "opacity-60 bg-muted"
            )}
        >
            <div className="flex items-start gap-3">
                <Checkbox
                    checked={isCompleted}
                    onCheckedChange={handleToggle}
                    className="mt-1 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1 space-y-2">
                    <span className={cn(
                        "text-sm leading-relaxed block break-words font-medium",
                        isCompleted && "line-through text-muted-foreground"
                    )}>
                        {task.content}
                    </span>

                    {task.category && (
                        <span className={cn(
                            "inline-flex text-[10px] px-2 py-0.5 rounded-full border font-bold",
                            categoryColors[task.category] || 'bg-muted text-muted-foreground border-border'
                        )}>
                            {task.category}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
