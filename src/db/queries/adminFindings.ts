import { sb } from '@/db/supabase';

export type FindingFilters = {
  plantId?: string | null;
  severity?: string | null; // Alta/Media/Baja
  status?: string | null; // abierto/en_proceso/cerrado/cancelado
  desde?: string;
  hasta?: string;
};

export type FindingTracking = {
  finding_id: string;
  audit_id: string;
  plant_id: string;
  audit_date: string;
  description: string;
  category: string | null;
  severity: string;
  action_id: string | null;
  action_description: string | null;
  responsible_id: string | null;
  responsible_name: string | null;
  due_date: string | null;
  action_status: string | null;
  closed_at: string | null;
  tracking_status: string;
};

export async function fetchFindings(filters: FindingFilters): Promise<FindingTracking[]> {
  let q = sb.from('v_findings_tracking').select('*').order('audit_date', { ascending: false });
  if (filters.plantId) q = q.eq('plant_id', filters.plantId);
  if (filters.severity) q = q.eq('severity', filters.severity);
  if (filters.status) q = q.eq('tracking_status', filters.status);
  if (filters.desde) q = q.gte('audit_date', filters.desde);
  if (filters.hasta) q = q.lte('audit_date', filters.hasta);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as FindingTracking[];
}

/** Cambia el estado de seguimiento (status de la acción correctiva). */
export async function updateActionStatus(actionId: string, status: string) {
  const patch: Record<string, any> = { status };
  if (status === 'cerrado') patch.closed_at = new Date().toISOString();
  const { error } = await sb.from('corrective_actions').update(patch).eq('id', actionId);
  if (error) throw error;
}

/** Crea una acción correctiva para un hallazgo que aún no tiene una. */
export async function createCorrectiveAction(
  findingId: string,
  payload: { action_description: string; responsible_id?: string | null; due_date?: string | null },
) {
  const { error } = await sb.from('corrective_actions').insert({
    finding_id: findingId,
    action_description: payload.action_description,
    responsible_id: payload.responsible_id ?? null,
    due_date: payload.due_date ?? null,
    status: 'abierto',
  });
  if (error) throw error;
}

export async function updateCorrectiveAction(
  actionId: string,
  payload: { action_description?: string; responsible_id?: string | null; due_date?: string | null },
) {
  const { error } = await sb.from('corrective_actions').update(payload).eq('id', actionId);
  if (error) throw error;
}
