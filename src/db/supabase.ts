import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error('Faltan variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient<Database>(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Cliente sin tipar para las tablas operativas (reportes, auditorías y
 * sub-tablas) que aún no están en `database.types.ts`. Una vez que generes
 * los tipos con la CLI de Supabase puedes migrar estas consultas al cliente
 * tipado `supabase`.
 */
export const sb = supabase as unknown as SupabaseClient;

