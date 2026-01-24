'use client'

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { CalendarIcon, MapPin, Wand2, Plus, Trash2, Camera, ChevronRight, ChevronLeft, Save, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { generateShotList, generateEquipmentList } from "@/app/actions/ai-shoots"
import { createShoot } from "@/app/actions/shoots"
import { TagInput } from "@/components/ui/tag-input"

// --- SCHEMAS ---
const shootSchema = z.object({
    customerId: z.string().min(1, "Müşteri seçilmeli"),
    title: z.string().min(3, "Çekim adı en az 3 karakter olmalı"),
    shootDate: z.date(),
    shootTime: z.string().min(1, "Saat girilmeli"), // "09:00" gibi
    location: z.string().optional(),
    notes: z.string().optional(),
    scenes: z.array(z.object({
        scene_number: z.number(),
        description: z.string().min(1, "Açıklama girilmeli"),
        angle: z.string().optional(),
        duration: z.string().optional(),
    })),
    equipment: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
})

type ShootFormValues = z.infer<typeof shootSchema>

// --- STEPS ---
const STEPS = [
    { id: 1, title: "Genel Bilgiler", desc: "Müşteri ve zaman" },
    { id: 2, title: "Ekipmanlar", desc: "Teknik ihtiyaçlar" },
    { id: 3, title: "Sahne Listesi", desc: "Shot list ve içerik" },
]

const CINEMATIC_ANGLES = [
    "Geniş Açı", "Genel Plan", "Orta Plan", "Omuz",
    "Yakın Plan", "Makro", "Tepe (Kuş Bakışı)", "Alt Açı", "POV", "Drone"
]

export default function CreateShootPage() {
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [isAiLoading, setIsAiLoading] = useState(false)
    const [customers, setCustomers] = useState<any[]>([])
    const router = useRouter()
    const [newItem, setNewItem] = useState("")
    const { toast } = useToast()
    const supabase = createClient()

    // Form Setup
    const form = useForm<ShootFormValues>({
        resolver: zodResolver(shootSchema),
        defaultValues: {
            title: "",
            shootTime: "09:00",
            location: "",
            notes: "",
            scenes: [{ scene_number: 1, description: "", angle: "Genel", duration: "5 dk" }],
            equipment: [],
            tags: [],
        },
    })

    const { fields: sceneFields, append: appendScene, remove: removeScene, replace: replaceScenes } = useFieldArray({
        control: form.control,
        name: "scenes",
    })

    // Fetch Customers on Mount
    useState(() => {
        const fetchCustomers = async () => {
            const { data } = await supabase.from('customers').select('id, name, company')
            if (data) setCustomers(data)
        }
        fetchCustomers()
    })

    // --- AI ACTIONS ---
    const handleAiShotList = async () => {
        const title = form.getValues("title")
        const notes = form.getValues("notes")

        if (!title) {
            toast({ title: "Hata", description: "Önce bir çekim adı girmelisiniz.", variant: "destructive" })
            return
        }

        setIsAiLoading(true)
        try {
            const scenes = await generateShotList(title, notes)
            if (scenes && scenes.length > 0) {
                replaceScenes(scenes)
                toast({ title: "Başarılı", description: "Sahneler AI tarafından oluşturuldu." })
            }
        } catch (error) {
            toast({ title: "Hata", description: "AI yanıt veremedi.", variant: "destructive" })
        } finally {
            setIsAiLoading(false)
        }
    }

    const handleAiEquipment = async () => {
        const scenes = form.getValues("scenes")

        if (!scenes || scenes.length === 0) {
            toast({ title: "Hata", description: "Önce sahne listesi oluşturmalısınız.", variant: "destructive" })
            return
        }

        setIsAiLoading(true)
        try {
            const equipment = await generateEquipmentList(scenes)
            if (equipment && equipment.length > 0) {
                form.setValue("equipment", equipment)
                toast({ title: "Başarılı", description: "Ekipman listesi önerildi." })
            }
        } catch (error) {
            toast({ title: "Hata", description: "AI yanıt veremedi.", variant: "destructive" })
        } finally {
            setIsAiLoading(false)
        }
    }

    // --- SUBMIT ---
    const onSubmit = async (data: ShootFormValues) => {
        setIsLoading(true)
        try {
            // Tarih ve saati birleştir
            const date = new Date(data.shootDate)
            const [hours, minutes] = data.shootTime.split(':')
            date.setHours(parseInt(hours), parseInt(minutes))

            const result = await createShoot({
                ...data,
                shootDate: date.toISOString(),
            })

            if (result.success) {
                toast({ title: "Başarılı", description: "Çekim planı oluşturuldu!" })
                router.push(`/shoots/${result.id}`)
            } else {
                toast({ title: "Hata", description: result.error as string, variant: "destructive" })
            }
        } catch (error) {
            toast({ title: "Hata", description: "Bir sorun oluştu.", variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    // --- RENDER STEPS ---
    const nextStep = async () => {
        // Basit validasyon
        if (step === 1) {
            const isValid = await form.trigger(["customerId", "title", "shootDate", "shootTime"])
            if (!isValid) return
        }
        setStep(s => s + 1)
    }

    const prevStep = () => setStep(s => s - 1)

    return (
        <div className="max-w-4xl mx-auto py-6">
            {/* Stepper Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center relative">
                    <div className="absolute left-0 top-1/2 w-full h-1 bg-muted -z-10" />
                    {STEPS.map((s) => (
                        <div key={s.id} className="flex flex-col items-center bg-background px-4">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold transition-colors",
                                step >= s.id ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground text-muted-foreground"
                            )}>
                                {s.id}
                            </div>
                            <span className={cn("text-xs mt-2 font-medium", step >= s.id ? "text-primary" : "text-muted-foreground")}>
                                {s.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{STEPS[step - 1].title}</CardTitle>
                    <CardDescription>{STEPS[step - 1].desc}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {/* STEP 1: GENEL BİLGİLER */}
                            {step === 1 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="customerId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Müşteri</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Müşteri seçin" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {customers.map(c => (
                                                                <SelectItem key={c.id} value={c.id}>{c.name} ({c.company})</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Çekim Adı / Proje</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Örn: Yaz Sezonu Reklam Filmi" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="shootDate"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Tarih</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                                >
                                                                    {field.value ? format(field.value, "PPP", { locale: tr }) : <span>Tarih seçin</span>}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={field.onChange}
                                                                disabled={(date) => date < new Date("1900-01-01")}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="shootTime"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Call Time (Saat)</FormLabel>
                                                    <FormControl>
                                                        <Input type="time" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="location"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Lokasyon</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input className="pl-9" placeholder="Adres veya Google Maps linki" {...field} />
                                                    </div>
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
                                                <FormLabel>Notlar (Opsiyonel)</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Ekip için özel notlar..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
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
                                </div>
                            )}

                            {/* STEP 2: EKİPMANLAR (Artık Step 2) */}
                            {step === 2 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-medium">Ekipman Listesi</h3>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={handleAiEquipment}
                                            disabled={isAiLoading}
                                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200"
                                        >
                                            {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                                            AI ile Ekipman Öner
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2">
                                        <FormField
                                            control={form.control}
                                            name="equipment"
                                            render={({ field }) => (
                                                <div className="space-y-2">
                                                    {(field.value || []).map((item, index) => (
                                                        <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded-md">
                                                            <span className="flex-1 text-sm">{item}</span>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const newValue = [...(field.value || [])]
                                                                    newValue.splice(index, 1)
                                                                    field.onChange(newValue)
                                                                }}
                                                            >
                                                                <Trash2 className="h-3 w-3 text-muted-foreground" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="Yeni ekipman ekle..."
                                                            value={newItem}
                                                            onChange={(e) => setNewItem(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault()
                                                                    if (newItem.trim()) {
                                                                        const currentItems = field.value || []
                                                                        field.onChange([...currentItems, newItem.trim()])
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
                                                                    const currentItems = field.value || []
                                                                    field.onChange([...currentItems, newItem.trim()])
                                                                    setNewItem("")
                                                                }
                                                            }}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">Enter'a basarak listeye ekleyebilirsiniz.</p>
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: SAHNE LİSTESİ (Artık Step 3) */}
                            {step === 3 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                    <div className="flex justify-end mb-4">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={handleAiShotList}
                                            disabled={isAiLoading}
                                            className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200"
                                        >
                                            {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                            AI ile Sahneleri Öner
                                        </Button>
                                    </div>

                                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                        {sceneFields.map((field, index) => (
                                            <div key={field.id} className="flex gap-2 items-start p-4 border rounded-lg bg-muted/30">
                                                <div className="flex-1 grid grid-cols-12 gap-2">
                                                    <div className="col-span-1 flex items-center justify-center font-bold text-muted-foreground bg-muted rounded h-10">
                                                        {index + 1}
                                                    </div>
                                                    <div className="col-span-7">
                                                        <Input
                                                            placeholder="Sahne Açıklaması"
                                                            {...form.register(`scenes.${index}.description`)}
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <FormField
                                                            control={form.control}
                                                            name={`scenes.${index}.angle`}
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-0">
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
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Input
                                                            placeholder="Süre"
                                                            {...form.register(`scenes.${index}.duration`)}
                                                        />
                                                    </div>
                                                </div>
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

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full border-dashed"
                                        onClick={() => appendScene({ scene_number: sceneFields.length + 1, description: "", angle: "Genel Plan", duration: "" })}
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Sahne Ekle
                                    </Button>
                                </div>
                            )}

                            {/* FOOTER ACTIONS */}
                            <Separator className="my-6" />
                            <div className="flex justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={prevStep}
                                    disabled={step === 1 || isLoading}
                                >
                                    <ChevronLeft className="mr-2 h-4 w-4" /> Geri
                                </Button>

                                {step < 3 ? (
                                    <Button type="button" onClick={nextStep}>
                                        İleri <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        Planı Kaydet
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
