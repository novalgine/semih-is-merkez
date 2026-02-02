'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

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
import { createTask } from '@/app/actions/tasks';

const taskSchema = z.object({
    content: z.string().min(1, 'Görev içeriği boş olamaz'),
    description: z.string().optional(),
    category: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']),
    assigned_date: z.string().optional(), // YYYY-MM-DD format
});

type TaskSchemaCheck = z.infer<typeof taskSchema>;

interface AddTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialDate?: string | null;
    onTaskCreated?: () => void;
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

const PRIORITIES = [
    { value: 'low', label: 'Düşük', color: 'text-blue-500' },
    { value: 'medium', label: 'Orta', color: 'text-amber-500' },
    { value: 'high', label: 'Yüksek', color: 'text-red-500' },
] as const;

export function AddTaskDialog({ open, onOpenChange, initialDate, onTaskCreated }: AddTaskDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<TaskSchemaCheck>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            content: '',
            description: '',
            category: "To-Do",
            priority: 'medium',
            assigned_date: initialDate || format(new Date(), 'yyyy-MM-dd'),
        },
    });

    // Reset form when initialDate changes or dialog opens
    useEffect(() => {
        if (open) {
            form.reset({
                content: '',
                description: '',
                category: "To-Do",
                priority: 'medium',
                assigned_date: initialDate || format(new Date(), 'yyyy-MM-dd'),
            });
        }
    }, [open, initialDate, form]);

    const onSubmit = async (values: TaskSchemaCheck) => {
        setIsLoading(true);
        try {
            const result = await createTask(
                values.content,
                values.assigned_date,
                values.category,
                values.priority,
                values.description
            );

            if (result.success) {
                toast({ title: 'Başarılı', description: 'Görev oluşturuldu' });
                onOpenChange(false);
                if (onTaskCreated) onTaskCreated();
            } else {
                toast({ title: 'Hata', description: 'Görev oluşturulamadı: ' + result.error, variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Hata', description: 'Bir hata oluştu', variant: 'destructive' });
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Yeni Görev Ekle</DialogTitle>
                    <DialogDescription>
                        Planladığınız görevi detaylandırın.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Başlık</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Görev nedir?"
                                            {...field}
                                            autoFocus
                                        />
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
                                        <Textarea
                                            placeholder="Detaylı açıklama (opsiyonel)"
                                            className="resize-none h-20"
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
                                        <Select onValueChange={field.onChange} value={field.value}>
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
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Öncelik</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Öncelik seç" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {PRIORITIES.map(prio => (
                                                    <SelectItem key={prio.value} value={prio.value}>
                                                        <span className={prio.color}>{prio.label}</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                İptal
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Oluştur
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
