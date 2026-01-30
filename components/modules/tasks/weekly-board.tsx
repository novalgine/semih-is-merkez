"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { format, addDays, startOfWeek, endOfWeek, subWeeks, addWeeks, isSameDay } from "date-fns"
import { tr } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

import { Task, updateTask, reorderTasks } from "@/app/actions/tasks"
import { TaskColumn } from "./task-column"
import { TaskCard } from "./task-card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

import { EditTaskDialog } from "./edit-task-dialog"

interface WeeklyBoardProps {
    initialTasks: Task[]
    currentDate: Date
}

export function WeeklyBoard({ initialTasks, currentDate }: WeeklyBoardProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks)
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const [activeId, setActiveId] = useState<string | null>(null)
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const { toast } = useToast()
    const router = useRouter()

    // Update tasks when initialTasks change (e.g. after server action revalidation)
    useEffect(() => {
        setTasks(initialTasks)
    }, [initialTasks])

    const handleWeekChange = (date: Date) => {
        const dateStr = format(date, "yyyy-MM-dd")
        router.push(`/daily?date=${dateStr}`)
    }

    const handleEdit = (task: Task) => {
        setEditingTask(task)
    }

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // 5px sürükleyince başla (tıklamayı engellememek için)
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i))

    // Helper to get columns
    const getColumns = () => {
        const columns = []

        // Backlog Column
        columns.push({
            id: "backlog",
            title: "Havuz (Backlog)",
            tasks: tasks.filter(t => !t.assigned_date).sort((a, b) => a.position - b.position),
            date: null,
            isToday: false
        })

        // Week Days
        weekDays.forEach(day => {
            const dateStr = format(day, "yyyy-MM-dd")
            columns.push({
                id: dateStr,
                title: format(day, "EEEE, d MMM", { locale: tr }),
                tasks: tasks.filter(t => t.assigned_date === dateStr).sort((a, b) => a.position - b.position),
                date: dateStr,
                isToday: isSameDay(day, new Date())
            })
        })

        return columns
    }

    const columns = getColumns()

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return

        // ... (rest of drag over logic remains same)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        // ... (rest of drag end logic remains same)
        // Keeping existing implementation, just rendering properly
        const { active, over } = event

        if (!over) {
            setActiveId(null)
            return
        }

        const activeId = active.id as string
        const overId = over.id as string

        const activeTask = tasks.find(t => t.id === activeId)
        if (!activeTask) {
            setActiveId(null)
            return
        }

        // 1. Durum: Bir kolonun üzerine bırakıldı (Boş alana veya listenin sonuna)
        const overColumn = columns.find(c => c.id === overId)

        if (overColumn) {
            // Tarih güncellemesi
            const newDate = overColumn.id === "backlog" ? null : overColumn.id

            // Eğer tarih değiştiyse
            if (activeTask.assigned_date !== newDate) {
                // Optimistic Update
                const updatedTasks = tasks.map(t =>
                    t.id === activeId
                        ? { ...t, assigned_date: newDate, position: 9999 } // En sona ekle
                        : t
                )
                setTasks(updatedTasks)

                // Server Update
                try {
                    await updateTask({ id: activeId, updates: { assigned_date: newDate, position: 9999 } })
                } catch (error) {
                    setTasks(tasks) // Revert
                    toast({ title: "Hata", description: "Taşıma başarısız.", variant: "destructive" })
                }
            }
        }
        // 2. Durum: Başka bir görevin üzerine/yerine bırakıldı (Sıralama)
        else {
            const overTask = tasks.find(t => t.id === overId)
            if (overTask) {
                // Aynı kolonda mı?
                if (activeTask.assigned_date === overTask.assigned_date) {
                    const oldIndex = tasks.findIndex(t => t.id === activeId)
                    const newIndex = tasks.findIndex(t => t.id === overId)

                    if (oldIndex !== newIndex) {
                        const newTasks = arrayMove(tasks, oldIndex, newIndex)
                        setTasks(newTasks)

                        // Server Update (Batch reorder)
                        const columnTasks = newTasks.filter(t => t.assigned_date === activeTask.assigned_date)
                        const updates = columnTasks.map((t, index) => ({
                            id: t.id,
                            position: index,
                            assigned_date: t.assigned_date
                        }))

                        try {
                            await reorderTasks(updates)
                        } catch (error) {
                            setTasks(tasks) // Revert
                            toast({ title: "Hata", description: "Sıralama başarısız.", variant: "destructive" })
                        }
                    }
                }
                // Farklı kolona taşındı ve araya girdi
                else {
                    const newDate = overTask.assigned_date

                    // Optimistic Update
                    const updatedTasks = tasks.map(t =>
                        t.id === activeId
                            ? { ...t, assigned_date: newDate }
                            : t
                    )
                    // Basitlik için: Önce tarihi güncelle, sonra o tarihteki taskları sırala.
                    setTasks(updatedTasks)

                    try {
                        await updateTask({ id: activeId, updates: { assigned_date: newDate } })
                    } catch (error) {
                        setTasks(tasks)
                        toast({ title: "Hata", description: "Taşıma başarısız.", variant: "destructive" })
                    }
                }
            }
        }

        setActiveId(null)
    }

    const activeTask = tasks.find(t => t.id === activeId)

    return (
        <div className="flex flex-col h-full space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleWeekChange(subWeeks(weekStart, 1))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-medium min-w-[140px] text-center">
                        {format(weekStart, "d MMM", { locale: tr })} - {format(endOfWeek(weekStart, { weekStartsOn: 1 }), "d MMM", { locale: tr })}
                    </span>
                    <Button variant="outline" size="icon" onClick={() => handleWeekChange(addWeeks(weekStart, 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleWeekChange(new Date())}>
                        Bu Hafta
                    </Button>
                </div>
            </div>

            {/* Board Area */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 overflow-x-auto pb-4">
                    <div className="flex gap-4 h-full min-w-max px-1">
                        {columns.map((col) => (
                            <TaskColumn
                                key={col.id}
                                id={col.id}
                                title={col.title}
                                tasks={col.tasks}
                                date={col.date}
                                isToday={col.isToday}
                                onEdit={handleEdit}
                            />
                        ))}
                    </div>
                </div>

                <DragOverlay>
                    {activeTask ? <TaskCard task={activeTask} /> : null}
                </DragOverlay>
            </DndContext>

            {editingTask && (
                <EditTaskDialog
                    open={!!editingTask}
                    onOpenChange={(open) => !open && setEditingTask(null)}
                    task={editingTask}
                    onTaskUpdated={() => router.refresh()}
                />
            )}
        </div>
    )
}
