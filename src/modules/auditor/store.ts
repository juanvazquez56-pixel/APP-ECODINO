import { create } from 'zustand';
import { db, newLocalId, type LocalAudit } from '@/db/dexie';
import { savePhoto } from '@/db/photos';
import { forceSyncNow, type ReportPayload } from '@/db/sync';
import { useAuth } from '@/auth/useAuth';
import { captureGeo } from '@/shared/hooks/useGeo';
import { validateAudit } from '@/shared/utils/validators';
import { calcSemaforo } from '@/shared/utils/calcSemaforo';
import {
  emptyFindingRow,
  emptySamplingRow,
  type FindingRow,
  type SamplingRow,
} from '@/types/forms';
import type { Turno } from '@/types/domain';

const nullIfEmpty = (v: string) => (v.trim() === '' ? null : v);

export type AuditGeneral = {
  fecha: string;
  plantId: string;
  supervisorId: string;
  seguristaId: string;
  turno: Turno;
  startTime: string;
  endTime: string;
};

export type AuditDraft = {
  localId: string;
  general: AuditGeneral;
  responses: Record<string, 'C' | 'NC' | 'NA'>;
  observations: Record<string, string>;
  sampling: SamplingRow[];
  findings: FindingRow[];
  auditorSignature: Blob | string | null;
  supervisorSignature: Blob | string | null;
  status: string;
};

function freshDraft(localId: string): AuditDraft {
  const today = new Date().toISOString().slice(0, 10);
  return {
    localId,
    general: { fecha: today, plantId: '', supervisorId: '', seguristaId: '', turno: 'Matutino', startTime: '', endTime: '' },
    responses: {},
    observations: {},
    sampling: [],
    findings: [],
    auditorSignature: null,
    supervisorSignature: null,
    status: 'borrador',
  };
}

/** Conteo y semáforo en vivo a partir de las respuestas. */
export function auditResult(responses: Record<string, 'C' | 'NC' | 'NA'>) {
  let c = 0;
  let nc = 0;
  let na = 0;
  for (const v of Object.values(responses)) {
    if (v === 'C') c += 1;
    else if (v === 'NC') nc += 1;
    else if (v === 'NA') na += 1;
  }
  const { pct, semaforo } = calcSemaforo(c, nc);
  return { c, nc, na, pct, semaforo };
}

type State = {
  draft: AuditDraft;
  newDraft: () => string;
  loadDraft: (localId: string) => Promise<void>;
  updateGeneral: (patch: Partial<AuditGeneral>) => void;
  setResponse: (key: string, value: 'C' | 'NC' | 'NA') => void;
  setObservation: (key: string, value: string) => void;
  addSamplingRow: () => void;
  updateSamplingRow: (i: number, key: keyof SamplingRow, value: any) => void;
  deleteSamplingRow: (i: number) => void;
  addFinding: () => void;
  updateFinding: (i: number, patch: Partial<FindingRow>) => void;
  deleteFinding: (i: number) => void;
  setAuditorSignature: (b: Blob | null) => void;
  setSupervisorSignature: (b: Blob | null) => void;
  saveDraft: () => Promise<void>;
  submitAudit: () => Promise<{ ok: boolean; errors: string[] }>;
};

export const useAuditorStore = create<State>((set, get) => ({
  draft: freshDraft(newLocalId()),

  newDraft: () => {
    const id = newLocalId();
    set({ draft: freshDraft(id) });
    return id;
  },

  loadDraft: async (localId) => {
    const rec = await db.audits.get(localId);
    set({ draft: rec?.data?.draft ? (rec.data.draft as AuditDraft) : freshDraft(localId) });
  },

  updateGeneral: (patch) => set((s) => ({ draft: { ...s.draft, general: { ...s.draft.general, ...patch } } })),
  setResponse: (key, value) =>
    set((s) => {
      const responses = { ...s.draft.responses };
      if (responses[key] === value) delete responses[key]; // toggle off
      else responses[key] = value;
      return { draft: { ...s.draft, responses } };
    }),
  setObservation: (key, value) =>
    set((s) => ({ draft: { ...s.draft, observations: { ...s.draft.observations, [key]: value } } })),

  addSamplingRow: () => set((s) => ({ draft: { ...s.draft, sampling: [...s.draft.sampling, emptySamplingRow()] } })),
  updateSamplingRow: (i, key, value) =>
    set((s) => ({ draft: { ...s.draft, sampling: s.draft.sampling.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)) } })),
  deleteSamplingRow: (i) => set((s) => ({ draft: { ...s.draft, sampling: s.draft.sampling.filter((_, idx) => idx !== i) } })),

  addFinding: () => set((s) => ({ draft: { ...s.draft, findings: [...s.draft.findings, emptyFindingRow()] } })),
  updateFinding: (i, patch) =>
    set((s) => ({ draft: { ...s.draft, findings: s.draft.findings.map((f, idx) => (idx === i ? { ...f, ...patch } : f)) } })),
  deleteFinding: (i) => set((s) => ({ draft: { ...s.draft, findings: s.draft.findings.filter((_, idx) => idx !== i) } })),

  setAuditorSignature: (b) => set((s) => ({ draft: { ...s.draft, auditorSignature: b } })),
  setSupervisorSignature: (b) => set((s) => ({ draft: { ...s.draft, supervisorSignature: b } })),

  saveDraft: async () => {
    await persistLocal(get().draft, false);
  },

  submitAudit: async () => {
    const base = get().draft;
    const result = validateAudit({
      responses: base.responses,
      hasAuditorSignature: !!base.auditorSignature,
      hasSupervisorSignature: !!base.supervisorSignature,
      sampling: base.sampling,
      findings: base.findings,
    });
    if (!result.valid) return { ok: false, errors: result.errors };

    const draft: AuditDraft = { ...base, status: 'enviado' };
    set({ draft });
    const geo = await captureGeo();
    await persistLocal(draft, true, geo);
    void forceSyncNow();
    return { ok: true, errors: [] };
  },
}));

