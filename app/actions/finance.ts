'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const expenseSchema = z.object({
    description: z.string().min(2, "Açıklama en az 2 karakter olmalı"),
    amount: z.coerce.number().min(0, "Tutar 0'dan küçük olamaz"),
    category: z.string().min(1, "Kategori seçilmeli"),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), "Geçersiz tarih"),
})

export type ExpenseFormValues = z.infer<typeof expenseSchema>

export async function addExpense(data: ExpenseFormValues) {
    const supabase = await createClient()

    const { error } = await supabase.from('expenses').insert({
        description: data.description,
        amount: data.amount,
        category: data.category,
        date: new Date(data.date).toISOString(),
    })

    if (error) {
        console.error('Add Expense Error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/finance/expenses')
    revalidatePath('/') // Dashboard'u da güncelle (Net Kar için)
    return { success: true }
}

export async function getExpenses() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false })

    if (error) {
        console.error('Get Expenses Error:', error)
        return []
    }

    return data
}

export async function deleteExpense(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Delete Expense Error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/finance/expenses')
    revalidatePath('/')
    return { success: true }
}
