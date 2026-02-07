import { createClient } from '@/lib/supabase/server'
import { fail, failMessage, ok, type ActionResponse } from '@/types/action-response'
import type { SaveProposalInput } from '@/types/proposals'

export async function createProposal(payload: SaveProposalInput): Promise<ActionResponse<{ id: string }>> {
  const supabase = await createClient()

  const { data: proposal, error: proposalError } = await supabase
    .from('proposals')
    .insert({
      customer_id: payload.customerId,
      project_title: payload.projectTitle,
      status: payload.status,
      total_amount: payload.totalAmount,
      currency: payload.currency,
      tax_rate: payload.taxRate,
      valid_until: payload.validUntil,
      notes: payload.notes,
    })
    .select()
    .single()

  if (proposalError) return fail(proposalError, 'Teklif kaydedilemedi.')

  const items = payload.items.map((item, index) => ({
    proposal_id: proposal.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    order_index: index,
  }))

  const { error: itemsError } = await supabase.from('proposal_items').insert(items)
  if (itemsError) return fail(itemsError, 'Teklif kalemleri kaydedilemedi.')

  return ok({ id: proposal.id })
}

export async function findProposal(id: string): Promise<ActionResponse<Record<string, unknown>>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('proposals')
    .select(`
      *,
      customers (name, company, email, phone, address),
      proposal_items (*)
    `)
    .eq('id', id)
    .single()

  if (error) return fail(error, 'Teklif bulunamadı.')
  return ok(data)
}

export async function listProposals(): Promise<ActionResponse<Record<string, unknown>[]>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('proposals')
    .select(`
      *,
      customers (name, company)
    `)
    .order('created_at', { ascending: false })

  if (error) return fail(error, 'Teklif listesi alınamadı.')
  return ok(data || [])
}

export async function removeProposal(id: string): Promise<ActionResponse<null>> {
  const supabase = await createClient()
  const { error } = await supabase.from('proposals').delete().eq('id', id)
  if (error) return fail(error, 'Teklif silinemedi.')
  return ok(null)
}

export async function cloneProposal(id: string): Promise<ActionResponse<{ id: string }>> {
  const supabase = await createClient()
  const { data: original, error: fetchError } = await supabase
    .from('proposals')
    .select('*, proposal_items (*)')
    .eq('id', id)
    .single()

  if (fetchError || !original) return failMessage('Proposal not found')

  const { data: newProposal, error: createError } = await supabase
    .from('proposals')
    .insert({
      customer_id: original.customer_id,
      project_title: `Copy of ${original.project_title}`,
      status: 'draft',
      total_amount: original.total_amount,
      currency: original.currency,
      tax_rate: original.tax_rate,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: original.notes,
    })
    .select()
    .single()

  if (createError) return fail(createError, 'Teklif kopyalanamadı.')

  if (original.proposal_items?.length) {
    const itemsToInsert = original.proposal_items.map((item: { description: string; quantity: number; unit_price: number; order_index: number }) => ({
      proposal_id: newProposal.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      order_index: item.order_index,
    }))

    const { error: itemsError } = await supabase.from('proposal_items').insert(itemsToInsert)
    if (itemsError) return fail(itemsError, 'Teklif kalemleri kopyalanamadı.')
  }

  return ok({ id: newProposal.id })
}

export async function proposalToShoot(id: string): Promise<ActionResponse<{ id: string }>> {
  const supabase = await createClient()
  const { data: proposal, error: fetchError } = await supabase.from('proposals').select('*').eq('id', id).single()
  if (fetchError || !proposal) return failMessage('Proposal not found')

  const { data: shoot, error: createError } = await supabase
    .from('shoots')
    .insert({
      customer_id: proposal.customer_id,
      title: proposal.project_title,
      shoot_date: proposal.valid_until,
      notes: `${proposal.notes || ''}\n\nGenerated from Proposal: ${proposal.project_title}`,
      status: 'planned',
      equipment_list: '[]',
    })
    .select()
    .single()

  if (createError) return fail(createError, 'Çekim oluşturulamadı.')
  return ok({ id: shoot.id })
}

export async function setProposalPaymentStatus(
  proposalId: string,
  status: 'Paid' | 'Pending',
): Promise<ActionResponse<null>> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('proposals')
    .update({
      payment_status: status,
      paid_at: status === 'Paid' ? new Date().toISOString() : null,
    })
    .eq('id', proposalId)

  if (error) return fail(error, 'Ödeme durumu güncellenemedi.')
  return ok(null)
}
