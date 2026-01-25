"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Pencil } from "lucide-react"
import { TagInput } from "@/components/ui/tag-input"

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { updateCustomer } from "@/app/actions/customers"

const customerSchema = z.object({
    name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
    company: z.string().optional(),
    email: z.string().email("Geçerli bir e-posta adresi giriniz").optional().or(z.literal('')),
    phone: z.string().optional(),
    status: z.enum(['active', 'lead', 'passive']),
    tags: z.array(z.string()).optional(),
})

interface Customer {
    id: string
    name: string
    company: string | null
    email: string | null
    phone: string | null
    status: 'active' | 'lead' | 'passive'
    tags?: string[] | null
}

export function EditCustomerDialog({ customer }: { customer: Customer }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const form = useForm<z.infer<typeof customerSchema>>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            name: customer.name,
            company: customer.company || "",
            email: customer.email || "",
            phone: customer.phone || "",
            status: customer.status,
            tags: customer.tags || [],
        },
    })

    async function onSubmit(values: z.infer<typeof customerSchema>) {
        setLoading(true)
        try {
            const result = await updateCustomer(customer.id, values)
            if (result.success) {
                setOpen(false)
                router.refresh() // Force page reload to show updated data
            } else {
                console.error(result.error)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Müşteri Düzenle</DialogTitle>
                    <DialogDescription>
                        Müşteri bilgilerini güncelleyin.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>İsim Soyisim</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ad Soyad" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="company"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Şirket</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Şirket Adı" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>E-posta</FormLabel>
                                        <FormControl>
                                            <Input placeholder="ornek@sirket.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Telefon</FormLabel>
                                        <FormControl>
                                            <Input placeholder="0555..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Durum</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Durum seçiniz" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="active">Aktif Müşteri</SelectItem>
                                            <SelectItem value="lead">Potansiyel (Lead)</SelectItem>
                                            <SelectItem value="passive">Pasif</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Güncelle
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
