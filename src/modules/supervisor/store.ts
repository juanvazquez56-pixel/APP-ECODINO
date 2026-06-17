import { create } from 'zustand';
import { db, newLocalId, type LocalSupervisorReport } from '@/db/dexie';
import { savePhoto } from '@/db/photos';
import { forceSyncNow, type ReportPayload } from '@/db/sync';
import { useAuth } from '@/auth/useAuth';
import { captureGeo } from '@/shared/hooks/useGeo';
import { validateSupervisorReport } from '@/shared/utils/validators';
import {
  emptyActivityRow,
  emptyAttendanceRow,
  emptyMaterialRow,
  emptySupervisorIncidentRow,
  type ActivityRow,
  type AttendanceRow,
  type GeneralInfo,
  type MaterialRow,
  type SupervisorIncidentRow,
} from '@/types/forms';

const nullIfEmpty = (v: string) => (v.trim() === '' ? null : v);

export type SupervisorSummary = {
  personal_programado: number;
  asistencias: number;
  faltas: number;
  retardos: number;
  actividades_asignadas: number;
  actividades_cerradas: number;
  actividades_pendientes: number;
  actividades_con_evidencia: number;
};

export type SupervisorDraft = {
  localId: string;
  general: GeneralInfo;
  checklistResponses: Record<string, boolean>;
  checklistObservations: Record<string, string>;
  attendance: AttendanceRow[];
  activities: ActivityRow[];
  incidents: SupervisorIncidentRow[];
  materials: MaterialRow[];
  summary: SupervisorSummary;
  supervisorSignature: Blob | string | null;
  clientSignature: Blob | string | null;
  clientSignatureName: string;
  status: string;
};

function freshDraft(localId: string): SupervisorDraft {
  const today = new Date().toISOString().slice(0, 10);
  return {
    localId,
    general: { fecha: today, plantId: '', turno: 'Matutino', weather: '' },
    checklistResponses: {},
    checklistObservations: {},
    attendance: [],
    activities: [],
    incidents: [],
    materials: [],
    summary: {
      personal_programado: 0,
      asistencias: 0,
      faltas: 0,
      retardos: 0,
      actividades_asignadas: 0,
      actividades_cerradas: 0,
      actividades_pendientes: 0,
      actividades_con_evidencia: 0,
    },
    supervisorSignature: null,
    clientSignature: null,
    clientSignatureName: '',
    status: 'borrador',
  };
}

/** Recalcula los campos auto del resumen a partir de las tablas. */
export function computeSummary(draft: SupervisorDraft): SupervisorSummary {
  const asistencias = draft.attendance.filter((a) =>
    ['Asistió', 'Retardo'].includes(a.status as string),
  ).length;
  const faltas = draft.attendance.filter((a) =>
    (a.status as string).startsWith('Falta'),
  ).length;
  const retardos = draft.attendance.filter((a) => a.status === 'Retardo').length;
  const cerradas = draft.activities.filter((a) => a.status.startsWith('Cerrado')).length;
  const pendientes = draft.activities.filter((a) =>
    ['Pendiente', 'En proceso', 'Detenido', 'Reprogramado'].includes(a.status),
  ).length;
  const conEvidencia = draft.activities.filter(
    (a) => (a.photo_before.blob || a.photo_before.path) && (a.photo_after.blob || a.photo_after.path),
  ).length;
  return {
    ...draft.summary,
    asistencias,
    faltas,
    retardos,
    actividades_asignadas: draft.activities.length,
    actividades_cerradas: cerradas,
    actividades_pendientes: pendientes,
    actividades_con_evidencia: conEvidencia,
  };
}

type State = {
  draft: SupervisorDraft;
  setDraft: (d: SupervisorDraft) => void;
  newDraft: () => string;
  loadDraft: (localId: string) => Promise<void>;
  updateGeneral: (patch: Partial<GeneralInfo>) => void;
  setChecklistResponse: (key: string, value: boolean) => void;
  setChecklistObservation: (key: string, value: string) => void;
  // tablas
  addAttendanceRow: () => void;
  updateAttendanceRow: (i: number, key: keyof AttendanceRow, value: any) => void;
  deleteAttendanceRow: (i: number) => void;
  addActivityRow: () => void;
  updateActivityRow: (i: number, key: keyof ActivityRow, value: any) => void;
  deleteActivityRow: (i: number) => void;
  addIncidentRow: () => void;
  updateIncidentRow: (i: number, key: keyof SupervisorIncidentRow, value: any) => void;
  deleteIncidentRow: (i: number) => void;
  addMaterialRow: () => void;
  updateMaterialRow: (i: number, key: keyof MaterialRow, value: any) => void;
  deleteMaterialRow: (i: number) => void;
  // firmas / resumen
  setSupervisorSignature: (b: Blob | null) => void;
  setClientSignature: (b: Blob | null) => void;
  setClientSignatureName: (n: string) => void;
  updateSummary: (patch: Partial<SupervisorSummary>) => void;
  // persistencia
  saveDraft: () => Promise<void>;
  submitReport: () => Promise<{ ok: boolean; errors: string[] }>;
};

