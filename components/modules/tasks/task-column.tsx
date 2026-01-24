"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Task } from "@/app/actions/tasks"
import { TaskCard } from "./task-card"
import { AddTaskInput } from "./add-task-input"
import { cn } from "@/lib/utils"

interface TaskColumnProps {
    id: string
    title: string
    tasks: Task[]
    date?: string | null
    isToday?: boolean
}

export function TaskColumn({ id, title, tasks, date, isToday }: TaskColumnProps) {
    const { setNodeRef } = useDroppable({
        id: id,
        data: {
            type: "Column",
            date: date,
        },
    })

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
            <div ref={setNodeRef} className="flex-1 p-2 overflow-y-auto min-h-[150px] space-y-2">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </SortableContext>

                {tasks.length === 0 && (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground/30 italic">
                        Boş
                    </div>
                )}
            </div>

            {/* Footer / Add Input */}
            <div className="p-2 border-t bg-muted/20 rounded-b-lg">
                <AddTaskInput assignedDate={date} />
            </div>
        </div>
    )
}
