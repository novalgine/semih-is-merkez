"use client"

import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { deleteExpense } from "@/app/actions/finance"
import { useToast } from "@/hooks/use-toast"

interface Expense {
    id: string
    description: string
    amount: number
    category: string
    date: string
}

export function ExpenseList({ expenses }: { expenses: Expense[] }) {
    const { toast } = useToast()

    const handleDelete = async (id: string) => {
        if (!confirm("Bu gideri silmek istediğinize emin misiniz?")) return

        const result = await deleteExpense(id)
        if (result.success) {
            toast({ title: "Silindi", description: "Gider başarıyla silindi." })
        } else {
            toast({ title: "Hata", description: "Silinirken bir sorun oluştu.", variant: "destructive" })
        }
    }

    if (expenses.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground border rounded-lg bg-muted/20">
                Henüz kayıtlı gider yok.
            </div>
        )
    }

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Açıklama</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead className="text-right">Tutar</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {expenses.map((expense) => (
                        <TableRow key={expense.id}>
                            <TableCell className="font-medium">
                                {format(new Date(expense.date), "d MMM yyyy", { locale: tr })}
                            </TableCell>
                            <TableCell>{expense.description}</TableCell>
                            <TableCell>
                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                    {expense.category}
                                </span>
                            </TableCell>
                            <TableCell className="text-right font-bold">
                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(expense.amount)}
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDelete(expense.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
