import { create } from 'zustand';
import { db, newLocalId, type LocalSafetyReport } from '@/db/dexie';
import { savePhoto } from '@/db/photos';
import { forceSyncNow, type ReportPayload } from '@/db/sync';
import { useAuth } from '@/auth/useAuth';
import { captureGeo } from '@/shared/hooks/useGeo';
import { validateSafetyReport } from '@/shared/utils/validators';
import {
  emptyEppRow,
  emptyPermitRow,
  emptySafetyIncidentRow,
  type EppRow,
  type GeneralInfo,
  type PermitRow,
  type PhotoRef,
  type SafetyIncidentRow,
} from '@/types/forms';

const nullIfEmpty = (v: string) => (v.trim() === '' ? null : v);

export type SafetyTalk = {
  topic: string;
  duration_min: number | null;
  attendees: number | null;
  time: string;
  photo: PhotoRef;
};

export type SafetySummary = {
  personal_epp_completo: number;
  permisos_vigentes: number;
  dias_sin_accidente: number;
  charlas_impartidas: number;
  incidentes_dia: number;
  near_misses: number;
};

export type SafetyDraft = {
  localId: string;
  general: GeneralInfo;
  checklistResponses: Record<string, boolean>;
  checklistObservations: Record<string, string>;
  epp: EppRow[];
  permits: PermitRow[];
  talk: SafetyTalk;
  incidents: SafetyIncidentRow[];
  summary: SafetySummary;
  seguristaSignature: Blob | string | null;
  supervisorSignature: Blob | string | null;
  status: string;
};

function freshDraft(localId: string): SafetyDraft {
  const today = new Date().toISOString().slice(0, 10);
  return {
    localId,
    general: { fecha: today, plantId: '', turno: 'Matutino' },
    checklistResponses: {},
    checklistObservations: {},
    epp: [],
    permits: [],
    talk: { topic: '', duration_min: null, attendees: null, time: '', photo: { photoId: null, path: null } },
    incidents: [],
    summary: {
      personal_epp_completo: 0,
      permisos_vigentes: 0,
      dias_sin_accidente: 0,
      charlas_impartidas: 1,
      incidentes_dia: 0,
      near_misses: 0,
    },
    seguristaSignature: null,
    supervisorSignature: null,
    status: 'borrador',
  };
}

export function computeSafetySummary(draft: SafetyDraft): SafetySummary {
  const eppCompleto = draft.epp.filter(
    (e) => e.casco && e.lentes && e.guantes && e.calzado && e.tapones,
  ).length;
  const incidentes = draft.incidents.length;
  const nearMisses = draft.incidents.filter((i) => i.type === 'Near-miss').length;
  return {
    ...draft.summary,
    personal_epp_completo: eppCompleto,
    permisos_vigentes: draft.permits.length,
    incidentes_dia: incidentes,
    near_misses: nearMisses,
  };
}

type State = {
  draft: SafetyDraft;
  newDraft: () => string;
  loadDraft: (localId: string) => Promise<void>;
  updateGeneral: (patch: Partial<GeneralInfo>) => void;
  setChecklistResponse: (key: string, value: boolean) => void;
  addEppRow: () => void;
  updateEppRow: (i: number, key: keyof EppRow, value: any) => void;
  deleteEppRow: (i: number) => void;
  addPermitRow: () => void;
  updatePermitRow: (i: number, key: keyof PermitRow, value: any) => void;
  deletePermitRow: (i: number) => void;
  addIncidentRow: () => void;
  updateIncidentRow: (i: number, key: keyof SafetyIncidentRow, value: any) => void;
  deleteIncidentRow: (i: number) => void;
  updateTalk: (patch: Partial<SafetyTalk>) => void;
  setSeguristaSignature: (b: Blob | null) => void;
  setSupervisorSignature: (b: Blob | null) => void;
  updateSummary: (patch: Partial<SafetySummary>) => void;
  saveDraft: () => Promise<void>;
  submitReport: () => Promise<{ ok: boolean; errors: string[] }>;
};