async function persistLocal(
  draft: AuditDraft,
  submit: boolean,
  geo?: { lat: number; lng: number; accuracy: number } | null,
) {
  const auditorId = useAuth.getState().profile?.id ?? null;
  const payload = await buildPayload(draft, auditorId, submit ? 'enviado' : 'borrador', geo);
  const record: LocalAudit = {
    localId: draft.localId,
    remoteId: null,
    data: { draft, ...payload },
    syncStatus: submit ? 'pending' : 'synced',
    lastModified: Date.now(),
  };
  await db.audits.put(record);
}

async function buildPayload(
  draft: AuditDraft,
  auditorId: string | null,
  status: string,
  geo?: { lat: number; lng: number; accuracy: number } | null,
): Promise<ReportPayload> {
  const localId = draft.localId;
  const photos: ReportPayload['photos'] = [];

  if (draft.auditorSignature instanceof Blob) {
    const id = await savePhoto('audit', localId, 'auditor_signature', draft.auditorSignature);
    photos.push({ photoId: id, placement: { kind: 'header', column: 'auditor_signature_path' } });
  }
  if (draft.supervisorSignature instanceof Blob) {
    const id = await savePhoto('audit', localId, 'supervisor_signature', draft.supervisorSignature);
    photos.push({ photoId: id, placement: { kind: 'header', column: 'supervisor_signature_path' } });
  }

  const header: Record<string, any> = {
    id: localId,
    auditor_id: auditorId,
    plant_id: draft.general.plantId,
    supervisor_id: nullIfEmpty(draft.general.supervisorId),
    segurista_id: nullIfEmpty(draft.general.seguristaId),
    audit_date: draft.general.fecha,
    turno: draft.general.turno,
    start_time: nullIfEmpty(draft.general.startTime),
    end_time: nullIfEmpty(draft.general.endTime),
    responses: draft.responses,
    observations: draft.observations,
    capture_lat: geo?.lat ?? null,
    capture_lng: geo?.lng ?? null,
    status,
  };

  // Findings con id generado para enlazar corrective_actions.
  const findingRows: Record<string, any>[] = [];
  const actionRows: Record<string, any>[] = [];
  draft.findings.forEach((f, i) => {
    if (!f.description.trim()) return;
    const findingId = `${localId}-f${i}`;
    findingRows.push({
      id: findingId,
      audit_id: localId,
      description: f.description,
      category: nullIfEmpty(f.category),
      severity: f.severity,
      order_index: i,
    });
    if (f.action.action_description.trim()) {
      actionRows.push({
        finding_id: findingId,
        action_description: f.action.action_description,
        responsible_id: f.action.responsible_id,
        responsible_name: nullIfEmpty(f.action.responsible_name),
        due_date: nullIfEmpty(f.action.due_date),
        status: 'abierto',
      });
    }
  });

  return {
    table: 'audits',
    header,
    photos,
    children: [
      {
        table: 'audit_sampling',
        fk: 'audit_id',
        rows: draft.sampling.map((r, i) => ({
          activity_description: r.activity_description,
          exists_in_site: r.exists_in_site || null,
          quality_ok: r.quality_ok || null,
          photos_match: r.photos_match || null,
          observation: nullIfEmpty(r.observation),
          order_index: i,
        })),
      },
      { table: 'findings', fk: 'audit_id', rows: findingRows },
      { table: 'corrective_actions', fk: 'finding_id', rows: actionRows, skipDelete: true },
    ],
  };
}
