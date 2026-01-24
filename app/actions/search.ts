'use server'

import { createClient } from "@/lib/supabase/server"

export type SearchResult = {
    type: 'customer' | 'shoot' | 'proposal'
    id: string
    title: string
    subtitle?: string
    url: string
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return []

    const supabase = await createClient()
    const results: SearchResult[] = []

    // 1. Search Customers
    const { data: customers } = await supabase
        .from('customers')
        .select('id, name, company')
        .or(`name.ilike.%${query}%,company.ilike.%${query}%`)
        .limit(5)

    customers?.forEach((c: { id: string; name: string; company: string | null }) => {
        results.push({
            type: 'customer',
            id: c.id,
            title: c.name,
            subtitle: c.company || 'Şirket',
            url: `/customers/${c.id}`
        })
    })

    // 2. Search Shoots
    const { data: shoots } = await supabase
        .from('shoots')
        .select('id, title, location')
        .or(`title.ilike.%${query}%,location.ilike.%${query}%`)
        .limit(5)

    shoots?.forEach((s: { id: string; title: string; location: string | null }) => {
        results.push({
            type: 'shoot',
            id: s.id,
            title: s.title,
            subtitle: s.location || 'Lokasyon yok',
            url: `/shoots/${s.id}`
        })
    })

    // 3. Search Proposals
    const { data: proposals } = await supabase
        .from('proposals')
        .select('id, project_title')
        .ilike('project_title', `%${query}%`)
        .limit(5)

    proposals?.forEach((p: { id: string; project_title: string }) => {
        results.push({
            type: 'proposal',
            id: p.id,
            title: p.project_title,
            subtitle: 'Teklif',
            url: `/proposals/${p.id}`
        })
    })

    return results
}