export const useSupervisorStore = create<State>((set, get) => ({
  draft: freshDraft(newLocalId()),

  setDraft: (d) => set({ draft: d }),

  newDraft: () => {
    const id = newLocalId();
    set({ draft: freshDraft(id) });
    return id;
  },

  loadDraft: async (localId) => {
    const rec = await db.supervisorReports.get(localId);
    if (rec?.data?.draft) {
      set({ draft: rec.data.draft as SupervisorDraft });
    } else {
      set({ draft: freshDraft(localId) });
    }
  },

  updateGeneral: (patch) =>
    set((s) => ({ draft: { ...s.draft, general: { ...s.draft.general, ...patch } } })),

  setChecklistResponse: (key, value) =>
    set((s) => ({
      draft: { ...s.draft, checklistResponses: { ...s.draft.checklistResponses, [key]: value } },
    })),

  setChecklistObservation: (key, value) =>
    set((s) => ({
      draft: { ...s.draft, checklistObservations: { ...s.draft.checklistObservations, [key]: value } },
    })),

  addAttendanceRow: () =>
    set((s) => ({ draft: { ...s.draft, attendance: [...s.draft.attendance, emptyAttendanceRow()] } })),
  updateAttendanceRow: (i, key, value) =>
    set((s) => {
      const attendance = s.draft.attendance.map((r, idx) => (idx === i ? { ...r, [key]: value } : r));
      return { draft: { ...s.draft, attendance } };
    }),
  deleteAttendanceRow: (i) =>
    set((s) => ({ draft: { ...s.draft, attendance: s.draft.attendance.filter((_, idx) => idx !== i) } })),

  addActivityRow: () =>
    set((s) => ({ draft: { ...s.draft, activities: [...s.draft.activities, emptyActivityRow()] } })),
  updateActivityRow: (i, key, value) =>
    set((s) => {
      const activities = s.draft.activities.map((r, idx) => (idx === i ? { ...r, [key]: value } : r));
      return { draft: { ...s.draft, activities } };
    }),
  deleteActivityRow: (i) =>
    set((s) => ({ draft: { ...s.draft, activities: s.draft.activities.filter((_, idx) => idx !== i) } })),

  addIncidentRow: () =>
    set((s) => ({ draft: { ...s.draft, incidents: [...s.draft.incidents, emptySupervisorIncidentRow()] } })),
  updateIncidentRow: (i, key, value) =>
    set((s) => {
      const incidents = s.draft.incidents.map((r, idx) => (idx === i ? { ...r, [key]: value } : r));
      return { draft: { ...s.draft, incidents } };
    }),
  deleteIncidentRow: (i) =>
    set((s) => ({ draft: { ...s.draft, incidents: s.draft.incidents.filter((_, idx) => idx !== i) } })),

  addMaterialRow: () =>
    set((s) => ({ draft: { ...s.draft, materials: [...s.draft.materials, emptyMaterialRow()] } })),
  updateMaterialRow: (i, key, value) =>
    set((s) => {
      const materials = s.draft.materials.map((r, idx) => (idx === i ? { ...r, [key]: value } : r));
      return { draft: { ...s.draft, materials } };
    }),
  deleteMaterialRow: (i) =>
    set((s) => ({ draft: { ...s.draft, materials: s.draft.materials.filter((_, idx) => idx !== i) } })),

  setSupervisorSignature: (b) => set((s) => ({ draft: { ...s.draft, supervisorSignature: b } })),
  setClientSignature: (b) => set((s) => ({ draft: { ...s.draft, clientSignature: b } })),
  setClientSignatureName: (n) => set((s) => ({ draft: { ...s.draft, clientSignatureName: n } })),
  updateSummary: (patch) => set((s) => ({ draft: { ...s.draft, summary: { ...s.draft.summary, ...patch } } })),

  saveDraft: async () => {
    const draft = { ...get().draft, summary: computeSummary(get().draft) };
    set({ draft });
    await persistLocal(draft, 'pending', false);
  },

  submitReport: async () => {
    const base = { ...get().draft, summary: computeSummary(get().draft) };
    const result = validateSupervisorReport({
      checklistResponses: base.checklistResponses,
      hasSupervisorSignature: !!base.supervisorSignature,
      attendance: base.attendance,
      activities: base.activities,
    });
    if (!result.valid) return { ok: false, errors: result.errors };

    const draft: SupervisorDraft = { ...base, activities: result.adjustedActivities, status: 'enviado' };
    set({ draft });
    // Captura silenciosa de geolocalización SOLO al enviar.
    const geo = await captureGeo();
    await persistLocal(draft, 'pending', true, geo);
    void forceSyncNow();
    return { ok: true, errors: [] };
  },
}));

