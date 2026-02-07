export interface CreateExpenseInput {
  amount: number
  category: string
  description: string | null
  date: string
}

export interface CreateIncomeInput {
  amount: number
  category: string
  description: string
  date: string
  customer_name?: string
  customer_id?: string
}

export interface CreateExpenseTemplateInput {
  name: string
  default_amount: number
  category: string
  is_mandatory: boolean
}

export interface CreateIncomeTemplateInput {
  name: string
  default_amount: number
  category: string
  customer_id?: string
}
