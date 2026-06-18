import { sb } from '@/db/supabase';

export type RecordKind = 'auditoria' | 'supervisor' | 'segurista';

export const KIND_TABLE: Record<RecordKind, string> = {
  auditoria: 'audits',
  supervisor: 'supervisor_reports',
  segurista: 'safety_reports',
};

const KIND_DATE: Record<RecordKind, string> = {
  auditoria: 'audit_date',
  supervisor: 'report_date',
  segurista: 'report_date',
};

const KIND_AUTHOR: Record<RecordKind, string> = {
  auditoria: 'auditor_id',
  supervisor: 'profile_id',
  segurista: 'profile_id',
};

export type RecordFilters = {
  desde?: string;
  hasta?: string;
  plantId?: string | null;
  semaforo?: string | null; // solo auditorías
  page?: number;
  pageSize?: number;
};

export async function fetchPlantsMap(): Promise<Record<string, string>> {
  const { data } = await sb.from('plants').select('id, name');
  const map: Record<string, string> = {};
  (data ?? []).forEach((p: any) => (map[p.id] = p.name));
  return map;
}

export async function fetchProfilesMap(): Promise<Record<string, string>> {
  const { data } = await sb.from('profiles').select('id, full_name');
  const map: Record<string, string> = {};
  (data ?? []).forEach((p: any) => (map[p.id] = p.full_name));
  return map;
}

export async function fetchRecords(kind: RecordKind, filters: RecordFilters) {
  const table = KIND_TABLE[kind];
  const dateCol = KIND_DATE[kind];
  const page = filters.page ?? 0;
  const pageSize = filters.pageSize ?? 20;

  let query = sb
    .from(table)
    .select('*', { count: 'exact' })
    .order(dateCol, { ascending: false })
    .range(page * pageSize, page * pageSize + pageSize - 1);

  if (filters.desde) query = query.gte(dateCol, filters.desde);
  if (filters.hasta) query = query.lte(dateCol, filters.hasta);
  if (filters.plantId) query = query.eq('plant_id', filters.plantId);
  if (kind === 'auditoria' && filters.semaforo) query = query.eq('semaforo', filters.semaforo);

  const { data, error, count } = await query;
  if (error) throw error;
  return { rows: (data ?? []) as any[], count: count ?? 0, authorCol: KIND_AUTHOR[kind] };
}

const CHILD_TABLES: Record<RecordKind, { table: string; fk: string; order?: string }[]> = {
  auditoria: [
    { table: 'audit_sampling', fk: 'audit_id', order: 'order_index' },
    { table: 'findings', fk: 'audit_id', order: 'order_index' },
  ],
  supervisor: [
    { table: 'supervisor_attendance', fk: 'report_id', order: 'order_index' },
    { table: 'supervisor_activities', fk: 'report_id', order: 'order_index' },
    { table: 'supervisor_incidents', fk: 'report_id', order: 'order_index' },
    { table: 'supervisor_materials', fk: 'report_id', order: 'order_index' },
  ],
  segurista: [
    { table: 'epp_inspections', fk: 'report_id', order: 'order_index' },
    { table: 'permits', fk: 'report_id', order: 'order_index' },
    { table: 'incidents', fk: 'report_id', order: 'order_index' },
  ],
};

export type RecordDetail = {
  header: any;
  children: Record<string, any[]>;
  correctiveActions?: any[];
};

export async function fetchRecordDetail(kind: RecordKind, id: string): Promise<RecordDetail> {
  const table = KIND_TABLE[kind];
  const { data: header, error } = await sb.from(table).select('*').eq('id', id).single();
  if (error) throw error;

  const children: Record<string, any[]> = {};
  for (const c of CHILD_TABLES[kind]) {
    let q = sb.from(c.table).select('*').eq(c.fk, id);
    if (c.order) q = q.order(c.order, { ascending: true });
    const { data } = await q;
    children[c.table] = data ?? [];
  }

  let correctiveActions: any[] | undefined;
  if (kind === 'auditoria' && children.findings?.length) {
    const findingIds = children.findings.map((f: any) => f.id);
    const { data } = await sb.from('corrective_actions').select('*').in('finding_id', findingIds);
    correctiveActions = data ?? [];
  }

  return { header, children, correctiveActions };
}