// =====================================================
// Persistencia a Dexie + construcción del payload de sync
// =====================================================
async function persistLocal(
  draft: SupervisorDraft,
  syncStatus: 'pending' | 'synced',
  submit: boolean,
  geo?: { lat: number; lng: number; accuracy: number } | null,
) {
  const profileId = useAuth.getState().profile?.id ?? null;
  const payload = await buildPayload(draft, profileId, submit ? 'enviado' : 'borrador', geo);

  const record: LocalSupervisorReport = {
    localId: draft.localId,
    remoteId: null,
    data: { draft, ...payload },
    syncStatus: submit ? 'pending' : syncStatus,
    lastModified: Date.now(),
  };
  // Si solo es borrador local (no enviado), no encolar para sync todavía.
  if (!submit) record.syncStatus = 'synced';
  await db.supervisorReports.put(record);
}

async function buildPayload(
  draft: SupervisorDraft,
  profileId: string | null,
  status: string,
  geo?: { lat: number; lng: number; accuracy: number } | null,
): Promise<ReportPayload> {
  const localId = draft.localId;
  const photos: ReportPayload['photos'] = [];

  // Firmas (header)
  if (draft.supervisorSignature instanceof Blob) {
    const id = await savePhoto('supervisor_report', localId, 'supervisor_signature', draft.supervisorSignature);
    photos.push({ photoId: id, placement: { kind: 'header', column: 'supervisor_signature_path' } });
  }
  if (draft.clientSignature instanceof Blob) {
    const id = await savePhoto('supervisor_report', localId, 'client_signature', draft.clientSignature);
    photos.push({ photoId: id, placement: { kind: 'header', column: 'client_signature_path' } });
  }

  // Actividades + fotos
  const activityRows = [];
  for (let i = 0; i < draft.activities.length; i += 1) {
    const a = draft.activities[i];
    if (a.photo_before.blob instanceof Blob) {
      const id = await savePhoto('supervisor_report', localId, `act_${i}_before`, a.photo_before.blob);
      photos.push({
        photoId: id,
        placement: { kind: 'child', table: 'supervisor_activities', rowIndex: i, column: 'photo_before_path' },
      });
    }
    if (a.photo_after.blob instanceof Blob) {
      const id = await savePhoto('supervisor_report', localId, `act_${i}_after`, a.photo_after.blob);
      photos.push({
        photoId: id,
        placement: { kind: 'child', table: 'supervisor_activities', rowIndex: i, column: 'photo_after_path' },
      });
    }
    activityRows.push({
      activity_name: a.activity_name,
      area: nullIfEmpty(a.area),
      responsible_name: nullIfEmpty(a.responsible_name),
      start_time: nullIfEmpty(a.start_time),
      end_time: nullIfEmpty(a.end_time),
      status: a.status,
      photo_before_path: a.photo_before.path,
      photo_after_path: a.photo_after.path,
      observations: nullIfEmpty(a.observations),
      order_index: i,
    });
  }

  const header: Record<string, any> = {
    id: localId,
    profile_id: profileId,
    plant_id: draft.general.plantId,
    report_date: draft.general.fecha,
    turno: draft.general.turno,
    weather: nullIfEmpty(draft.general.weather ?? ''),
    checklist_responses: draft.checklistResponses,
    checklist_observations: draft.checklistObservations,
    ...draft.summary,
    client_signature_name: nullIfEmpty(draft.clientSignatureName),
    capture_lat: geo?.lat ?? null,
    capture_lng: geo?.lng ?? null,
    capture_accuracy: geo?.accuracy ?? null,
    status,
  };

  return {
    table: 'supervisor_reports',
    header,
    photos,
    children: [
      {
        table: 'supervisor_attendance',
        fk: 'report_id',
        rows: draft.attendance.map((r, i) => ({
          worker_name: r.worker_name,
          specialty: nullIfEmpty(r.specialty),
          entrada: nullIfEmpty(r.entrada),
          salida: nullIfEmpty(r.salida),
          status: r.status || null,
          observations: nullIfEmpty(r.observations),
          order_index: i,
        })),
      },
      { table: 'supervisor_activities', fk: 'report_id', rows: activityRows },
      {
        table: 'supervisor_incidents',
        fk: 'report_id',
        rows: draft.incidents.map((r, i) => ({
          description: r.description,
          cause: r.cause || null,
          action_taken: nullIfEmpty(r.action_taken),
          order_index: i,
        })),
      },
      {
        table: 'supervisor_materials',
        fk: 'report_id',
        rows: draft.materials.map((r, i) => ({
          material_name: r.material_name,
          quantity: nullIfEmpty(r.quantity),
          used_in: nullIfEmpty(r.used_in),
          was_missing: r.was_missing,
          order_index: i,
        })),
      },
    ],
  };
}
