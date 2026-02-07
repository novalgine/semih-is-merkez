import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

import { createClient } from '@/lib/supabase/server'
import { fail, ok, type ActionResponse } from '@/types/action-response'
import type {
  CreateExpenseInput,
  CreateExpenseTemplateInput,
  CreateIncomeInput,
  CreateIncomeTemplateInput,
} from '@/types/finance'

export async function createExpenseRecord(data: CreateExpenseInput): Promise<ActionResponse<null>> {
  const supabase = await createClient()
  const { error } = await supabase.from('expenses').insert({
    amount: data.amount,
    category: data.category,
    description: data.description,
    date: data.date,
    created_at: new Date().toISOString(),
  })

  if (error) return fail(error, 'Gider eklenemedi.')
  return ok(null)
}

export async function listExpenses(): Promise<ActionResponse<Record<string, unknown>[]>> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false })

  if (error) return fail(error, 'Giderler alınamadı.')
  return ok(data || [])
}

export async function removeExpense(id: string): Promise<ActionResponse<null>> {
  const supabase = await createClient()
  const { error } = await supabase.from('expenses').delete().eq('id', id)

  if (error) return fail(error, 'Gider silinemedi.')
  return ok(null)
}

export async function createIncomeRecord(data: CreateIncomeInput): Promise<ActionResponse<null>> {
  const supabase = await createClient()
  const { error } = await supabase.from('incomes').insert({
    amount: data.amount,
    category: data.category,
    description: data.description,
    date: data.date,
    customer_id: data.customer_id || null,
    source: 'manual',
  })

  if (error) return fail(error, 'Gelir eklenemedi.')
  return ok(null)
}

export async function listIncomes(): Promise<ActionResponse<Record<string, unknown>[]>> {
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

  if (error) return fail(error, 'Gelirler alınamadı.')
  return ok(data || [])
}

export async function getFinancialOverview(months = 6) {
  const supabase = await createClient()
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1)

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

  const bins: Record<string, { income: number; expense: number; label: string }> = {}
  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = format(d, 'yyyy-MM')
    bins[key] = { income: 0, expense: 0, label: format(d, 'MMM', { locale: tr }) }
  }

  expenses?.forEach((e) => {
    const key = e.date.substring(0, 7)
    if (bins[key]) bins[key].expense += Number(e.amount)
  })

  manualIncomes?.forEach((i) => {
    const key = i.date.substring(0, 7)
    if (bins[key]) bins[key].income += Number(i.amount)
  })

  proposals?.forEach((p) => {
    const key = p.created_at.substring(0, 7)
    if (bins[key]) bins[key].income += Number(p.total_amount)
  })

  return Object.values(bins).reverse()
}

export async function listExpenseTemplates(): Promise<ActionResponse<Record<string, unknown>[]>> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('expense_templates').select('*').order('name')
  if (error) return fail(error, 'Gider şablonları alınamadı.')
  return ok(data || [])
}

export async function listIncomeTemplates(): Promise<ActionResponse<Record<string, unknown>[]>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('income_templates')
    .select(`
      *,
      customers (
        name
      )
    `)
    .order('name')

  if (error) return fail(error, 'Gelir şablonları alınamadı.')
  return ok(data || [])
}

export async function createExpenseTemplate(data: CreateExpenseTemplateInput): Promise<ActionResponse<null>> {
  const supabase = await createClient()
  const { error } = await supabase.from('expense_templates').insert(data)
  if (error) return fail(error, 'Gider şablonu eklenemedi.')
  return ok(null)
}

export async function createIncomeTemplate(data: CreateIncomeTemplateInput): Promise<ActionResponse<null>> {
  const supabase = await createClient()
  const { error } = await supabase.from('income_templates').insert(data)
  if (error) return fail(error, 'Gelir şablonu eklenemedi.')
  return ok(null)
}

export async function removeTemplate(type: 'income' | 'expense', id: string): Promise<ActionResponse<null>> {
  const supabase = await createClient()
  const table = type === 'income' ? 'income_templates' : 'expense_templates'
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) return fail(error, 'Şablon silinemedi.')
  return ok(null)
}
