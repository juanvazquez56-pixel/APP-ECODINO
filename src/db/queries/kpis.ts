import { sb } from '@/db/supabase';
import type { Semaforo } from '@/shared/utils/calcSemaforo';

export type DateRange = { desde: string; hasta: string };

export type HeadlineKpis = {
  total_audits: number;
  total_supervisor: number;
  total_safety: number;
  avg_compliance: number | null;
  findings_open: number;
  findings_closed: number;
  reports_today: number;
};

export type SemaforoDist = { semaforo: Semaforo; total: number };
export type CompliancePoint = { periodo: string; avg_compliance: number; total: number };
export type PlantCompliance = {
  plant_id: string;
  plant_name: string;
  avg_compliance: number;
  total: number;
};

export async function fetchHeadlineKpis(range: DateRange, plantId?: string | null) {
  const { data, error } = await sb.rpc('admin_kpi_headline', {
    p_desde: range.desde,
    p_hasta: range.hasta,
    p_planta: plantId ?? null,
  });
  if (error) throw error;
  // La función devuelve una sola fila.
  const row = (Array.isArray(data) ? data[0] : data) as HeadlineKpis | undefined;
  return (
    row ?? {
      total_audits: 0,
      total_supervisor: 0,
      total_safety: 0,
      avg_compliance: null,
      findings_open: 0,
      findings_closed: 0,
      reports_today: 0,
    }
  );
}

export async function fetchSemaforoDist(range: DateRange, plantId?: string | null) {
  const { data, error } = await sb.rpc('admin_semaforo_dist', {
    p_desde: range.desde,
    p_hasta: range.hasta,
    p_planta: plantId ?? null,
  });
  if (error) throw error;
  return (data ?? []) as SemaforoDist[];
}

export async function fetchComplianceTrend(range: DateRange, plantId?: string | null) {
  const { data, error } = await sb.rpc('admin_compliance_trend', {
    p_desde: range.desde,
    p_hasta: range.hasta,
    p_planta: plantId ?? null,
  });
  if (error) throw error;
  return (data ?? []) as CompliancePoint[];
}

export async function fetchComplianceByPlant(range: DateRange) {
  const { data, error } = await sb.rpc('admin_compliance_by_plant', {
    p_desde: range.desde,
    p_hasta: range.hasta,
  });
  if (error) throw error;
  return (data ?? []) as PlantCompliance[];
}
