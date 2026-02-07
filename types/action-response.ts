import type { PostgrestError } from '@supabase/supabase-js'

export interface ActionResponse<T = null> {
  success: boolean
  data: T | null
  error: string | null
}

const SUPABASE_ERROR_MESSAGES: Record<string, string> = {
  '23505': 'Bu kayıt zaten mevcut.',
  '23503': 'İlişkili kayıt bulunamadı.',
  '42501': 'Bu işlem için yetkiniz yok.',
}

export function mapSupabaseError(error: PostgrestError | null, fallback = 'Beklenmeyen bir hata oluştu.'): string {
  if (!error) return fallback
  return SUPABASE_ERROR_MESSAGES[error.code] || error.message || fallback
}

export function ok<T>(data: T): ActionResponse<T> {
  return { success: true, data, error: null }
}

export function fail<T = null>(error: PostgrestError | null, fallback?: string): ActionResponse<T> {
  return { success: false, data: null, error: mapSupabaseError(error, fallback) }
}

export function failMessage<T = null>(message: string): ActionResponse<T> {
  return { success: false, data: null, error: message }
}
