// Tipos de las filas editables de los formularios operativos.
// Usados por los stores de Zustand, DynamicTable y los validadores.
// Las fotos/firmas se manejan como referencias (IDs en Dexie `photos`) o
// Blobs en memoria; aquí guardamos el id de la foto local.

import type {
  AttendanceStatus,
  ActivityStatus,
  IncidentCause,
  IncidentType,
  PermitType,
  Turno,
} from '@/types/domain';

export type PhotoRef = {
  photoId: string | null; // id en Dexie `photos`
  path: string | null; // ruta remota una vez subida
  blob?: Blob | null; // blob en memoria mientras se edita (aún no persistido)
};

export type AttendanceRow = {
  worker_name: string;
  specialty: string;
  entrada: string;
  salida: string;
  status: AttendanceStatus | '';
  observations: string;
};

export type ActivityRow = {
  activity_name: string;
  area: string;
  responsible_name: string;
  start_time: string;
  end_time: string;
  status: ActivityStatus;
  photo_before: PhotoRef;
  photo_after: PhotoRef;
  observations: string;
};

export type SupervisorIncidentRow = {
  description: string;
  cause: IncidentCause | '';
  action_taken: string;
};

export type MaterialRow = {
  material_name: string;
  quantity: string;
  used_in: string;
  was_missing: boolean;
};

export type EppRow = {
  worker_name: string;
  casco: boolean;
  lentes: boolean;
  guantes: boolean;
  calzado: boolean;
  tapones: boolean;
  other_epp: string;
  action_taken: string;
};

export type PermitRow = {
  activity_area: string;
  permit_type: PermitType | '';
  ats_elaborated: boolean;
  client_signed: 'Sí' | 'No' | 'N.A.' | '';
  archived: boolean;
  observation: string;
};

export type SafetyIncidentRow = {
  occurrence_time: string;
  type: IncidentType | '';
  description: string;
  affected_area: string;
  immediate_action: string;
  photo: PhotoRef;
};

export type SamplingRow = {
  activity_description: string;
  exists_in_site: 'Sí' | 'No' | '';
  quality_ok: 'Sí' | 'No' | '';
  photos_match: 'Sí' | 'No' | 'N.A.' | '';
  observation: string;
};

export type CorrectiveActionDraft = {
  action_description: string;
  responsible_id: string | null;
  responsible_name: string;
  due_date: string;
};

export type FindingRow = {
  description: string;
  category: string;
  severity: 'Alta' | 'Media' | 'Baja';
  action: CorrectiveActionDraft;
};

export type GeneralInfo = {
  fecha: string;
  plantId: string;
  turno: Turno;
  weather?: string;
};

export const emptyAttendanceRow = (): AttendanceRow => ({
  worker_name: '',
  specialty: '',
  entrada: '',
  salida: '',
  status: '',
  observations: '',
});

export const emptyActivityRow = (): ActivityRow => ({
  activity_name: '',
  area: '',
  responsible_name: '',
  start_time: '',
  end_time: '',
  status: 'Pendiente',
  photo_before: { photoId: null, path: null },
  photo_after: { photoId: null, path: null },
  observations: '',
});

export const emptySupervisorIncidentRow = (): SupervisorIncidentRow => ({
  description: '',
  cause: '',
  action_taken: '',
});

export const emptyMaterialRow = (): MaterialRow => ({
  material_name: '',
  quantity: '',
  used_in: '',
  was_missing: false,
});

export const emptyEppRow = (): EppRow => ({
  worker_name: '',
  casco: false,
  lentes: false,
  guantes: false,
  calzado: false,
  tapones: false,
  other_epp: '',
  action_taken: '',
});

export const emptyPermitRow = (): PermitRow => ({
  activity_area: '',
  permit_type: '',
  ats_elaborated: false,
  client_signed: '',
  archived: false,
  observation: '',
});

export const emptySafetyIncidentRow = (): SafetyIncidentRow => ({
  occurrence_time: '',
  type: '',
  description: '',
  affected_area: '',
  immediate_action: '',
  photo: { photoId: null, path: null },
});

export const emptySamplingRow = (): SamplingRow => ({
  activity_description: '',
  exists_in_site: '',
  quality_ok: '',
  photos_match: '',
  observation: '',
});

export const emptyFindingRow = (): FindingRow => ({
  description: '',
  category: '',
  severity: 'Media',
  action: { action_description: '', responsible_id: null, responsible_name: '', due_date: '' },
});
