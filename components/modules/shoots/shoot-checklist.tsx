"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateShootChecklist } from "@/app/actions/shoots"
import { useToast } from "@/hooks/use-toast"

interface ChecklistItem {
    id: string
    text: string
    completed: boolean
}

interface ShootChecklistProps {
    shootId: string
    initialChecklist: ChecklistItem[] | null
}

const DEFAULT_CHECKLIST = [
    "Ekipman kontrolü yapıldı",
    "Bataryalar şarj edildi",
    "Hafıza kartları formatlandı",
    "Müşteri ile teyitleşildi",
    "Lokasyon bilgisi paylaşıldı",
    "Yedek ekipman alındı"
]

export function ShootChecklist({ shootId, initialChecklist }: ShootChecklistProps) {
    const [items, setItems] = useState<ChecklistItem[]>([])
    const [newItem, setNewItem] = useState("")
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        if (initialChecklist && initialChecklist.length > 0) {
            setItems(initialChecklist)
        } else {
            // Initialize with default items if empty
            setItems(DEFAULT_CHECKLIST.map(text => ({
                id: Math.random().toString(36).substr(2, 9),
                text,
                completed: false
            })))
        }
    }, [initialChecklist])

    const saveChecklist = async (newItems: ChecklistItem[]) => {
        setLoading(true)
        try {
            const result = await updateShootChecklist(shootId, newItems)
            if (!result.success) {
                toast({ title: "Hata", description: "Liste kaydedilemedi.", variant: "destructive" })
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const toggleItem = (id: string) => {
        const newItems = items.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        )
        setItems(newItems)
        saveChecklist(newItems)
    }

    const addItem = () => {
        if (!newItem.trim()) return
        const newItems = [...items, {
            id: Math.random().toString(36).substr(2, 9),
            text: newItem.trim(),
            completed: false
        }]
        setItems(newItems)
        setNewItem("")
        saveChecklist(newItems)
    }

    const removeItem = (id: string) => {
        const newItems = items.filter(item => item.id !== id)
        setItems(newItems)
        saveChecklist(newItems)
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">
                    Çekim Öncesi Hazırlık
                </CardTitle>
                {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                    {items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-2 group">
                            <Checkbox
                                id={item.id}
                                checked={item.completed}
                                onCheckedChange={() => toggleItem(item.id)}
                            />
                            <label
                                htmlFor={item.id}
                                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 ${item.completed ? 'line-through text-muted-foreground' : ''}`}
                            >
                                {item.text}
                            </label>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeItem(item.id)}
                            >
                                <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Input
                        placeholder="Yeni madde ekle..."
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addItem()}
                        className="h-8 text-sm"
                    />
                    <Button size="sm" variant="outline" onClick={addItem} className="h-8">
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
