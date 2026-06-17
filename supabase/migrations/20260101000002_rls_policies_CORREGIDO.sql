-- =====================================================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- =====================================================
alter table profiles enable row level security;
alter table plants enable row level security;
alter table criteria_catalog enable row level security;
alter table supervisor_reports enable row level security;
alter table supervisor_attendance enable row level security;
alter table supervisor_activities enable row level security;
alter table supervisor_incidents enable row level security;
alter table supervisor_materials enable row level security;
alter table safety_reports enable row level security;
alter table epp_inspections enable row level security;
alter table permits enable row level security;
alter table incidents enable row level security;
alter table audits enable row level security;
alter table audit_sampling enable row level security;
alter table findings enable row level security;
alter table corrective_actions enable row level security;

-- =====================================================
-- HELPER: obtener rol del usuario actual
-- (renombrada de current_role() a get_user_role() porque
--  current_role es palabra reservada de PostgreSQL)
-- =====================================================
create or replace function get_user_role()
returns role_type as $$
  select role from profiles where id = auth.uid();
$$ language sql stable security definer;

-- =====================================================
-- PROFILES
-- =====================================================
create policy "profile_self_read" on profiles
  for select using (id = auth.uid());

create policy "admin_all_profiles" on profiles
  for all using (get_user_role() = 'admin');

create policy "operatives_see_active_profiles" on profiles
  for select using (
    active = true and get_user_role() in ('supervisor', 'segurista', 'auditor')
  );

-- =====================================================
-- PLANTS y CRITERIA_CATALOG (lectura abierta a usuarios autenticados)
-- =====================================================
create policy "auth_read_plants" on plants
  for select using (auth.role() = 'authenticated' and active = true);

create policy "admin_write_plants" on plants
  for all using (get_user_role() = 'admin');

create policy "auth_read_criteria" on criteria_catalog
  for select using (auth.role() = 'authenticated' and active = true);

create policy "admin_write_criteria" on criteria_catalog
  for all using (get_user_role() = 'admin');

-- =====================================================
-- SUPERVISOR REPORTS
-- =====================================================
create policy "supervisor_own_reports" on supervisor_reports
  for all using (profile_id = auth.uid());

create policy "auditor_admin_read_supervisor_reports" on supervisor_reports
  for select using (get_user_role() in ('auditor', 'admin'));

create policy "admin_all_supervisor_reports" on supervisor_reports
  for all using (get_user_role() = 'admin');

-- Sub-tablas: misma política via JOIN
create policy "sub_supervisor_attendance" on supervisor_attendance
  for all using (
    exists (
      select 1 from supervisor_reports sr
      where sr.id = supervisor_attendance.report_id
      and (sr.profile_id = auth.uid() or get_user_role() in ('auditor', 'admin'))
    )
  );

create policy "sub_supervisor_activities" on supervisor_activities
  for all using (
    exists (
      select 1 from supervisor_reports sr
      where sr.id = supervisor_activities.report_id
      and (sr.profile_id = auth.uid() or get_user_role() in ('auditor', 'admin'))
    )
  );

create policy "sub_supervisor_incidents" on supervisor_incidents
  for all using (
    exists (
      select 1 from supervisor_reports sr
      where sr.id = supervisor_incidents.report_id
      and (sr.profile_id = auth.uid() or get_user_role() in ('auditor', 'admin'))
    )
  );

create policy "sub_supervisor_materials" on supervisor_materials
  for all using (
    exists (
      select 1 from supervisor_reports sr
      where sr.id = supervisor_materials.report_id
      and (sr.profile_id = auth.uid() or get_user_role() in ('auditor', 'admin'))
    )
  );

-- =====================================================
-- SAFETY REPORTS (segurista)
-- =====================================================
create policy "segurista_own_reports" on safety_reports
  for all using (profile_id = auth.uid());

create policy "auditor_admin_read_safety_reports" on safety_reports
  for select using (get_user_role() in ('auditor', 'admin'));

create policy "admin_all_safety_reports" on safety_reports
  for all using (get_user_role() = 'admin');

create policy "sub_epp_inspections" on epp_inspections
  for all using (
    exists (
      select 1 from safety_reports sr
      where sr.id = epp_inspections.report_id
      and (sr.profile_id = auth.uid() or get_user_role() in ('auditor', 'admin'))
    )
  );

create policy "sub_permits" on permits
  for all using (
    exists (
      select 1 from safety_reports sr
      where sr.id = permits.report_id
      and (sr.profile_id = auth.uid() or get_user_role() in ('auditor', 'admin'))
    )
  );

create policy "sub_incidents" on incidents
  for all using (
    exists (
      select 1 from safety_reports sr
      where sr.id = incidents.report_id
      and (sr.profile_id = auth.uid() or get_user_role() in ('auditor', 'admin'))
    )
  );

-- =====================================================
-- AUDITS
-- =====================================================
create policy "auditor_own_audits" on audits
  for all using (auditor_id = auth.uid() and get_user_role() = 'auditor');

create policy "admin_all_audits" on audits
  for all using (get_user_role() = 'admin');

create policy "audited_see_own" on audits
  for select using (
    supervisor_id = auth.uid() or segurista_id = auth.uid()
  );

create policy "sub_audit_sampling" on audit_sampling
  for all using (
    exists (
      select 1 from audits a
      where a.id = audit_sampling.audit_id
      and (a.auditor_id = auth.uid() or get_user_role() = 'admin')
    )
  );

create policy "sub_findings" on findings
  for select using (
    exists (
      select 1 from audits a
      where a.id = findings.audit_id
      and (
        a.auditor_id = auth.uid()
        or a.supervisor_id = auth.uid()
        or a.segurista_id = auth.uid()
        or get_user_role() = 'admin'
      )
    )
  );

create policy "auditor_write_findings" on findings
  for insert with check (
    exists (
      select 1 from audits a
      where a.id = findings.audit_id and a.auditor_id = auth.uid()
    )
  );

create policy "admin_findings_all" on findings
  for all using (get_user_role() = 'admin');

create policy "actions_read" on corrective_actions
  for select using (
    responsible_id = auth.uid()
    or get_user_role() in ('auditor', 'admin')
    or exists (
      select 1 from findings f
      join audits a on a.id = f.audit_id
      where f.id = corrective_actions.finding_id
      and (a.supervisor_id = auth.uid() or a.segurista_id = auth.uid())
    )
  );

create policy "actions_write_admin_auditor" on corrective_actions
  for all using (get_user_role() in ('admin', 'auditor'));

create policy "actions_close_by_responsible" on corrective_actions
  for update using (responsible_id = auth.uid())
  with check (responsible_id = auth.uid());
