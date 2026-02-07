export interface ProposalItemInput {
  description: string
  quantity: number
  unitPrice: number
}

export interface SaveProposalInput {
  customerId: string
  projectTitle: string
  status: string
  totalAmount: number
  currency: string
  taxRate: number
  validUntil: string | null
  notes: string | null
  items: ProposalItemInput[]
}
