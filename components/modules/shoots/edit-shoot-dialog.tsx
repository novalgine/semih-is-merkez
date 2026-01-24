'use client'

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Plus, Trash2, Save, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { updateShoot } from "@/app/actions/shoots"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TagInput } from "@/components/ui/tag-input"

const CINEMATIC_ANGLES = [
    "Geniş Açı", "Genel Plan", "Orta Plan", "Omuz",
    "Yakın Plan", "Makro", "Tepe (Kuş Bakışı)", "Alt Açı", "POV", "Drone"
]

const shootSchema = z.object({
    title: z.string().min(3, "Çekim adı en az 3 karakter olmalı"),
    location: z.string().optional(),
    notes: z.string().optional(),
    scenes: z.array(z.object({
        id: z.string().optional(),
        scene_number: z.number(),
        description: z.string().min(1, "Açıklama girilmeli"),
        angle: z.string().optional(),
        duration: z.string().optional(),
    })),
    equipment: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
})

type ShootFormValues = z.infer<typeof shootSchema>

interface Shoot {
    id: string
    title: string
    location?: string
    notes?: string
    shoot_scenes?: {
        id: string
        scene_number: number
        description: string
        angle?: string
        duration?: string
    }[]
    equipment_list?: string
    tags?: string[]
}

export function EditShootDialog({ shoot }: { shoot: Shoot }) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [newItem, setNewItem] = useState("")
    const { toast } = useToast()

    const form = useForm<ShootFormValues>({
        resolver: zodResolver(shootSchema),
        defaultValues: {
            title: shoot.title,
            location: shoot.location || "",
            notes: shoot.notes || "",
            scenes: shoot.shoot_scenes?.map((s) => ({
                id: s.id,
                scene_number: s.scene_number,
                description: s.description,
                angle: s.angle || "",
                duration: s.duration || "",
            })) || [],
            equipment: shoot.equipment_list ? JSON.parse(shoot.equipment_list as string) : [],
            tags: shoot.tags || [],
        },
    })

    const { fields: sceneFields, append: appendScene, remove: removeScene } = useFieldArray({
        control: form.control,
        name: "scenes",
    })

    const onSubmit = async (values: ShootFormValues) => {
        setIsLoading(true)
        try {
            const result = await updateShoot(shoot.id, values)
            if (result.success) {
                toast({ title: "Güncellendi", description: "Çekim detayları başarıyla güncellendi." })
                setOpen(false)
            } else {
                toast({ title: "Hata", description: result.error as string, variant: "destructive" })
            }
        } catch {
            toast({ title: "Hata", description: "Bir sorun oluştu.", variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2">
                    <Pencil className="h-4 w-4" />
                    Düzenle
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Çekim Planını Düzenle</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Genel Bilgiler */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Çekim Adı</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Lokasyon</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="tags"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Etiketler</FormLabel>
                                    <FormControl>
                                        <TagInput
                                            value={field.value || []}
                                            onChange={field.onChange}
                                            placeholder="Etiket ekle..."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notlar</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Sahneler */}
                        <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium">Sahne Listesi</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => appendScene({ scene_number: sceneFields.length + 1, description: "", angle: "", duration: "" })}
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Sahne Ekle
                                </Button>
                            </div>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                {sceneFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-start">
                                        <div className="w-8 pt-2 text-center font-bold text-muted-foreground">{index + 1}</div>
                                        <Input
                                            placeholder="Açıklama"
                                            {...form.register(`scenes.${index}.description`)}
                                            className="flex-1"
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`scenes.${index}.angle`}
                                            render={({ field }) => (
                                                <FormItem className="space-y-0 w-32">
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Açı" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {CINEMATIC_ANGLES.map(angle => (
                                                                <SelectItem key={angle} value={angle}>{angle}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                        <Input
                                            placeholder="Süre"
                                            {...form.register(`scenes.${index}.duration`)}
                                            className="w-20"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive"
                                            onClick={() => removeScene(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Ekipmanlar */}
                        <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                            <h3 className="font-medium">Ekipman Listesi</h3>

                            <FormField
                                control={form.control}
                                name="equipment"
                                render={({ field }) => (
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Yeni ekipman ekle..."
                                                value={newItem}
                                                onChange={(e) => setNewItem(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault()
                                                        if (newItem.trim()) {
                                                            field.onChange([...(field.value || []), newItem.trim()])
                                                            setNewItem("")
                                                        }
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => {
                                                    if (newItem.trim()) {
                                                        field.onChange([...(field.value || []), newItem.trim()])
                                                        setNewItem("")
                                                    }
                                                }}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {(field.value || []).map((item, index) => (
                                                <div key={index} className="flex items-center gap-1 bg-background border px-2 py-1 rounded-md text-sm">
                                                    <span>{item}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newValue = [...(field.value || [])]
                                                            newValue.splice(index, 1)
                                                            field.onChange(newValue)
                                                        }}
                                                        className="text-muted-foreground hover:text-destructive ml-1"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Değişiklikleri Kaydet
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
