'use client'

import { useState } from "react"
import { useForm, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Plus, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createService, updateService, Service } from "@/app/actions/services"

const serviceSchema = z.object({
    name: z.string().min(2, "Hizmet adı en az 2 karakter olmalı"),
    description: z.string().optional(),
    price: z.number().min(0, "Fiyat 0'dan küçük olamaz").default(0),
    unit: z.string().default("adet"),
})

type ServiceFormValues = z.infer<typeof serviceSchema>

interface ServiceDialogProps {
    service?: Service
    trigger?: React.ReactNode
}

export function ServiceDialog({ service, trigger }: ServiceDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const isEditing = !!service

    const form = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceSchema) as Resolver<ServiceFormValues>,
        defaultValues: {
            name: service?.name || "",
            description: service?.description || "",
            price: service?.price || 0,
            unit: service?.unit || "adet",
        },
    })

    const onSubmit = async (values: ServiceFormValues) => {
        setIsLoading(true)
        try {
            let result
            if (isEditing && service) {
                result = await updateService(service.id, values)
            } else {
                result = await createService(values)
            }

            if (result.success) {
                toast({
                    title: isEditing ? "Güncellendi" : "Oluşturuldu",
                    description: `Hizmet başarıyla ${isEditing ? "güncellendi" : "oluşturuldu"}.`
                })
                setOpen(false)
                if (!isEditing) form.reset()
            } else {
                throw new Error(result.error || "İşlem başarısız")
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
                {trigger || (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Yeni Hizmet
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Hizmeti Düzenle" : "Yeni Hizmet Ekle"}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hizmet Adı</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Örn: Tanıtım Filmi Çekimi" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Açıklama</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Hizmet detayları..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Birim Fiyat (TL)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="unit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Birim</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Birim seçin" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="adet">Adet</SelectItem>
                                                <SelectItem value="saat">Saat</SelectItem>
                                                <SelectItem value="gün">Gün</SelectItem>
                                                <SelectItem value="proje">Proje</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isEditing ? <Pencil className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />)}
                            {isEditing ? "Güncelle" : "Oluştur"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
