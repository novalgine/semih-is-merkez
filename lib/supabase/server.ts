import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseEnvStatus } from '@/lib/env'

export async function createClientSafe() {
    const envStatus = getSupabaseEnvStatus()

    if (!envStatus.isConfigured || !envStatus.url || !envStatus.anonKey) {
        return {
            client: null,
            envStatus,
        }
    }

    const cookieStore = await cookies()

    return {
        client: createServerClient(envStatus.url, envStatus.anonKey, {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }),
        envStatus,
    }
}

export async function createClient() {
    const { client, envStatus } = await createClientSafe()

    if (!client) {
        throw new Error(envStatus.message || 'Supabase env is missing')
    }

    return client
}
