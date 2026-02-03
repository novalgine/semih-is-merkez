"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Plus, Loader2 } from "lucide-react";
import { updateTask, createTask } from "@/app/actions/tasks";
import { toast } from "sonner";
import { Task } from "@/app/actions/tasks";
import { cn } from "@/lib/utils";
import { VoiceNoteInline } from "./voice-note-inline";

interface TodaysTasksInteractiveProps {
    initialTasks: Task[];
}

const PRIORITY_ICONS = {
    high: { icon: "🔴", label: "Yüksek" },
    medium: { icon: "🟡", label: "Orta" },
    low: { icon: "🔵", label: "Düşük" }
} as const;

export function TodaysTasksInteractive({ initialTasks }: TodaysTasksInteractiveProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [newTaskContent, setNewTaskContent] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [showVoiceNote, setShowVoiceNote] = useState(false);
    const router = useRouter();

    const completedCount = tasks.filter(t => t.is_completed).length;

    const handleToggle = async (task: Task) => {
        const newCompleted = !task.is_completed;

        // Optimistic update
        setTasks(tasks.map(t =>
            t.id === task.id ? { ...t, is_completed: newCompleted } : t
        ));

        try {
            await updateTask({
                id: task.id,
                updates: { is_completed: newCompleted }
            });
        } catch (error) {
            // Revert on error
            setTasks(tasks);
            toast.error("Güncelleme başarısız");
        }
    };

    const handleAddTask = async () => {
        if (!newTaskContent.trim()) return;

        setIsAdding(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const result = await createTask(
                newTaskContent,
                today,
                'Genel',
                'medium',
                undefined
            );

            if (result.success && result.task) {
                // Optimistic update - add task immediately to UI
                setTasks([...tasks, result.task]);
                setNewTaskContent("");
                toast.success("Görev eklendi!");
            } else {
                toast.error("Görev eklenemedi");
            }
        } catch (error) {
            toast.error("Bir hata oluştu");
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 md:p-6 border-b flex items-center justify-between bg-muted/20">
                <h2 className="text-lg md:text-xl font-bold">BUGÜNKÜ İŞLER</h2>
                <span className="text-sm font-semibold text-muted-foreground">
                    {completedCount}/{tasks.length} ✓
                </span>
            </div>

            {/* Task List */}
            <div className="p-4 md:p-6 space-y-3">
                {tasks.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm py-8 italic">
                        Bugün için görev yok. Hadi bir tane ekle! 🎯
                    </p>
                ) : (
                    tasks.map((task) => (
                        <div
                            key={task.id}
                            className={cn(
                                "flex items-start gap-3 p-3 md:p-4 rounded-xl bg-muted/30 border border-transparent hover:border-border transition-all",
                                task.is_completed && "opacity-60"
                            )}
                        >
                            <Checkbox
                                checked={task.is_completed}
                                onCheckedChange={() => handleToggle(task)}
                                className="mt-1 h-5 w-5 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                            />
                            <div className="flex-1 min-w-0 space-y-1">
                                <p className={cn(
                                    "font-medium text-sm md:text-base",
                                    task.is_completed && "line-through text-muted-foreground"
                                )}>
                                    {task.content}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs">
                                        {PRIORITY_ICONS[task.priority as keyof typeof PRIORITY_ICONS]?.icon || '🟡'}
                                        {' '}{PRIORITY_ICONS[task.priority as keyof typeof PRIORITY_ICONS]?.label || 'Orta'}
                                    </span>
                                    {task.category && (
                                        <span className="text-xs text-muted-foreground">
                                            • {task.category}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Task Footer */}
            <div className="p-4 md:p-6 border-t bg-muted/10">
                <div className="flex gap-2">
                    <Input
                        value={newTaskContent}
                        onChange={(e) => setNewTaskContent(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                        placeholder="Yeni görev ekle..."
                        className="flex-1"
                        disabled={isAdding}
                    />
                    <Button
                        onClick={handleAddTask}
                        disabled={isAdding || !newTaskContent.trim()}
                        size="icon"
                        className="shrink-0"
                    >
                        {isAdding ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="h-4 w-4" />
                        )}
                    </Button>
                    <Button
                        onClick={() => setShowVoiceNote(!showVoiceNote)}
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        title="Sesli not ekle"
                    >
                        <Mic className="h-4 w-4" />
                    </Button>
                </div>

                {showVoiceNote && (
                    <div className="mt-4">
                        <VoiceNoteInline onComplete={() => {
                            setShowVoiceNote(false);
                            router.refresh();
                        }} />
                    </div>
                )}
            </div>
        </div>
    );
}
