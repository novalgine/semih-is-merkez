"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Loader2, Video, Film, Edit } from "lucide-react"

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
import { addProject } from "@/app/actions/projects"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const projectSchema = z.object({
    customerId: z.string(),
    title: z.string().min(2, "Proje adı en az 2 karakter olmalı"),
    status: z.enum(['proposal', 'planning', 'shooting', 'editing', 'completed']),
    budget: z.coerce.number().optional(),
    deadline: z.string().optional(),
})

interface Project {
    id: string
    title: string
    status: 'proposal' | 'planning' | 'shooting' | 'editing' | 'completed'
    budget: number | null
    deadline: string | null
}

export function ProjectList({ customerId, projects }: { customerId: string, projects: Project[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

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
            const result = await addProject(values)
            if (result.success) {
                setOpen(false)
                form.reset({
                    customerId: customerId,
                    title: "",
                    status: "proposal",
                    budget: 0,
                    deadline: "",
                })
            } else {
                console.error(result.error)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'proposal': return 'Teklif';
            case 'planning': return 'Planlama';
            case 'shooting': return 'Çekim';
            case 'editing': return 'Kurgu';
            case 'completed': return 'Tamamlandı';
            default: return status;
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-end">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" /> Proje Ekle
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Yeni Proje Ekle</DialogTitle>
                            <DialogDescription>
                                Müşteri için yeni bir proje oluşturun.
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
                                        {project.title}
                                    </CardTitle>
                                </div>
                                <Badge variant="outline">{getStatusLabel(project.status)}</Badge>
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
        </div>
    )
}
