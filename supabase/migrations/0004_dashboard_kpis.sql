-- =====================================================
-- BLOQUE 3 — Capa de KPIs para el Dashboard Admin
-- Migración 0004
-- -----------------------------------------------------
-- Todas las vistas/funciones usan SECURITY INVOKER para que se respeten
-- las políticas RLS existentes: el rol 'admin' tiene policies admin_all_*
-- que le permiten leer todas las filas; cualquier otro rol solo vería las
-- suyas. El dashboard además está protegido por ruta solo para 'admin'.
--
-- Regla de semáforo (idéntica en SQL, UI y PDF):
--   verde ≥ 90, amarillo 75–89, rojo < 75 (sobre pct_cumplimiento ya
--   calculado por el trigger recalc_audit_semaforo, que excluye los N.A.).
-- =====================================================

-- =====================================================
-- VISTA: seguimiento de hallazgos
-- findings NO tiene columna de estado propia; el estado de seguimiento vive
-- en corrective_actions.status (enum: abierto/en_proceso/cerrado/cancelado).
-- Esta vista deriva un estado por hallazgo (un finding puede no tener acción).
-- =====================================================
create or replace view v_findings_tracking
with (security_invoker = on) as
select
  f.id                as finding_id,
  f.audit_id,
  a.plant_id,
  a.audit_date,
  f.description,
  f.category,
  f.severity,
  ca.id               as action_id,
  ca.action_description,
  ca.responsible_id,
  ca.responsible_name,
  ca.due_date,
  ca.status           as action_status,
  ca.closed_at,
  coalesce(ca.status::text, 'abierto') as tracking_status
from findings f
join audits a on a.id = f.audit_id
left join corrective_actions ca on ca.finding_id = f.id;

comment on view v_findings_tracking is
  'Hallazgos con su acción correctiva y estado de seguimiento derivado (RLS via security_invoker).';

-- =====================================================
-- FUNCIÓN: KPIs de cabecera del Home
-- USO: supabase.rpc('admin_kpi_headline', { p_desde, p_hasta, p_planta })
--   p_planta es opcional (null = todas las plantas)
-- =====================================================
create or replace function admin_kpi_headline(
  p_desde date,
  p_hasta date,
  p_planta uuid default null
)
returns table (
  total_audits        bigint,
  total_supervisor    bigint,
  total_safety        bigint,
  avg_compliance      numeric,
  findings_open       bigint,
  findings_closed     bigint,
  reports_today       bigint
)
language sql
stable
security invoker
as $$
  select
    (select count(*) from audits a
       where a.audit_date between p_desde and p_hasta
         and (p_planta is null or a.plant_id = p_planta)),
    (select count(*) from supervisor_reports r
       where r.report_date between p_desde and p_hasta
         and (p_planta is null or r.plant_id = p_planta)),
    (select count(*) from safety_reports r
       where r.report_date between p_desde and p_hasta
         and (p_planta is null or r.plant_id = p_planta)),
    (select round(avg(a.pct_cumplimiento), 1) from audits a
       where a.audit_date between p_desde and p_hasta
         and a.pct_cumplimiento is not null
         and (p_planta is null or a.plant_id = p_planta)),
    (select count(distinct t.finding_id) from v_findings_tracking t
       where t.audit_date between p_desde and p_hasta
         and t.tracking_status in ('abierto', 'en_proceso')
         and (p_planta is null or t.plant_id = p_planta)),
    (select count(distinct t.finding_id) from v_findings_tracking t
       where t.audit_date between p_desde and p_hasta
         and t.tracking_status = 'cerrado'
         and (p_planta is null or t.plant_id = p_planta)),
    (select count(*) from (
        select 1 from supervisor_reports
          where report_date = current_date
            and status in ('enviado', 'aprobado')
            and (p_planta is null or plant_id = p_planta)
        union all
        select 1 from safety_reports
          where report_date = current_date
            and status in ('enviado', 'aprobado')
            and (p_planta is null or plant_id = p_planta)
      ) hoy);
$$;

comment on function admin_kpi_headline is
  'Tarjetas KPI del Home. USO: supabase.rpc(''admin_kpi_headline'', { p_desde, p_hasta, p_planta }).';

