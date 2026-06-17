// =====================================================
// Tipos del dominio (enums y entidades principales)
// Reflejan el schema de Supabase. Los tipos generados
// automáticamente viven en database.types.ts.
// =====================================================

export type Role = 'supervisor' | 'segurista' | 'auditor' | 'admin';

export type Turno = 'Matutino' | 'Vespertino' | 'Nocturno';

export type ReportStatus = 'borrador' | 'enviado' | 'aprobado';

export type Semaforo = 'verde' | 'amarillo' | 'rojo' | 'sin-datos';

export type AttendanceStatus =
  | 'Asistió'
  | 'Retardo'
  | 'Falta justificada'
  | 'Falta injustificada'
  | 'Permiso'
  | 'Incapacidad';

export type ActivityStatus =
  | 'Pendiente'
  | 'En proceso'
  | 'Cerrado'
  | 'Cerrado con observación'
  | 'No realizado'
  | 'Reprogramado'
  | 'Detenido';

export type IncidentCause = 'Material' | 'Cliente' | 'Personal' | 'Clima' | 'Acceso' | 'Otro';

export type PermitType =
  | 'Trabajo en altura'
  | 'Trabajo en caliente'
  | 'Espacios confinados'
  | 'Eléctrico (LOTO)'
  | 'Izaje'
  | 'Excavación'
  | 'General';

export type IncidentType =
  | 'Accidente'
  | 'Incidente'
  | 'Near-miss'
  | 'Condición insegura'
  | 'Acto inseguro'
  | 'Observación de mejora';

export type CriteriaModule = 'supervisor_checklist' | 'safety_checklist' | 'audit';

export type ResponseType = 'C' | 'NC' | 'NA';

export type ActionStatus = 'abierto' | 'en_proceso' | 'cerrado' | 'cancelado';

export type Severity = 'Alta' | 'Media' | 'Baja';

export type Profile = {
  id: string;
  full_name: string;
  role: Role;
  phone: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Plant = {
  id: string;
  name: string;
  address: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  latitude: number | null;
  longitude: number | null;
  active: boolean;
};

export type CriteriaItem = {
  id: string;
  version: number;
  module: CriteriaModule;
  section_key: string;
  section_title: string;
  item_index: number;
  item_text: string;
  suggested_time: string | null;
  active: boolean;
};