export const useSafetyStore = create<State>((set, get) => ({
  draft: freshDraft(newLocalId()),

  newDraft: () => {
    const id = newLocalId();
    set({ draft: freshDraft(id) });
    return id;
  },

  loadDraft: async (localId) => {
    const rec = await db.safetyReports.get(localId);
    set({ draft: rec?.data?.draft ? (rec.data.draft as SafetyDraft) : freshDraft(localId) });
  },

  updateGeneral: (patch) =>
    set((s) => ({ draft: { ...s.draft, general: { ...s.draft.general, ...patch } } })),
  setChecklistResponse: (key, value) =>
    set((s) => ({ draft: { ...s.draft, checklistResponses: { ...s.draft.checklistResponses, [key]: value } } })),

  addEppRow: () => set((s) => ({ draft: { ...s.draft, epp: [...s.draft.epp, emptyEppRow()] } })),
  updateEppRow: (i, key, value) =>
    set((s) => ({ draft: { ...s.draft, epp: s.draft.epp.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)) } })),
  deleteEppRow: (i) => set((s) => ({ draft: { ...s.draft, epp: s.draft.epp.filter((_, idx) => idx !== i) } })),

  addPermitRow: () => set((s) => ({ draft: { ...s.draft, permits: [...s.draft.permits, emptyPermitRow()] } })),
  updatePermitRow: (i, key, value) =>
    set((s) => ({ draft: { ...s.draft, permits: s.draft.permits.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)) } })),
  deletePermitRow: (i) => set((s) => ({ draft: { ...s.draft, permits: s.draft.permits.filter((_, idx) => idx !== i) } })),

  addIncidentRow: () => set((s) => ({ draft: { ...s.draft, incidents: [...s.draft.incidents, emptySafetyIncidentRow()] } })),
  updateIncidentRow: (i, key, value) =>
    set((s) => ({ draft: { ...s.draft, incidents: s.draft.incidents.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)) } })),
  deleteIncidentRow: (i) => set((s) => ({ draft: { ...s.draft, incidents: s.draft.incidents.filter((_, idx) => idx !== i) } })),

  updateTalk: (patch) => set((s) => ({ draft: { ...s.draft, talk: { ...s.draft.talk, ...patch } } })),
  setSeguristaSignature: (b) => set((s) => ({ draft: { ...s.draft, seguristaSignature: b } })),
  setSupervisorSignature: (b) => set((s) => ({ draft: { ...s.draft, supervisorSignature: b } })),
  updateSummary: (patch) => set((s) => ({ draft: { ...s.draft, summary: { ...s.draft.summary, ...patch } } })),

  saveDraft: async () => {
    const draft = { ...get().draft, summary: computeSafetySummary(get().draft) };
    set({ draft });
    await persistLocal(draft, false);
  },

  submitReport: async () => {
    const base = { ...get().draft, summary: computeSafetySummary(get().draft) };
    const result = validateSafetyReport({
      checklistResponses: base.checklistResponses,
      hasSeguristaSignature: !!base.seguristaSignature,
      hasSupervisorSignature: !!base.supervisorSignature,
      talkTopic: base.talk.topic,
      talkDurationMin: base.talk.duration_min,
      talkAttendees: base.talk.attendees,
      incidents: base.incidents,
    });
    if (!result.valid) return { ok: false, errors: result.errors };

    const draft: SafetyDraft = { ...base, status: 'enviado' };
    set({ draft });
    const geo = await captureGeo();
    await persistLocal(draft, true, geo);
    void forceSyncNow();
    return { ok: true, errors: [] };
  },
}));

async function persistLocal(
  draft: SafetyDraft,
  submit: boolean,
  geo?: { lat: number; lng: number; accuracy: number } | null,
) {
  const profileId = useAuth.getState().profile?.id ?? null;
  const payload = await buildPayload(draft, profileId, submit ? 'enviado' : 'borrador', geo);
  const record: LocalSafetyReport = {
    localId: draft.localId,
    remoteId: null,
    data: { draft, ...payload },
    syncStatus: submit ? 'pending' : 'synced',
    lastModified: Date.now(),
  };
  await db.safetyReports.put(record);
}

