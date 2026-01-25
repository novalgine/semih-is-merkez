"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Loader2, Calendar, Mail, Phone, FileText, Video, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

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
import { addInteraction, updateInteraction, deleteInteraction } from "@/app/actions/interactions"
import { useToast } from "@/hooks/use-toast"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const interactionSchema = z.object({
    customerId: z.string(),
    type: z.enum(['meeting', 'email', 'call', 'note']),
    content: z.string().min(1, "İçerik boş olamaz"),
    date: z.string(),
})

interface TimelineItem {
    id: string
    type: string // 'proposal' | 'shoot' | 'interaction' | 'meeting' | 'email' | 'call' | 'note'
    date: string
    // Proposal fields
    project_title?: string
    total_amount?: number
    // Shoot fields
    title?: string
    shoot_date?: string
    // Interaction fields
    content?: string
    status?: string
}

export function TimelineView({ customerId, items }: { customerId: string, items: TimelineItem[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [editingInteraction, setEditingInteraction] = useState<TimelineItem | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const { toast } = useToast()

    const form = useForm<z.infer<typeof interactionSchema>>({
        resolver: zodResolver(interactionSchema),
        defaultValues: {
            customerId: customerId,
            type: "note",
            content: "",
            date: new Date().toISOString().split('T')[0],
        },
    })

    async function onSubmit(values: z.infer<typeof interactionSchema>) {
        setLoading(true)
        try {
            let result
            if (editingInteraction) {
                result = await updateInteraction(editingInteraction.id, values)
            } else {
                result = await addInteraction(values)
            }

            if (result.success) {
                setOpen(false)
                setEditingInteraction(null)
                form.reset({
                    customerId: customerId,
                    type: "note",
                    content: "",
                    date: new Date().toISOString().split('T')[0],
                })
                toast({
                    title: editingInteraction ? "Güncellendi" : "Eklendi",
                    description: editingInteraction ? "Etkileşim başarıyla güncellendi." : "Etkileşim başarıyla eklendi."
                })
            } else {
                toast({
                    title: "Hata",
                    description: result.error || "Bir sorun oluştu.",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Hata",
                description: "Bir sorun oluştu.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    function handleEdit(item: TimelineItem) {
        setEditingInteraction(item)
        form.reset({
            customerId: customerId,
            type: item.type as any,
            content: item.content || "",
            date: new Date(item.date).toISOString().split('T')[0],
        })
        setOpen(true)
    }

    async function handleDelete(id: string) {
        try {
            const result = await deleteInteraction(id, customerId)
            if (result.success) {
                toast({
                    title: "Silindi",
                    description: "Etkileşim başarıyla silindi."
                })
            } else {
                toast({
                    title: "Hata",
                    description: result.error || "Silinirken bir sorun oluştu.",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Hata",
                description: "Bir sorun oluştu.",
                variant: "destructive"
            })
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-end">
                <Dialog open={open} onOpenChange={(isOpen) => {
                    setOpen(isOpen)
                    if (!isOpen) {
                        setEditingInteraction(null)
                        form.reset({
                            customerId: customerId,
                            type: "note",
                            content: "",
                            date: new Date().toISOString().split('T')[0],
                        })
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" /> Etkileşim Ekle
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingInteraction ? 'Etkileşim Düzenle' : 'Yeni Etkileşim Ekle'}</DialogTitle>
                            <DialogDescription>
                                {editingInteraction ? 'Etkileşim bilgilerini güncelleyin.' : 'Müşteriyle olan görüşme, mail veya notunuzu kaydedin.'}
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tür</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Tür seçiniz" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="note">Not</SelectItem>
                                                    <SelectItem value="meeting">Toplantı</SelectItem>
                                                    <SelectItem value="email">E-posta</SelectItem>
                                                    <SelectItem value="call">Telefon</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tarih</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="content"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>İçerik</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Detayları buraya yazın..." {...field} />
                                            </FormControl>
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
            </div>

            <Card>
                <CardContent className="pt-6">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                            <p>Henüz bir aktivite yok.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {items.map((item, index) => (
                                <div key={`${item.type}-${item.id}`} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`flex h-8 w-8 items-center justify-center rounded-full border 
                                            ${item.type === 'proposal' ? 'bg-blue-100 text-blue-600 border-blue-200' :
                                                item.type === 'shoot' ? 'bg-purple-100 text-purple-600 border-purple-200' :
                                                    'bg-orange-100 text-orange-600 border-orange-200'}`}>
                                            {item.type === 'proposal' && <FileText className="h-4 w-4" />}
                                            {item.type === 'shoot' && <Video className="h-4 w-4" />}
                                            {(item.type === 'interaction' || item.type === 'note') && <FileText className="h-4 w-4" />}
                                            {item.type === 'meeting' && <Calendar className="h-4 w-4" />}
                                            {item.type === 'email' && <Mail className="h-4 w-4" />}
                                            {item.type === 'call' && <Phone className="h-4 w-4" />}
                                        </div>
                                        {index !== items.length - 1 && (
                                            <div className="h-full w-px bg-border my-2" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1 pb-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium capitalize">
                                                {item.type === 'proposal' ? "Teklif Oluşturuldu" :
                                                    item.type === 'shoot' ? "Çekim Planlandı" :
                                                        item.type === 'interaction' ? "Etkileşim" :
                                                            item.type === 'note' ? 'Not' :
                                                                item.type === 'meeting' ? 'Toplantı' :
                                                                    item.type === 'email' ? 'E-posta' :
                                                                        item.type === 'call' ? 'Telefon' : item.type}
                                            </p>
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(item.date), 'd MMM yyyy', { locale: tr })}
                                            </span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {item.type === 'proposal' && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-medium text-foreground">{item.project_title}</span>
                                                    <div className="flex gap-2 items-center">
                                                        <Badge variant="outline" className="text-xs">{item.status}</Badge>
                                                        {item.total_amount && <span>{item.total_amount.toLocaleString('tr-TR')} TL</span>}
                                                    </div>
                                                </div>
                                            )}
                                            {item.type === 'shoot' && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-medium text-foreground">{item.title}</span>
                                                    <div className="flex gap-2 items-center">
                                                        <Badge variant="outline" className="text-xs">{item.status}</Badge>
                                                        {item.shoot_date && (
                                                            <span className="flex items-center gap-1 text-xs">
                                                                <Calendar className="h-3 w-3" />
                                                                {format(new Date(item.shoot_date), 'd MMM yyyy', { locale: tr })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {['interaction', 'note', 'meeting', 'email', 'call'].includes(item.type) && (
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="whitespace-pre-wrap flex-1">{item.content}</p>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() => handleEdit(item)}
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-destructive hover:text-destructive"
                                                            onClick={() => setDeletingId(item.id)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu işlem geri alınamaz. Bu etkileşim kalıcı olarak silinecektir.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingId && handleDelete(deletingId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Sil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
