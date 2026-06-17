import { supabase } from '@/db/supabase';
import { db } from '@/db/dexie';
import type { CriteriaModule } from '@/types/domain';

/**
 * Lee los criterios activos de un módulo. Intenta Supabase; si falla (offline),
 * regresa el cache de Dexie. Cachea el resultado remoto al vuelo.
 */
export async function fetchActiveCriteria(module: CriteriaModule, version = 1) {
  const cacheId = `${module}-v${version}`;
  try {
    const { data, error } = await supabase
      .from('criteria_catalog')
      .select('*')
      .eq('module', module)
      .eq('version', version)
      .eq('active', true)
      .order('section_key')
      .order('item_index');
    if (error) throw error;
    if (data) {
      await db.catalogs.put({
        id: cacheId,
        module,
        version,
        data,
        cachedAt: Date.now(),
      });
      return data;
    }
  } catch {
    // ignore: caemos al cache local
  }
  const cached = await db.catalogs.get(cacheId);
  return cached?.data ?? [];
}

export async function fetchActivePlants() {
  const { data, error } = await supabase
    .from('plants')
    .select('*')
    .eq('active', true)
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function fetchProfilesByRole(role: 'supervisor' | 'segurista') {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('role', role)
    .eq('active', true)
    .order('full_name');
  if (error) throw error;
  return data ?? [];
}
