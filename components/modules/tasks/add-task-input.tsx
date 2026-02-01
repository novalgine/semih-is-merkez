"use client"

import { useState } from "react"
import { Plus, Loader2, Tag } from "lucide-react"
import { createTask } from "@/app/actions/tasks"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface AddTaskInputProps {
    assignedDate?: string | null
}

const CATEGORIES = [
    { value: "To-Do", label: "Yapılacak", color: "text-blue-600" },
    { value: "Meeting", label: "Toplantı", color: "text-amber-600" },
    { value: "Urgent", label: "Acil", color: "text-red-600" },
    { value: "Idea", label: "Fikir", color: "text-purple-600" },
    { value: "Finance", label: "Finans", color: "text-emerald-600" },
]

export function AddTaskInput({ assignedDate }: AddTaskInputProps) {
    const [content, setContent] = useState("")
    const [category, setCategory] = useState<string>("To-Do")
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!content.trim()) return

        setIsLoading(true)
        try {
            // Pass the category to the server action
            const result = await createTask(content, assignedDate, category)
            if (result.success) {
                setContent("")
                setCategory("To-Do") // Reset category
                router.refresh() // Force refresh to show new task immediately
            } else {
                toast({ title: "Hata", description: "Görev eklenemedi.", variant: "destructive" })
            }
        } catch (error) {
            toast({ title: "Hata", description: "Bir sorun oluştu.", variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
            <div className="relative flex-1">
                <Input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="+ Görev ekle"
                    className="pr-20 h-9 text-sm bg-muted/30 border-dashed border-muted-foreground/30 focus:bg-background focus:border-solid transition-all"
                    disabled={isLoading}
                />

                {/* Category Select Overlay/Trigger - Compact Version */}
                <div className="absolute right-0 top-0 h-9">
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="h-full border-0 bg-transparent focus:ring-0 px-2 gap-1 w-[80px] text-[10px] font-bold text-muted-foreground hover:text-foreground">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="end">
                            {CATEGORIES.map(cat => (
                                <SelectItem key={cat.value} value={cat.value} className="text-xs">
                                    <span className={cat.color}>{cat.label}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Button
                type="submit"
                size="icon"
                variant="outline"
                className="h-9 w-9 shrink-0 border-dashed bg-muted/30 hover:bg-muted hover:border-solid"
                disabled={isLoading || !content.trim()}
            >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
        </form>
    )
}
