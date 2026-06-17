-- =====================================================
-- EXTENSIONES
-- =====================================================
create extension if not exists "pgcrypto";

-- =====================================================
-- TIPOS ENUM
-- =====================================================
create type role_type as enum ('supervisor', 'segurista', 'auditor', 'admin');
create type turno_type as enum ('Matutino', 'Vespertino', 'Nocturno');
create type report_status as enum ('borrador', 'enviado', 'aprobado');
create type semaforo_type as enum ('verde', 'amarillo', 'rojo', 'sin-datos');
create type attendance_status as enum (
  'Asistió', 'Retardo', 'Falta justificada', 'Falta injustificada',
  'Permiso', 'Incapacidad'
);
create type activity_status as enum (
  'Pendiente', 'En proceso', 'Cerrado', 'Cerrado con observación',
  'No realizado', 'Reprogramado', 'Detenido'
);
create type incident_cause as enum (
  'Material', 'Cliente', 'Personal', 'Clima', 'Acceso', 'Otro'
);
create type permit_type_enum as enum (
  'Trabajo en altura', 'Trabajo en caliente', 'Espacios confinados',
  'Eléctrico (LOTO)', 'Izaje', 'Excavación', 'General'
);
create type incident_type as enum (
  'Accidente', 'Incidente', 'Near-miss', 'Condición insegura',
  'Acto inseguro', 'Observación de mejora'
);
create type criteria_module as enum ('supervisor_checklist', 'safety_checklist', 'audit');
create type response_type as enum ('C', 'NC', 'NA');
create type action_status as enum ('abierto', 'en_proceso', 'cerrado', 'cancelado');
create type severity_type as enum ('Alta', 'Media', 'Baja');

-- =====================================================
-- PERFILES (extiende auth.users)
-- =====================================================
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null,
  role role_type not null,
  phone text,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_profiles_role on profiles(role) where active = true;

-- =====================================================
-- CATÁLOGOS
-- =====================================================
create table plants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  contact_name text,
  contact_phone text,
  latitude numeric,
  longitude numeric,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table criteria_catalog (
  id uuid primary key default gen_random_uuid(),
  version int not null,
  module criteria_module not null,
  section_key text not null,
  section_title text not null,
  item_index int not null,
  item_text text not null,
  suggested_time text,
  active boolean default true,
  created_at timestamptz default now(),
  unique (version, module, section_key, item_index)
);

create index idx_criteria_module_version on criteria_catalog(module, version, section_key) where active = true;

