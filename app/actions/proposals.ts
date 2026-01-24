'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveProposal(data: any) {
    const supabase = await createClient()

    // 1. Create Proposal
    const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .insert({
            customer_id: data.customerId,
            project_title: data.projectTitle,
            status: data.status,
            total_amount: data.totalAmount,
            currency: data.currency,
            tax_rate: data.taxRate,
            valid_until: data.validUntil,
            notes: data.notes
        })
        .select()
        .single()

    if (proposalError) {
        console.error('Proposal Save Error:', proposalError)
        return { success: false, error: proposalError.message }
    }

    // 2. Create Items
    const items = data.items.map((item: any, index: number) => ({
        proposal_id: proposal.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        order_index: index
    }))

    const { error: itemsError } = await supabase
        .from('proposal_items')
        .insert(items)

    if (itemsError) {
        console.error('Items Save Error:', itemsError)
        return { success: false, error: itemsError.message }
    }

    revalidatePath('/proposals')
    return { success: true, id: proposal.id }
}

export async function getProposal(id: string) {
    const supabase = await createClient()

    const { data: proposal, error } = await supabase
        .from('proposals')
        .select(`
            *,
            customers (name, company, email, phone, address),
            proposal_items (*)
        `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Get Proposal Error:', error)
        return null
    }

    return proposal
}

export async function getProposals() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('proposals')
        .select(`
            *,
            customers (name, company)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Get Proposals Error:', error)
        return []
    }

    return data
}

export async function deleteProposal(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting proposal:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/proposals')
    return { success: true }
}

export async function duplicateProposal(id: string) {
    const supabase = await createClient()

    // 1. Get Original Proposal
    const { data: original, error: fetchError } = await supabase
        .from('proposals')
        .select(`*, proposal_items (*)`)
        .eq('id', id)
        .single()

    if (fetchError || !original) {
        return { success: false, error: 'Proposal not found' }
    }

    // 2. Create New Proposal
    const { data: newProposal, error: createError } = await supabase
        .from('proposals')
        .insert({
            customer_id: original.customer_id,
            project_title: `Copy of ${original.project_title}`,
            status: 'draft',
            total_amount: original.total_amount,
            currency: original.currency,
            tax_rate: original.tax_rate,
            valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
            notes: original.notes
        })
        .select()
        .single()

    if (createError) {
        return { success: false, error: createError.message }
    }

    // 3. Copy Items
    if (original.proposal_items && original.proposal_items.length > 0) {
        const itemsToInsert = original.proposal_items.map((item: any) => ({
            proposal_id: newProposal.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            order_index: item.order_index
        }))

        const { error: itemsError } = await supabase
            .from('proposal_items')
            .insert(itemsToInsert)

        if (itemsError) {
            console.error('Error copying items:', itemsError)
        }
    }

    revalidatePath('/proposals')
    return { success: true, id: newProposal.id }
}

export async function convertProposalToShoot(id: string) {
    const supabase = await createClient()

    // 1. Get Proposal
    const { data: proposal, error: fetchError } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', id)
        .single()

    if (fetchError || !proposal) {
        return { success: false, error: 'Proposal not found' }
    }

    // 2. Create Shoot
    const { data: shoot, error: createError } = await supabase
        .from('shoots')
        .insert({
            customer_id: proposal.customer_id,
            title: proposal.project_title,
            shoot_date: proposal.valid_until, // Use valid_until as tentative date
            notes: `${proposal.notes || ''}\n\nGenerated from Proposal: ${proposal.project_title}`,
            status: 'planned',
            equipment_list: '[]' // Empty list initially
        })
        .select()
        .single()

    if (createError) {
        return { success: false, error: createError.message }
    }

    revalidatePath('/shoots')
    return { success: true, id: shoot.id }
}
