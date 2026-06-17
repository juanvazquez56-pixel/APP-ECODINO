-- =====================================================
-- Trigger genérico: updated_at automático
-- =====================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create trigger trg_plants_updated_at
  before update on plants
  for each row execute function set_updated_at();

create trigger trg_supervisor_reports_updated_at
  before update on supervisor_reports
  for each row execute function set_updated_at();

create trigger trg_safety_reports_updated_at
  before update on safety_reports
  for each row execute function set_updated_at();

create trigger trg_audits_updated_at
  before update on audits
  for each row execute function set_updated_at();

create trigger trg_corrective_actions_updated_at
  before update on corrective_actions
  for each row execute function set_updated_at();

-- =====================================================
-- Trigger: marcar submitted_at cuando pasa a 'enviado'
-- =====================================================
create or replace function mark_submitted_at()
returns trigger as $$
begin
  if new.status = 'enviado' and (old.status is null or old.status <> 'enviado') then
    new.submitted_at = now();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_supervisor_reports_submitted
  before update on supervisor_reports
  for each row execute function mark_submitted_at();

create trigger trg_safety_reports_submitted
  before update on safety_reports
  for each row execute function mark_submitted_at();

create trigger trg_audits_submitted
  before update on audits
  for each row execute function mark_submitted_at();

-- =====================================================
-- Trigger: recalcular semáforo de auditoría
-- =====================================================
create or replace function recalc_audit_semaforo()
returns trigger as $$
declare
  c int := 0;
  nc int := 0;
  na int := 0;
  total_evaluables int;
  pct numeric;
  sem semaforo_type;
  k text;
  v text;
begin
  -- Recorrer jsonb responses
  for k, v in select * from jsonb_each_text(coalesce(new.responses, '{}'::jsonb))
  loop
    if v = 'C' then c := c + 1;
    elsif v = 'NC' then nc := nc + 1;
    elsif v = 'NA' then na := na + 1;
    end if;
  end loop;

  total_evaluables := c + nc;
  if total_evaluables = 0 then
    pct := null;
    sem := 'sin-datos';
  else
    pct := round((c::numeric / total_evaluables) * 100, 2);
    if pct >= 90 then sem := 'verde';
    elsif pct >= 75 then sem := 'amarillo';
    else sem := 'rojo';
    end if;
  end if;

  new.total_cumple := c;
  new.total_no_cumple := nc;
  new.total_na := na;
  new.pct_cumplimiento := pct;
  new.semaforo := sem;

  return new;
end;
$$ language plpgsql;

create trigger trg_audits_recalc
  before insert or update of responses on audits
  for each row execute function recalc_audit_semaforo();

-- =====================================================
-- Trigger: crear profile al registrar usuario
-- =====================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::role_type, 'supervisor')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
