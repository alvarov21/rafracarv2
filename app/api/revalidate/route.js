import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/config';

// El panel llama aquí después de guardar para que la web pública se actualice al momento.
export async function POST(req) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return Response.json({ ok: false }, { status: 401 });
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: isAdmin, error } = await sb.rpc('is_admin');
  if (error || !isAdmin) return Response.json({ ok: false }, { status: 403 });
  revalidatePath('/', 'layout');
  return Response.json({ ok: true });
}