-- =====================================================
-- REPORTES DEL SUPERVISOR
-- =====================================================
create table supervisor_reports (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles,
  plant_id uuid not null references plants,
  report_date date not null,
  turno turno_type default 'Matutino',
  weather text,
  checklist_responses jsonb default '{}',
  checklist_observations jsonb default '{}',
  personal_programado int default 0,
  asistencias int default 0,
  faltas int default 0,
  retardos int default 0,
  actividades_asignadas int default 0,
  actividades_cerradas int default 0,
  actividades_pendientes int default 0,
  actividades_con_evidencia int default 0,
  supervisor_signature_path text,
  client_signature_path text,
  client_signature_name text,
  capture_lat numeric,
  capture_lng numeric,
  capture_accuracy numeric,
  status report_status default 'borrador',
  submitted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_supervisor_reports_date on supervisor_reports(report_date desc, plant_id);
create index idx_supervisor_reports_profile on supervisor_reports(profile_id, report_date desc);

create table supervisor_attendance (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references supervisor_reports on delete cascade,
  worker_name text not null,
  specialty text,
  entrada time,
  salida time,
  status attendance_status,
  worker_signature_path text,
  observations text,
  order_index int default 0,
  created_at timestamptz default now()
);

create table supervisor_activities (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references supervisor_reports on delete cascade,
  activity_name text not null,
  area text,
  responsible_name text,
  start_time time,
  end_time time,
  status activity_status default 'Pendiente',
  photo_before_path text,
  photo_after_path text,
  observations text,
  order_index int default 0,
  created_at timestamptz default now()
);

create table supervisor_incidents (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references supervisor_reports on delete cascade,
  description text not null,
  cause incident_cause,
  action_taken text,
  order_index int default 0,
  created_at timestamptz default now()
);

create table supervisor_materials (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references supervisor_reports on delete cascade,
  material_name text not null,
  quantity text,
  used_in text,
  was_missing boolean default false,
  order_index int default 0,
  created_at timestamptz default now()
);

-- =====================================================
-- REPORTES DEL SEGURISTA
-- =====================================================
create table safety_reports (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles,
  plant_id uuid not null references plants,
  report_date date not null,
  turno turno_type default 'Matutino',
  checklist_responses jsonb default '{}',
  checklist_observations jsonb default '{}',
  talk_topic text,
  talk_duration_min int,
  talk_attendees int,
  talk_time time,
  talk_signatures_path text,
  personal_epp_completo int default 0,
  permisos_vigentes int default 0,
  dias_sin_accidente int default 0,
  charlas_impartidas int default 1,
  incidentes_dia int default 0,
  near_misses int default 0,
  segurista_signature_path text,
  supervisor_signature_path text,
  capture_lat numeric,
  capture_lng numeric,
  capture_accuracy numeric,
  status report_status default 'borrador',
  submitted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_safety_reports_date on safety_reports(report_date desc, plant_id);

create table epp_inspections (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references safety_reports on delete cascade,
  worker_name text not null,
  casco boolean,
  lentes boolean,
  guantes boolean,
  calzado boolean,
  tapones boolean,
  other_epp text,
  other_complies boolean,
  action_taken text,
  order_index int default 0,
  created_at timestamptz default now()
);

create table permits (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references safety_reports on delete cascade,
  activity_area text not null,
  permit_type permit_type_enum,
  ats_elaborated boolean default false,
  client_signed text check (client_signed in ('Sí', 'No', 'N.A.')),
  archived boolean default false,
  observation text,
  order_index int default 0,
  created_at timestamptz default now()
);

create table incidents (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references safety_reports on delete cascade,
  occurrence_time time,
  type incident_type,
  description text,
  affected_area text,
  affected_people text,
  immediate_action text,
  photo_path text,
  order_index int default 0,
  created_at timestamptz default now()
);

-- =====================================================
-- AUDITORÍAS
-- =====================================================
create table audits (
  id uuid primary key default gen_random_uuid(),
  auditor_id uuid not null references profiles,
  plant_id uuid not null references plants,
  supervisor_id uuid references profiles,
  segurista_id uuid references profiles,
  audit_date date not null,
  turno turno_type default 'Matutino',
  start_time time,
  end_time time,
  responses jsonb default '{}',
  observations jsonb default '{}',
  total_cumple int default 0,
  total_no_cumple int default 0,
  total_na int default 0,
  pct_cumplimiento numeric(5,2),
  semaforo semaforo_type default 'sin-datos',
  auditor_signature_path text,
  supervisor_signature_path text,
  capture_lat numeric,
  capture_lng numeric,
  status report_status default 'borrador',
  submitted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_audits_date on audits(audit_date desc, plant_id);
create index idx_audits_auditor on audits(auditor_id, audit_date desc);

create table audit_sampling (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references audits on delete cascade,
  activity_description text not null,
  exists_in_site text check (exists_in_site in ('Sí', 'No')),
  quality_ok text check (quality_ok in ('Sí', 'No')),
  photos_match text check (photos_match in ('Sí', 'No', 'N.A.')),
  observation text,
  order_index int default 0,
  created_at timestamptz default now()
);

-- =====================================================
-- HALLAZGOS Y ACCIONES CORRECTIVAS
-- =====================================================
create table findings (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references audits on delete cascade,
  description text not null,
  category text,
  severity severity_type default 'Media',
  order_index int default 0,
  created_at timestamptz default now()
);

create table corrective_actions (
  id uuid primary key default gen_random_uuid(),
  finding_id uuid not null references findings on delete cascade,
  action_description text not null,
  responsible_id uuid references profiles,
  responsible_name text,
  due_date date,
  status action_status default 'abierto',
  closed_at timestamptz,
  closed_by uuid references profiles,
  closure_evidence_path text,
  closure_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_actions_status on corrective_actions(status, due_date);