async function buildPayload(
  draft: SafetyDraft,
  profileId: string | null,
  status: string,
  geo?: { lat: number; lng: number; accuracy: number } | null,
): Promise<ReportPayload> {
  const localId = draft.localId;
  const photos: ReportPayload['photos'] = [];

  if (draft.seguristaSignature instanceof Blob) {
    const id = await savePhoto('safety_report', localId, 'segurista_signature', draft.seguristaSignature);
    photos.push({ photoId: id, placement: { kind: 'header', column: 'segurista_signature_path' } });
  }
  if (draft.supervisorSignature instanceof Blob) {
    const id = await savePhoto('safety_report', localId, 'supervisor_signature', draft.supervisorSignature);
    photos.push({ photoId: id, placement: { kind: 'header', column: 'supervisor_signature_path' } });
  }
  if (draft.talk.photo.blob instanceof Blob) {
    const id = await savePhoto('safety_report', localId, 'talk_signatures', draft.talk.photo.blob);
    photos.push({ photoId: id, placement: { kind: 'header', column: 'talk_signatures_path' } });
  }

  const incidentRows = [];
  for (let i = 0; i < draft.incidents.length; i += 1) {
    const inc = draft.incidents[i];
    if (inc.photo.blob instanceof Blob) {
      const id = await savePhoto('safety_report', localId, `inc_${i}_photo`, inc.photo.blob);
      photos.push({
        photoId: id,
        placement: { kind: 'child', table: 'incidents', rowIndex: i, column: 'photo_path' },
      });
    }
    incidentRows.push({
      occurrence_time: nullIfEmpty(inc.occurrence_time),
      type: inc.type || null,
      description: nullIfEmpty(inc.description),
      affected_area: nullIfEmpty(inc.affected_area),
      affected_people: null,
      immediate_action: nullIfEmpty(inc.immediate_action),
      photo_path: inc.photo.path,
      order_index: i,
    });
  }

  const header: Record<string, any> = {
    id: localId,
    profile_id: profileId,
    plant_id: draft.general.plantId,
    report_date: draft.general.fecha,
    turno: draft.general.turno,
    checklist_responses: draft.checklistResponses,
    checklist_observations: draft.checklistObservations,
    talk_topic: nullIfEmpty(draft.talk.topic),
    talk_duration_min: draft.talk.duration_min,
    talk_attendees: draft.talk.attendees,
    talk_time: nullIfEmpty(draft.talk.time),
    ...draft.summary,
    capture_lat: geo?.lat ?? null,
    capture_lng: geo?.lng ?? null,
    capture_accuracy: geo?.accuracy ?? null,
    status,
  };

  return {
    table: 'safety_reports',
    header,
    photos,
    children: [
      {
        table: 'epp_inspections',
        fk: 'report_id',
        rows: draft.epp.map((r, i) => ({
          worker_name: r.worker_name,
          casco: r.casco,
          lentes: r.lentes,
          guantes: r.guantes,
          calzado: r.calzado,
          tapones: r.tapones,
          other_epp: nullIfEmpty(r.other_epp),
          other_complies: null,
          action_taken: nullIfEmpty(r.action_taken),
          order_index: i,
        })),
      },
      {
        table: 'permits',
        fk: 'report_id',
        rows: draft.permits.map((r, i) => ({
          activity_area: r.activity_area,
          permit_type: r.permit_type || null,
          ats_elaborated: r.ats_elaborated,
          client_signed: r.client_signed || null,
          archived: r.archived,
          observation: nullIfEmpty(r.observation),
          order_index: i,
        })),
      },
      { table: 'incidents', fk: 'report_id', rows: incidentRows },
    ],
  };
}
