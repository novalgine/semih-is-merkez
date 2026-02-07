type SupabaseEnvKey = 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'

export type SupabaseEnvStatus = {
    isConfigured: boolean
    missingKeys: SupabaseEnvKey[]
    url?: string
    anonKey?: string
    message?: string
}

export function getSupabaseEnvStatus(): SupabaseEnvStatus {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const missingKeys: SupabaseEnvKey[] = []

    if (!url) {
        missingKeys.push('NEXT_PUBLIC_SUPABASE_URL')
    }

    if (!anonKey) {
        missingKeys.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }

    const isConfigured = missingKeys.length === 0

    return {
        isConfigured,
        missingKeys,
        url,
        anonKey,
        message: isConfigured
            ? undefined
            : `Supabase yapılandırması eksik: ${missingKeys.join(', ')}`,
    }
}