-- =====================================================
-- FUNCIÓN: distribución por semáforo
-- El color se calcula aquí en SQL a partir de pct_cumplimiento.
-- USO: supabase.rpc('admin_semaforo_dist', { p_desde, p_hasta, p_planta })
-- =====================================================
create or replace function admin_semaforo_dist(
  p_desde date,
  p_hasta date,
  p_planta uuid default null
)
returns table (
  semaforo text,
  total    bigint
)
language sql
stable
security invoker
as $$
  select
    case
      when a.pct_cumplimiento is null then 'sin-datos'
      when a.pct_cumplimiento >= 90 then 'verde'
      when a.pct_cumplimiento >= 75 then 'amarillo'
      else 'rojo'
    end as semaforo,
    count(*) as total
  from audits a
  where a.audit_date between p_desde and p_hasta
    and (p_planta is null or a.plant_id = p_planta)
  group by 1
  order by 1;
$$;

comment on function admin_semaforo_dist is
  'Conteo de auditorías por color de semáforo. USO: supabase.rpc(''admin_semaforo_dist'', { p_desde, p_hasta, p_planta }).';

-- =====================================================
-- FUNCIÓN: tendencia temporal (promedio de cumplimiento por semana)
-- USO: supabase.rpc('admin_compliance_trend', { p_desde, p_hasta, p_planta })
-- =====================================================
create or replace function admin_compliance_trend(
  p_desde date,
  p_hasta date,
  p_planta uuid default null
)
returns table (
  periodo        date,
  avg_compliance numeric,
  total          bigint
)
language sql
stable
security invoker
as $$
  select
    date_trunc('week', a.audit_date)::date as periodo,
    round(avg(a.pct_cumplimiento), 1)      as avg_compliance,
    count(*)                               as total
  from audits a
  where a.audit_date between p_desde and p_hasta
    and a.pct_cumplimiento is not null
    and (p_planta is null or a.plant_id = p_planta)
  group by 1
  order by 1;
$$;

comment on function admin_compliance_trend is
  'Serie semanal de % de cumplimiento promedio para la gráfica de línea. USO: supabase.rpc(''admin_compliance_trend'', { p_desde, p_hasta, p_planta }).';

-- =====================================================
-- FUNCIÓN: cumplimiento por planta (gráfica de barras)
-- USO: supabase.rpc('admin_compliance_by_plant', { p_desde, p_hasta })
-- =====================================================
create or replace function admin_compliance_by_plant(
  p_desde date,
  p_hasta date
)
returns table (
  plant_id       uuid,
  plant_name     text,
  avg_compliance numeric,
  total          bigint
)
language sql
stable
security invoker
as $$
  select
    a.plant_id,
    p.name                            as plant_name,
    round(avg(a.pct_cumplimiento), 1) as avg_compliance,
    count(*)                          as total
  from audits a
  join plants p on p.id = a.plant_id
  where a.audit_date between p_desde and p_hasta
    and a.pct_cumplimiento is not null
  group by a.plant_id, p.name
  order by p.name;
$$;

comment on function admin_compliance_by_plant is
  'Promedio de cumplimiento por planta para la gráfica de barras. USO: supabase.rpc(''admin_compliance_by_plant'', { p_desde, p_hasta }).';

-- =====================================================
-- PERMISOS: ejecutables por usuarios autenticados (RLS sigue aplicando
-- por SECURITY INVOKER, así que solo el admin obtiene el universo completo).
-- =====================================================
grant select on v_findings_tracking to authenticated;
grant execute on function admin_kpi_headline(date, date, uuid) to authenticated;
grant execute on function admin_semaforo_dist(date, date, uuid) to authenticated;
grant execute on function admin_compliance_trend(date, date, uuid) to authenticated;
grant execute on function admin_compliance_by_plant(date, date) to authenticated;

-- =====================================================
-- VERIFICACIÓN: pega estos SELECT en el SQL Editor (como admin) para
-- confirmar que cada función/vista devuelve datos. Ajusta el rango si es
-- necesario.
-- =====================================================
-- 1) KPIs de los últimos 30 días (todas las plantas):
--    select * from admin_kpi_headline(current_date - 30, current_date, null);
--
-- 2) Distribución por semáforo del año en curso:
--    select * from admin_semaforo_dist(date_trunc('year', current_date)::date, current_date, null);
--
-- 3) Tendencia semanal y cumplimiento por planta:
--    select * from admin_compliance_trend(current_date - 90, current_date, null);
--    select * from admin_compliance_by_plant(current_date - 90, current_date);
--
-- 4) Hallazgos abiertos con su acción correctiva:
--    select finding_id, severity, tracking_status, due_date
--      from v_findings_tracking where tracking_status <> 'cerrado';
