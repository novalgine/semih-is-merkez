"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Loader2, Video, Film, Edit, Trash2 } from "lucide-react"

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
import { addProject, updateProject, deleteProject } from "@/app/actions/projects"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const projectSchema = z.object({
    customerId: z.string(),
    title: z.string().min(2, "Proje adı en az 2 karakter olmalı"),
    status: z.enum(['proposal', 'planning', 'shooting', 'editing', 'in-progress', 'completed']),
    budget: z.coerce.number().optional(),
    deadline: z.string().optional(),
})

interface Project {
    id: string
    name: string
    status: 'proposal' | 'planning' | 'shooting' | 'editing' | 'in-progress' | 'completed'
    budget: number | null
    deadline: string | null
}

export function ProjectList({ customerId, projects }: { customerId: string, projects: Project[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [editingProject, setEditingProject] = useState<Project | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const { toast } = useToast()

    const form = useForm<z.infer<typeof projectSchema>>({
        resolver: zodResolver(projectSchema) as any,
        defaultValues: {
            customerId: customerId,
            title: "",
            status: "proposal",
            budget: 0,
            deadline: "",
        },
    })

    async function onSubmit(values: z.infer<typeof projectSchema>) {
        setLoading(true)
        try {
            let result
            if (editingProject) {
                result = await updateProject(editingProject.id, values)
            } else {
                result = await addProject(values)
            }

            if (result.success) {
                setOpen(false)
                setEditingProject(null)
                form.reset({
                    customerId: customerId,
                    title: "",
                    status: "proposal",
                    budget: 0,
                    deadline: "",
                })
                toast({
                    title: editingProject ? "Güncellendi" : "Eklendi",
                    description: editingProject ? "Proje başarıyla güncellendi." : "Proje başarıyla eklendi."
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

    function handleEdit(project: Project) {
        setEditingProject(project)
        form.reset({
            customerId: customerId,
            title: project.name,
            status: project.status,
            budget: project.budget || 0,
            deadline: project.deadline || "",
        })
        setOpen(true)
    }

    async function handleDelete(id: string) {
        try {
            const result = await deleteProject(id, customerId)
            if (result.success) {
                toast({
                    title: "Silindi",
                    description: "Proje başarıyla silindi."
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

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'proposal': return 'Teklif';
            case 'planning': return 'Planlama';
            case 'shooting': return 'Çekim';
            case 'editing': return 'Kurgu';
            case 'in-progress': return 'Yürütülüyor';
            case 'completed': return 'Tamamlandı';
            default: return status;
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-end">
                <Dialog open={open} onOpenChange={(isOpen) => {
                    setOpen(isOpen)
                    if (!isOpen) {
                        setEditingProject(null)
                        form.reset({
                            customerId: customerId,
                            title: "",
                            status: "proposal",
                            budget: 0,
                            deadline: "",
                        })
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" /> Proje Ekle
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingProject ? 'Proje Düzenle' : 'Yeni Proje Ekle'}</DialogTitle>
                            <DialogDescription>
                                {editingProject ? 'Proje bilgilerini güncelleyin.' : 'Müşteri için yeni bir proje oluşturun.'}
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Proje Adı</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Örn: Tanıtım Filmi" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
                                                    <SelectItem value="proposal">Teklif Aşamasında</SelectItem>
                                                    <SelectItem value="planning">Planlama</SelectItem>
                                                    <SelectItem value="shooting">Çekim</SelectItem>
                                                    <SelectItem value="editing">Kurgu</SelectItem>
                                                    <SelectItem value="in-progress">Yürütülüyor</SelectItem>
                                                    <SelectItem value="completed">Tamamlandı</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="budget"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bütçe (TL)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="0" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="deadline"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Teslim Tarihi</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
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

            <div className="space-y-4">
                {projects.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                            <p>Aktif proje bulunmuyor.</p>
                            <p className="text-sm">Yukarıdaki butonu kullanarak ekleyebilirsiniz.</p>
                        </CardContent>
                    </Card>
                ) : (
                    projects.map((project) => (
                        <Card key={project.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="flex items-center gap-2">
                                    <Video className="h-4 w-4 text-muted-foreground" />
                                    <CardTitle className="text-base font-medium">
                                        {project.name}
                                    </CardTitle>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{getStatusLabel(project.status)}</Badge>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleEdit(project)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                        onClick={() => setDeletingId(project.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-2 text-sm text-muted-foreground">
                                {project.budget && (
                                    <div className="flex justify-between">
                                        <span>Bütçe:</span>
                                        <span className="font-medium text-foreground">{project.budget.toLocaleString('tr-TR')} TL</span>
                                    </div>
                                )}
                                {project.deadline && (
                                    <div className="flex justify-between">
                                        <span>Teslim:</span>
                                        <span>{new Date(project.deadline).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu işlem geri alınamaz. Bu proje kalıcı olarak silinecektir.
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
