import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

export const ORDER = { disponible: 0, reservado: 1, vendido: 2 };

export function publicClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
}

export async function getCars() {
  try {
    const { data, error } = await publicClient()
      .from('coches')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('getCars', e.message);
    return [];
  }
}

export async function getCarBySlug(slug) {
  const id = Number(String(slug).split('-').pop());
  if (!id) return null;
  try {
    const { data, error } = await publicClient().from('coches').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  } catch (e) {
    console.error('getCarBySlug', e.message);
    return null;
  }
}

export const slugify = (s) =>
  String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const carSlug = (c) => slugify(`${c.marca}-${c.modelo}-${c.anio || ''}-${c.id}`);
export const eur = (n) => (n || n === 0 ? Number(n).toLocaleString('es-ES') + ' €' : 'Consultar');
export const kmf = (n) => (n || n === 0 ? Number(n).toLocaleString('es-ES') + ' km' : '');
export const etiquetaTxt = (e) => (e === '0' ? 'CERO' : e || '—');
export const cover = (c) => (c.fotos && c.fotos[0]) || '/img/coche-1.jpg';
export const equipList = (c) => String(c.equipamiento || '').split('\n').map((s) => s.trim()).filter(Boolean);
export const sortForList = (a, b) =>
  (a.estado === 'vendido') - (b.estado === 'vendido') ||
  new Date(b.created_at) - new Date(a.created_at);
