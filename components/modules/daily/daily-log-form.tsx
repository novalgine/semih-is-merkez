'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { createDailyLog } from "@/app/actions/daily"

const formSchema = z.object({
    content: z.string().min(1, "Bir şeyler yazmalısın."),
    productivity: z.number().min(1).max(10),
    category: z.string().optional(),
})

const CATEGORIES = [
    { value: "Strategic", label: "Stratejik (İş Geliştirme)" },
    { value: "Operational", label: "Operasyonel (Çekim/Kurgu)" },
    { value: "Learning", label: "Öğrenme (Eğitim)" },
    { value: "Waste", label: "Verimsiz (Boş Zaman)" },
]

export function DailyLogForm() {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: "",
            productivity: 5,
            category: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true)
        try {
            const result = await createDailyLog({
                ...values,
                mood: "neutral",
                category: values.category || undefined
            })
            if (result.success) {
                toast({ title: "Kaydedildi", description: "Günlük girişin başarıyla eklendi." })
                form.reset()
            } else {
                throw new Error("Kayıt hatası")
            }
        } catch (error) {
            toast({ title: "Hata", description: "Bir sorun oluştu.", variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Text Area */}
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <div className="relative">
                                    <Textarea
                                        placeholder="Bugün neler yaptın Semih? (Örn: Pürtelaş kurgusunu bitirdim, çok yorucuydu...)"
                                        className="min-h-[120px] text-lg p-4 resize-none bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary shadow-inner"
                                        {...field}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault()
                                                form.handleSubmit(onSubmit)()
                                            }
                                        }}
                                    />
                                    <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                                        Enter ile gönder, Shift + Enter ile alt satır
                                    </div>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Category Selection */}
                <div className="flex gap-2">
                    {CATEGORIES.map((cat) => (
                        <div
                            key={cat.value}
                            onClick={() => form.setValue('category', cat.value)}
                            className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${form.watch('category') === cat.value
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background hover:bg-muted text-muted-foreground"
                                }`}
                        >
                            {cat.label}
                        </div>
                    ))}
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            AI Analiz Ediyor...
                        </>
                    ) : (
                        <>
                            <Send className="mr-2 h-4 w-4" />
                            Günlüğü Kaydet
                        </>
                    )}
                </Button>
            </form>
        </Form>
    )
}
