'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Trash2 } from 'lucide-react';
import { format } from "date-fns";
import { tr } from "date-fns/locale";

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from '@/components/ui/textarea';
import { deleteTask, updateTask } from '@/app/actions/tasks';
import { toast } from 'sonner';

const taskSchema = z.object({
    content: z.string().min(1, 'Görev içeriği boş olamaz'),
    category: z.string().optional(),
    assigned_date: z.string().optional(), // YYYY-MM-DD format
});

type TaskSchemaCheck = z.infer<typeof taskSchema>;

interface EditTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: {
        id: string;
        content: string;
        category?: string | null;
        assigned_date?: string | null;
        is_completed: boolean;
    };
    onTaskUpdated?: () => void;
}

const CATEGORIES = [
    "To-Do",
    "Idea",
    "Meeting",
    "Finance",
    "Urgent",
    "Thought",
    "Personal",
    "Other"
];

export function EditTaskDialog({ open, onOpenChange, task, onTaskUpdated }: EditTaskDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const form = useForm<TaskSchemaCheck>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            content: task.content,
            category: task.category || "To-Do",
            assigned_date: task.assigned_date || format(new Date(), 'yyyy-MM-dd'),
        },
    });

    // Reset form when task changes
    // useEffect(() => {
    //     if (open) {
    //        form.reset(...) 
    //     }
    // }, [open, task, form]);
    // Note: Ideally use useEffect to sync prop changes to form, strictly relying on key prop on parent is simpler.

    const onSubmit = async (values: TaskSchemaCheck) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('id', task.id);
            formData.append('content', values.content);
            if (values.category) formData.append('category', values.category);
            if (values.assigned_date) formData.append('assigned_date', values.assigned_date);

            // Keep existing completion status
            formData.append('is_completed', String(task.is_completed));

            const result = await updateTask(formData);

            if (result.success) {
                toast.success('Görev güncellendi');
                onOpenChange(false);
                if (onTaskUpdated) onTaskUpdated();
            } else {
                toast.error('Güncelleme başarısız: ' + result.error);
            }
        } catch (error) {
            toast.error('Bir hata oluştu');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Bu görevi silmek istediğinize emin misiniz?")) return;

        setIsDeleting(true);
        try {
            const result = await deleteTask(task.id, '/');
            if (result.success) {
                toast.success('Görev silindi');
                onOpenChange(false);
                if (onTaskUpdated) onTaskUpdated();
            } else {
                toast.error('Silme işlemi başarısız');
            }
        } catch (error) {
            toast.error('Hata oluştu');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Görevi Düzenle</DialogTitle>
                    <DialogDescription>
                        Görev detaylarını güncelleyin veya silin.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>İçerik</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Görev nedir?"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Etiket</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Kategori seç" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {CATEGORIES.map(cat => (
                                                    <SelectItem key={cat} value={cat}>
                                                        {cat}
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
                                name="assigned_date"
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
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={handleDelete}
                                disabled={isDeleting || isLoading}
                                className='mr-auto'
                            >
                                {isDeleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                            </Button>

                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                İptal
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Kaydet
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
