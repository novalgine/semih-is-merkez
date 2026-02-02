"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Task } from "@/app/actions/tasks"
import { TaskCard } from "./task-card"
import { AddTaskDialog } from "./add-task-dialog"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface TaskColumnProps {
    id: string
    title: string
    tasks: Task[]
    date?: string | null
    isToday?: boolean
    onEdit?: (task: Task) => void
}

export function TaskColumn({ id, title, tasks, date, isToday, onEdit }: TaskColumnProps) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const router = useRouter()

    const { setNodeRef } = useDroppable({
        id: id,
        data: {
            type: "Column",
            date: date,
        },
    })

    const AddTrigger = ({ className }: { className?: string }) => (
        <Button
            variant="ghost"
            size="sm"
            className={cn(
                "w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50 h-8 px-2 gap-2 text-xs border border-dashed border-transparent hover:border-border/50",
                className
            )}
            onClick={() => setIsAddDialogOpen(true)}
        >
            <Plus className="h-3.5 w-3.5" />
            Görev Ekle
        </Button>
    )

    return (
        <div className="flex flex-col h-full min-w-[280px] w-[280px] bg-muted/10 rounded-lg border border-border/50">
            {/* Header */}
            <div className={cn(
                "p-3 border-b flex items-center justify-between bg-muted/20 rounded-t-lg",
                isToday && "bg-primary/10 border-primary/20"
            )}>
                <h3 className={cn(
                    "font-semibold text-sm",
                    isToday && "text-primary"
                )}>
                    {title}
                </h3>
                <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full border">
                    {tasks.length}
                </span>
            </div>

            {/* Task List */}
            <div ref={setNodeRef} className="flex-1 p-2 overflow-y-auto min-h-[150px] space-y-2 custom-scrollbar">
                {tasks.length === 0 ? (
                    <AddTrigger />
                ) : (
                    <>
                        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {tasks.map((task) => (
                                    <TaskCard key={task.id} task={task} onEdit={onEdit} />
                                ))}
                            </div>
                        </SortableContext>
                        <AddTrigger className="mt-2" />
                    </>
                )}
            </div>

            <AddTaskDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                initialDate={date}
                onTaskCreated={() => router.refresh()}
            />
        </div>
    )
}
