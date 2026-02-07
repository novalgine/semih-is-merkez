'use server'

import { revalidatePath } from 'next/cache'
import {
  createExpenseRecord,
  createExpenseTemplate,
  createIncomeRecord,
  createIncomeTemplate,
  getFinancialOverview,
  listExpenseTemplates,
  listExpenses,
  listIncomeTemplates,
  listIncomes,
  removeExpense,
  removeTemplate,
} from '@/lib/services/finance-service'
import type { ActionResponse } from '@/types/action-response'
import type {
  CreateExpenseInput,
  CreateExpenseTemplateInput,
  CreateIncomeInput,
  CreateIncomeTemplateInput,
} from '@/types/finance'

export interface ExpenseFormValues {
  description: string
  amount: number
  category: string
  date: string
}

export async function addExpense(data: ExpenseFormValues): Promise<ActionResponse<null>> {
  const result = await createExpenseRecord({
    description: data.description,
    amount: data.amount,
    category: data.category,
    date: new Date(data.date).toISOString(),
  })

  if (!result.success) {
    console.error('Add Expense Error:', result.error)
    return result
  }

  revalidatePath('/finance/expenses')
  revalidatePath('/')
  return result
}

export async function getExpenses() {
  const result = await listExpenses()
  if (!result.success) {
    console.error('Get Expenses Error:', result.error)
    return []
  }

  return result.data || []
}

export async function deleteExpense(id: string): Promise<ActionResponse<null>> {
  const result = await removeExpense(id)
  if (!result.success) {
    console.error('Delete Expense Error:', result.error)
    return result
  }

  revalidatePath('/finance/expenses')
  revalidatePath('/')
  return result
}

export async function createExpense(data: CreateExpenseInput): Promise<ActionResponse<null>> {
  const result = await createExpenseRecord(data)
  if (!result.success) {
    console.error('Create Expense Error:', result.error)
    return result
  }

  revalidatePath('/finance')
  return result
}

export async function addIncome(data: CreateIncomeInput): Promise<ActionResponse<null>> {
  const result = await createIncomeRecord(data)
  if (!result.success) {
    console.error('Add Income Error:', result.error)
    return result
  }

  revalidatePath('/finance')
  revalidatePath('/')
  return result
}

export async function getIncomes() {
  const result = await listIncomes()
  if (!result.success) {
    console.error('Get Incomes Error:', result.error)
    return []
  }

  return result.data || []
}

export async function getFinancialBigPicture(months = 6) {
  return getFinancialOverview(months)
}

export async function getExpenseTemplates() {
  const result = await listExpenseTemplates()
  if (!result.success) {
    console.error('Get Expense Templates Error:', result.error)
    return []
  }

  return result.data || []
}

export async function getIncomeTemplates() {
  const result = await listIncomeTemplates()
  if (!result.success) {
    console.error('Get Income Templates Error:', result.error)
    return []
  }

  return result.data || []
}

export async function addExpenseTemplate(data: CreateExpenseTemplateInput): Promise<ActionResponse<null>> {
  const result = await createExpenseTemplate(data)
  if (!result.success) return result

  revalidatePath('/finance')
  return result
}

export async function addIncomeTemplate(data: CreateIncomeTemplateInput): Promise<ActionResponse<null>> {
  const result = await createIncomeTemplate(data)
  if (!result.success) return result

  revalidatePath('/finance')
  return result
}

export async function deleteTemplate(type: 'income' | 'expense', id: string): Promise<ActionResponse<null>> {
  const result = await removeTemplate(type, id)
  if (!result.success) return result

  revalidatePath('/finance')
  return result
}
