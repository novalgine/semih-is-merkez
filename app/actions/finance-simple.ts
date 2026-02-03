'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Unified transaction type
interface TransactionData {
    type: 'income' | 'expense';
    amount: number;
    date: string;
    category: string;
    description: string;
}

export async function addTransaction(data: TransactionData) {
    const supabase = await createClient()

    console.log('Adding transaction:', data)

    if (data.type === 'expense') {
        const insertData = {
            amount: data.amount,
            category: data.category,
            description: data.description,
            date: data.date,
        }
        console.log('Inserting expense:', insertData)

        const { data: result, error } = await supabase.from('expenses').insert(insertData).select()

        if (error) {
            console.error('Add Expense Error:', error)
            return { success: false, error: error.message }
        }
        console.log('Expense inserted:', result)

    } else {
        const { error } = await supabase.from('incomes').insert({
            amount: data.amount,
            category: data.category,
            description: data.description,
            date: data.date,
            source: 'manual'
        })

        if (error) {
            console.error('Add Income Error:', error)
            return { success: false, error: error.message }
        }
    }

    revalidatePath('/finance')
    return { success: true }
}

export async function deleteTransaction(id: string, type: 'income' | 'expense') {
    const supabase = await createClient()

    const table = type === 'expense' ? 'expenses' : 'incomes'
    const { error } = await supabase.from(table).delete().eq('id', id)

    if (error) {
        console.error('Delete Error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/finance')
    return { success: true }
}

export async function getAllTransactions() {
    const supabase = await createClient()

    // Fetch expenses
    const { data: expenses, error: expError } = await supabase
        .from('expenses')
        .select('id, amount, date, category, description')
        .order('date', { ascending: false })

    // Fetch incomes  
    const { data: incomes, error: incError } = await supabase
        .from('incomes')
        .select('id, amount, date, category, description')
        .order('date', { ascending: false })

    if (expError) console.error('Expenses Error:', expError)
    if (incError) console.error('Incomes Error:', incError)

    // Combine and format
    const expenseList = (expenses || []).map(e => ({
        id: e.id,
        type: 'expense' as const,
        amount: Number(e.amount),
        date: e.date,
        category: e.category || 'Diğer',
        description: e.description || ''
    }))

    const incomeList = (incomes || []).map(i => ({
        id: i.id,
        type: 'income' as const,
        amount: Number(i.amount),
        date: i.date,
        category: i.category || 'Diğer',
        description: i.description || ''
    }))

    // Merge and sort by date
    const all = [...expenseList, ...incomeList].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    return all
}

export async function getFinancialTotals() {
    const supabase = await createClient()

    const { data: expenses } = await supabase.from('expenses').select('amount')
    const { data: incomes } = await supabase.from('incomes').select('amount')
    const { data: proposals } = await supabase
        .from('proposals')
        .select('total_amount')
        .eq('payment_status', 'Paid')

    const totalExpense = (expenses || []).reduce((sum, e) => sum + Number(e.amount), 0)
    const manualIncome = (incomes || []).reduce((sum, i) => sum + Number(i.amount), 0)
    const proposalIncome = (proposals || []).reduce((sum, p) => sum + Number(p.total_amount), 0)
    const totalIncome = manualIncome + proposalIncome

    return {
        totalIncome,
        totalExpense,
        netWealth: totalIncome - totalExpense
    }
}
