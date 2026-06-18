import { sb } from '@/db/supabase';
import type { Role } from '@/types/domain';

// =====================================================
// PLANTAS (plants)
// =====================================================
export type PlantInput = {
  name: string;
  address?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  active?: boolean;
};

export async function fetchAllPlants() {
  const { data, error } = await sb.from('plants').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function createPlant(input: PlantInput) {
  const { error } = await sb.from('plants').insert(input);
  if (error) throw error;
}

export async function updatePlant(id: string, input: Partial<PlantInput>) {
  const { error } = await sb.from('plants').update(input).eq('id', id);
  if (error) throw error;
}

export async function setPlantActive(id: string, active: boolean) {
  const { error } = await sb.from('plants').update({ active }).eq('id', id);
  if (error) throw error;
}

// =====================================================
// PERSONAL (profiles) — solo rol y activo (no contraseñas)
// =====================================================
export async function fetchAllProfiles() {
  const { data, error } = await sb.from('profiles').select('*').order('full_name');
  if (error) throw error;
  return data ?? [];
}

export async function updateProfileRole(id: string, role: Role) {
  const { error } = await sb.from('profiles').update({ role }).eq('id', id);
  if (error) throw error;
}

export async function setProfileActive(id: string, active: boolean) {
  const { error } = await sb.from('profiles').update({ active }).eq('id', id);
  if (error) throw error;
}
