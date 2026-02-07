'use server'

import { revalidatePath } from 'next/cache'

import {
  cloneProposal,
  createProposal,
  findProposal,
  listProposals,
  proposalToShoot,
  removeProposal,
  setProposalPaymentStatus,
} from '@/lib/services/proposals-service'
import type { ActionResponse } from '@/types/action-response'
import type { SaveProposalInput } from '@/types/proposals'

export async function saveProposal(data: SaveProposalInput): Promise<ActionResponse<{ id: string }>> {
  const result = await createProposal(data)
  if (!result.success) {
    console.error('Proposal Save Error:', result.error)
    return result
  }

  revalidatePath('/proposals')
  return result
}

export async function getProposal(id: string) {
  const result = await findProposal(id)
  if (!result.success) {
    console.error('Get Proposal Error:', result.error)
    return null
  }

  return result.data
}

export async function getProposals() {
  const result = await listProposals()
  if (!result.success) {
    console.error('Get Proposals Error:', result.error)
    return []
  }

  return result.data || []
}

export async function deleteProposal(id: string): Promise<ActionResponse<null>> {
  const result = await removeProposal(id)
  if (!result.success) {
    console.error('Delete Proposal Error:', result.error)
    return result
  }

  revalidatePath('/proposals')
  return result
}

export async function duplicateProposal(id: string): Promise<ActionResponse<{ id: string }>> {
  const result = await cloneProposal(id)
  if (!result.success) {
    console.error('Duplicate Proposal Error:', result.error)
    return result
  }

  revalidatePath('/proposals')
  return result
}

export async function convertProposalToShoot(
  id: string,
): Promise<ActionResponse<{ id: string }>> {
  const result = await proposalToShoot(id)
  if (!result.success) {
    console.error('Convert Proposal To Shoot Error:', result.error)
    return result
  }

  revalidatePath('/shoots')
  return result
}

export async function markProposalAsPaid(proposalId: string): Promise<ActionResponse<null>> {
  const result = await setProposalPaymentStatus(proposalId, 'Paid')
  if (!result.success) {
    console.error('Mark as Paid Error:', result.error)
    return result
  }

  revalidatePath('/proposals')
  revalidatePath('/finance')
  revalidatePath('/')
  return result
}

export async function markProposalAsPending(proposalId: string): Promise<ActionResponse<null>> {
  const result = await setProposalPaymentStatus(proposalId, 'Pending')
  if (!result.success) {
    console.error('Mark as Pending Error:', result.error)
    return result
  }

  revalidatePath('/proposals')
  revalidatePath('/finance')
  revalidatePath('/')
  return result
}
