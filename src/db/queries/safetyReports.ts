import { sb } from '@/db/supabase';

export async function fetchTodaySafetyReport(profileId: string, date: string) {
  const { data, error } = await sb
    .from('safety_reports')
    .select('*')
    .eq('profile_id', profileId)
    .eq('report_date', date)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchRecentSafetyReports(profileId: string, limit = 10) {
  const { data, error } = await sb
    .from('safety_reports')
    .select('id, report_date, plant_id, status, checklist_responses')
    .eq('profile_id', profileId)
    .order('report_date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
