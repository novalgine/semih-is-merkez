"use client"

import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"
import { createTask } from "@/app/actions/tasks"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface AddTaskInputProps {
    assignedDate?: string | null
}

export function AddTaskInput({ assignedDate }: AddTaskInputProps) {
    const [content, setContent] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!content.trim()) return

        setIsLoading(true)
        try {
            const result = await createTask(content, assignedDate)
            if (result.success) {
                setContent("")
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
        <form onSubmit={handleSubmit} className="mt-2">
            <div className="relative">
                <Input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="+ Görev ekle"
                    className="pr-8 h-9 text-sm bg-muted/30 border-dashed border-muted-foreground/30 focus:bg-background focus:border-solid transition-all"
                    disabled={isLoading}
                />
                <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className="absolute right-0 top-0 h-9 w-9 text-muted-foreground hover:text-primary"
                    disabled={isLoading || !content.trim()}
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
            </div>
        </form>
    )
}
