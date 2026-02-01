"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Trash2, Wand2, Loader2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { generateProposalItems } from "@/app/actions/ai-proposal"
import { saveProposal } from "@/app/actions/proposals"
import { getServices, Service } from "@/app/actions/services"
import { getBundles } from "@/app/actions/bundles"
import { SnippetBank } from "@/components/modules/proposals/snippet-bank"

const proposalSchema = z.object({
    customerId: z.string().min(1, "Müşteri seçiniz"),
    projectTitle: z.string().min(2, "Proje başlığı giriniz"),
    validUntil: z.string().min(1, "Geçerlilik tarihi seçiniz"),
    items: z.array(z.object({
        description: z.string().min(1, "Açıklama giriniz"),
        quantity: z.coerce.number().min(1, "Miktar en az 1 olmalı"),
        unitPrice: z.coerce.number().min(0, "Fiyat 0'dan küçük olamaz"),
    })).min(1, "En az bir hizmet kalemi ekleyiniz"),
    notes: z.string().optional(),
})

type ProposalFormValues = z.infer<typeof proposalSchema>

export default function CreateProposalPage() {
    const [customers, setCustomers] = useState<any[]>([])
    const [services, setServices] = useState<Service[]>([])
    const [bundles, setBundles] = useState<any[]>([])
    const [aiLoading, setAiLoading] = useState(false)
    const [tone, setTone] = useState<'corporate' | 'creative' | 'friendly'>('corporate')
    const [saving, setSaving] = useState(false)
    const [previewData, setPreviewData] = useState<any>(null)

    const form = useForm<ProposalFormValues>({
        resolver: zodResolver(proposalSchema) as any, // Temporary fix for Zod inference issue
        defaultValues: {
            customerId: "",
            projectTitle: "",
            validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 gün sonrası
            items: [{ description: "", quantity: 1, unitPrice: 0 }],
            notes: "",
        },
    })

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: "items",
    })

    // Fetch customers and services on mount
    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient()
            const { data: customersData } = await supabase.from('customers').select('id, name, company').order('name')
            if (customersData) setCustomers(customersData)

            const servicesData = await getServices()
            setServices(servicesData)

            const bundlesData = await getBundles()
            setBundles(bundlesData)
        }
        fetchData()
    }, [])

    // Watch form changes for preview (Debounced)
    useEffect(() => {
        const subscription = form.watch((value) => {
            const timer = setTimeout(() => {
                const selectedCustomer = customers.find(c => c.id === value.customerId)

                const items = value.items?.map((item: any) => ({
                    description: item.description || "",
                    quantity: Number(item.quantity) || 0,
                    unitPrice: Number(item.unitPrice) || 0,
                    total: (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
                })) || []

                const subtotal = items.reduce((sum: number, item: any) => sum + item.total, 0)
                const tax = subtotal * 0.20
                const total = subtotal + tax

                setPreviewData({
                    customerName: selectedCustomer?.name || "Müşteri Adı",
                    companyName: selectedCustomer?.company || "Şirket Adı",
                    projectTitle: value.projectTitle || "Proje Başlığı",
                    date: new Date().toLocaleDateString('tr-TR'),
                    validUntil: value.validUntil ? new Date(value.validUntil).toLocaleDateString('tr-TR') : "-",
                    items,
                    subtotal,
                    tax,
                    total
                })
            }, 800) // 800ms debounce

            return () => clearTimeout(timer)
        })
        return () => subscription.unsubscribe()
    }, [form.watch, customers])

    const handleAiGenerate = async () => {
        const title = form.getValues("projectTitle")
        if (!title) {
            alert("Lütfen önce proje başlığı girin.")
            return
        }

        setAiLoading(true)
        const result = await generateProposalItems(title, tone)
        setAiLoading(false)

        if (result.success && result.items) {
            replace(result.items) // Mevcut listeyi AI önerisiyle değiştir
        } else {
            alert("AI önerisi alınamadı: " + result.error)
        }
    }

    const handleSave = async (status: 'draft' | 'sent') => {
        setSaving(true)
        const values = form.getValues()

        // Calculate totals
        const items = values.items.map((item) => ({
            ...item,
            total: item.quantity * item.unitPrice
        }))
        const subtotal = items.reduce((sum, item) => sum + item.total, 0)
        const tax = subtotal * 0.20
        const total = subtotal + tax

        const result = await saveProposal({
            ...values,
            status,
            totalAmount: total,
            currency: 'TL',
            taxRate: 20,
        })

        setSaving(false)

        if (result.success) {
            alert(status === 'draft' ? "Taslak kaydedildi!" : "Teklif kaydedildi!")
            // Redirect or reset could happen here
        } else {
            alert("Hata: " + result.error)
        }
    }

    return (
        <div className="grid h-[calc(100vh-100px)] grid-cols-1 gap-6 lg:grid-cols-2">
            {/* LEFT COLUMN: FORM */}
            <div className="flex flex-col gap-6 overflow-y-auto p-1">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>Teklif Detayları</CardTitle>
                        <SnippetBank onInsert={(text) => {
                            const currentNotes = form.getValues("notes") || ""
                            form.setValue("notes", currentNotes ? currentNotes + "\n\n" + text : text)
                        }} />
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="customerId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Müşteri</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Müşteri seçiniz" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {customers.map((c) => (
                                                        <SelectItem key={c.id} value={c.id}>
                                                            {c.name} {c.company ? `(${c.company})` : ''}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="projectTitle"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Proje Başlığı</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Örn: Tanıtım Filmi" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="validUntil"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Geçerlilik Tarihi</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-4">
                                    <h3 className="text-sm font-medium">Hizmet Kalemleri</h3>
                                    <div className="flex gap-2">
                                        <Select value={tone} onValueChange={(v: any) => setTone(v)}>
                                            <SelectTrigger className="w-[110px] h-8 text-xs">
                                                <SelectValue placeholder="Ton" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="corporate">Kurumsal</SelectItem>
                                                <SelectItem value="creative">Yaratıcı</SelectItem>
                                                <SelectItem value="friendly">Samimi</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select onValueChange={(value) => {
                                            const bundle = bundles.find(b => b.id === value)
                                            if (bundle && bundle.bundle_items) {
                                                const newItems = bundle.bundle_items.map((item: any) => ({
                                                    description: item.services?.name || "Hizmet",
                                                    quantity: item.quantity,
                                                    unitPrice: item.services?.price || 0
                                                }))
                                                append(newItems)
                                            }
                                        }}>
                                            <SelectTrigger className="w-[140px] h-8 text-xs">
                                                <SelectValue placeholder="Paket Ekle..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {bundles.map((b) => (
                                                    <SelectItem key={b.id} value={b.id}>
                                                        {b.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select onValueChange={(value) => {
                                            const service = services.find(s => s.id === value)
                                            if (service) {
                                                append({
                                                    description: service.name,
                                                    quantity: 1,
                                                    unitPrice: service.price || 0
                                                })
                                            }
                                        }}>
                                            <SelectTrigger className="w-[140px] h-8 text-xs">
                                                <SelectValue placeholder="Hizmet Ekle..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {services.map((s) => (
                                                    <SelectItem key={s.id} value={s.id}>
                                                        {s.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAiGenerate}
                                            disabled={aiLoading}
                                            className="text-purple-500 hover:text-purple-600 border-purple-200 hover:bg-purple-50"
                                        >
                                            {aiLoading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Wand2 className="mr-2 h-3 w-3" />}
                                            AI
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex items-start gap-2 rounded-md border p-3 bg-muted/30">
                                            <div className="grid flex-1 gap-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.description`}
                                                    render={({ field }) => (
                                                        <Input placeholder="Hizmet açıklaması" {...field} />
                                                    )}
                                                />
                                                <div className="grid grid-cols-2 gap-2">
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.quantity`}
                                                        render={({ field }) => (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-muted-foreground w-12">Miktar:</span>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    {...field}
                                                                    value={field.value ?? 1}
                                                                    onChange={e => field.onChange(e.target.valueAsNumber)}
                                                                />
                                                            </div>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.unitPrice`}
                                                        render={({ field }) => (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-muted-foreground w-12">Fiyat:</span>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    {...field}
                                                                    value={field.value ?? 0}
                                                                    onChange={e => field.onChange(e.target.valueAsNumber)}
                                                                />
                                                            </div>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => remove(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="w-full border-dashed"
                                        onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Kalem Ekle
                                    </Button>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notlar (Opsiyonel)</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Teklifin altına eklenecek notlar..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>

            {/* RIGHT COLUMN: PREVIEW */}
            <div className="flex flex-col gap-4 h-full">
                <div className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
                    <div className="text-sm font-medium">
                        Toplam Tutar: <span className="text-lg font-bold ml-2">{previewData?.total?.toLocaleString('tr-TR')} TL</span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => handleSave('draft')} disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Taslak Kaydet
                        </Button>

                        <Button onClick={() => handleSave('sent')} disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Kaydet ve Gönder
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto rounded-lg border bg-card p-6">
                    {previewData ? (
                        <div className="space-y-4">
                            <div className="border-b pb-4">
                                <h3 className="text-2xl font-bold">{previewData.projectTitle}</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {previewData.customerName} • {previewData.companyName}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold">Hizmet Kalemleri</h4>
                                {previewData.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between text-sm border-b pb-2">
                                        <span>{item.description}</span>
                                        <span className="font-medium">{item.total.toLocaleString('tr-TR')} TL</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4 space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>Ara Toplam:</span>
                                    <span>{previewData.subtotal.toLocaleString('tr-TR')} TL</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>KDV (%20):</span>
                                    <span>{previewData.tax.toLocaleString('tr-TR')} TL</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t pt-2">
                                    <span>Toplam:</span>
                                    <span>{previewData.total.toLocaleString('tr-TR')} TL</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            Önizleme için formu doldurun...
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
