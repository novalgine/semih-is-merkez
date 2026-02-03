'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
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

export async function createExpense(data: {
    amount: number;
    category: string;
    description: string | null;
    date: string;
}) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('expenses')
        .insert({
            amount: data.amount,
            category: data.category,
            description: data.description,
            date: data.date,
            created_at: new Date().toISOString(),
        });

    if (error) {
        console.error("Error creating expense:", error);
        throw new Error("Gider eklenemedi");
    }

    revalidatePath('/finance');
    return { success: true };
}

// --- INCOME ACTIONS ---

export async function addIncome(data: {
    amount: number;
    category: string;
    description: string;
    date: string;
    customer_name?: string;
    customer_id?: string;
}) {
    const supabase = await createClient()

    const { error } = await supabase.from('incomes').insert({
        amount: data.amount,
        category: data.category,
        description: data.description,
        date: data.date,
        customer_id: data.customer_id || null,
        source: 'manual'
    })

    if (error) {
        console.error('Add Income Error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/finance')
    revalidatePath('/')
    return { success: true }
}

export async function getIncomes() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('incomes')
        .select(`
            *,
            customers (
                name
            )
        `)
        .order('date', { ascending: false })

    if (error) {
        console.error('Get Incomes Error:', error)
        return []
    }
    return data
}

// --- ANALYTICS ---

export async function getFinancialBigPicture(months: number = 6) {
    const supabase = await createClient()

    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1)

    // Fetch all relevant data
    const { data: expenses } = await supabase
        .from('expenses')
        .select('amount, date')
        .eq('status', 'confirmed')
        .gte('date', startDate.toISOString().split('T')[0])

    const { data: manualIncomes } = await supabase
        .from('incomes')
        .select('amount, date')
        .gte('date', startDate.toISOString().split('T')[0])

    const { data: proposals } = await supabase
        .from('proposals')
        .select('total_amount, created_at')
        .eq('payment_status', 'Paid')
        .gte('created_at', startDate.toISOString())

    // Generate monthly bins
    const bins: Record<string, { income: number, expense: number, label: string }> = {}

    for (let i = 0; i < months; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = format(d, 'yyyy-MM')
        bins[key] = {
            income: 0,
            expense: 0,
            label: format(d, 'MMM', { locale: tr })
        }
    }

    // Fill bins
    expenses?.forEach(e => {
        const key = e.date.substring(0, 7)
        if (bins[key]) bins[key].expense += Number(e.amount)
    })

    manualIncomes?.forEach(i => {
        const key = i.date.substring(0, 7)
        if (bins[key]) bins[key].income += Number(i.amount)
    })

    proposals?.forEach(p => {
        const key = p.created_at.substring(0, 7)
        if (bins[key]) bins[key].income += Number(p.total_amount)
    })

    return Object.values(bins).reverse()
}


// --- TEMPLATE ACTIONS ---

export async function getExpenseTemplates() {
    const supabase = await createClient()
    const { data } = await supabase.from('expense_templates').select('*').order('name')
    return data || []
}

export async function getIncomeTemplates() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('income_templates')
        .select(`
            *,
            customers (
                name
            )
        `)
        .order('name')
    return data || []
}

export async function addExpenseTemplate(data: { name: string, default_amount: number, category: string, is_mandatory: boolean }) {
    const supabase = await createClient()
    const { error } = await supabase.from('expense_templates').insert(data)
    if (error) return { success: false, error: error.message }
    revalidatePath('/finance')
    return { success: true }
}

export async function addIncomeTemplate(data: { name: string, default_amount: number, category: string, customer_id?: string }) {
    const supabase = await createClient()
    const { error } = await supabase.from('income_templates').insert(data)
    if (error) return { success: false, error: error.message }
    revalidatePath('/finance')
    return { success: true }
}

export async function deleteTemplate(type: 'income' | 'expense', id: string) {
    const supabase = await createClient()
    const table = type === 'income' ? 'income_templates' : 'expense_templates'
    await supabase.from(table).delete().eq('id', id)
    revalidatePath('/finance')
    return { success: true }
}


