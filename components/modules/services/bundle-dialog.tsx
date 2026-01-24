'use client'

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Loader2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createBundle, updateBundle } from "@/app/actions/bundles"
import { getServices, Service } from "@/app/actions/services"
import { useToast } from "@/hooks/use-toast"

const bundleSchema = z.object({
    name: z.string().min(2, "Paket adı en az 2 karakter olmalıdır"),
    description: z.string().optional(),
    price: z.coerce.number().min(0, "Fiyat 0'dan küçük olamaz"),
    items: z.array(z.object({
        serviceId: z.string().min(1, "Hizmet seçiniz"),
        quantity: z.coerce.number().min(1, "Miktar en az 1 olmalı")
    })).min(1, "En az bir hizmet seçmelisiniz")
})

type BundleFormValues = z.infer<typeof bundleSchema>

interface BundleItem {
    id?: string
    service_id: string
    quantity: number
    services?: {
        id: string
        name: string
        price: number
    }
}

interface Bundle {
    id: string
    name: string
    description?: string
    price: number
    bundle_items?: BundleItem[]
}

interface BundleDialogProps {
    bundle?: Bundle
    trigger?: React.ReactNode
}

export function BundleDialog({ bundle, trigger }: BundleDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [services, setServices] = useState<Service[]>([])
    const { toast } = useToast()

    const form = useForm<BundleFormValues>({
        resolver: zodResolver(bundleSchema) as any,
        defaultValues: {
            name: bundle?.name || "",
            description: bundle?.description || "",
            price: bundle?.price || 0,
            items: bundle?.bundle_items?.map((item) => ({
                serviceId: item.services?.id || item.service_id,
                quantity: item.quantity
            })) || [{ serviceId: "", quantity: 1 }]
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items"
    })

    useEffect(() => {
        if (open) {
            getServices().then(setServices)
        }
    }, [open])

    // Calculate total price automatically based on selected services
    const calculateTotal = () => {
        const items = form.getValues("items")
        let total = 0
        items.forEach(item => {
            const service = services.find(s => s.id === item.serviceId)
            if (service && service.price) {
                total += service.price * item.quantity
            }
        })
        form.setValue("price", total)
    }

    const onSubmit = async (data: BundleFormValues) => {
        setLoading(true)
        try {
            const result = bundle
                ? await updateBundle(bundle.id, data)
                : await createBundle(data)

            if (result.success) {
                toast({ title: "Başarılı", description: bundle ? "Paket güncellendi." : "Paket oluşturuldu." })
                setOpen(false)
                form.reset()
            } else {
                toast({ title: "Hata", description: result.error, variant: "destructive" })
            }
        } catch (error) {
            console.error(error)
            toast({ title: "Hata", description: "Beklenmedik bir hata oluştu.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Yeni Paket
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{bundle ? "Paketi Düzenle" : "Yeni Paket Oluştur"}</DialogTitle>
                    <DialogDescription>
                        Hizmetleri gruplayarak bir paket oluşturun.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Paket Adı</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Örn: Düğün Hikayesi Paketi" {...field} />
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
                                        <Textarea placeholder="Paket detayları..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <FormLabel>Paket İçeriği</FormLabel>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ serviceId: "", quantity: 1 })}
                                >
                                    <Plus className="h-3 w-3 mr-1" /> Ekle
                                </Button>
                            </div>
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 items-start">
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.serviceId`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <Select onValueChange={(val) => {
                                                    field.onChange(val)
                                                    calculateTotal()
                                                }} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Hizmet seçiniz" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {services.map((s) => (
                                                            <SelectItem key={s.id} value={s.id}>
                                                                {s.name} ({s.price} TL)
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.quantity`}
                                        render={({ field }) => (
                                            <FormItem className="w-20">
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        {...field}
                                                        onChange={(e) => {
                                                            field.onChange(e)
                                                            calculateTotal()
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive"
                                        onClick={() => {
                                            remove(index)
                                            calculateTotal()
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Toplam Fiyat (TL)</FormLabel>
                                    <div className="flex gap-2">
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <Button type="button" variant="outline" onClick={calculateTotal}>
                                            Hesapla
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Kaydet
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
