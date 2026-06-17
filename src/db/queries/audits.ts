import { sb } from '@/db/supabase';

export async function fetchRecentAudits(auditorId: string, limit = 10) {
  const { data, error } = await sb
    .from('audits')
    .select('id, audit_date, plant_id, status, pct_cumplimiento, semaforo')
    .eq('auditor_id', auditorId)
    .order('audit_date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

/**
 * Cruce automático: verifica si supervisor y segurista ya entregaron su
 * reporte para una planta y fecha dadas. Requiere conexión.
 */
export async function checkReportsSubmittedForDate(
  plantId: string,
  date: string,
): Promise<{
  supervisorSubmitted: boolean;
  supervisorTime: string | null;
  seguristaSubmitted: boolean;
  seguristaTime: string | null;
}> {
  const [sup, seg] = await Promise.all([
    sb
      .from('supervisor_reports')
      .select('submitted_at, status')
      .eq('plant_id', plantId)
      .eq('report_date', date)
      .in('status', ['enviado', 'aprobado'])
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    sb
      .from('safety_reports')
      .select('submitted_at, status')
      .eq('plant_id', plantId)
      .eq('report_date', date)
      .in('status', ['enviado', 'aprobado'])
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    supervisorSubmitted: !!sup.data,
    supervisorTime: sup.data?.submitted_at ?? null,
    seguristaSubmitted: !!seg.data,
    seguristaTime: seg.data?.submitted_at ?? null,
  };
}
