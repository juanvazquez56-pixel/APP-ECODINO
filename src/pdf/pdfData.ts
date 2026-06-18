import { sb } from '@/db/supabase';
import type { RecordKind, RecordDetail } from '@/db/queries/adminRecords';
import { calcSemaforo, type Semaforo } from '@/shared/utils/calcSemaforo';
import { SUPERVISOR_CHECKLIST } from '@/catalogs/supervisor-checklist';
import { SAFETY_CHECKLIST } from '@/catalogs/safety-checklist';
import { AUDIT_CRITERIA, auditItemKey } from '@/catalogs/audit-criteria';

export type PdfTable = { title: string; columns: string[]; rows: string[][] };
export type PdfChecklist = { title: string; items: { text: string; value: string }[] }[];
export type PdfFinding = {
  description: string;
  severity: string;
  category: string;
  action: string;
  status: string;
};

export type PdfDoc = {
  kind: RecordKind;
  title: string;
  plantName: string;
  authorName: string;
  date: string;
  folio: string;
  compliance: { pct: number | null; semaforo: Semaforo } | null;
  meta: { label: string; value: string }[];
  checklist: PdfChecklist;
  tables: PdfTable[];
  findings: PdfFinding[];
  signatures: { label: string; url: string }[];
};

const KIND_TITLE: Record<RecordKind, string> = {
  auditoria: 'Reporte de Auditoría',
  supervisor: 'Reporte Operativo (Supervisor)',
  segurista: 'Reporte de Seguridad (Segurista)',
};

const PERMIT_BUCKET = 'reports-photos';

function val(v: any): string {
  if (v === null || v === undefined || v === '') return '—';
  if (v === true) return 'Sí';
  if (v === false) return 'No';
  return String(v);
}

async function signedUrl(path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  try {
    const { data } = await sb.storage.from(PERMIT_BUCKET).createSignedUrl(path, 3600);
    return data?.signedUrl ?? null;
  } catch {
    return null;
  }
}

async function collectSignatures(
  kind: RecordKind,
  header: any,
): Promise<{ label: string; url: string }[]> {
  const specs: { label: string; path: string | null }[] =
    kind === 'auditoria'
      ? [
          { label: 'Firma del auditor', path: header.auditor_signature_path },
          { label: 'Firma del supervisor', path: header.supervisor_signature_path },
        ]
      : kind === 'supervisor'
        ? [
            { label: 'Firma del supervisor', path: header.supervisor_signature_path },
            { label: 'Firma del cliente', path: header.client_signature_path },
          ]
        : [
            { label: 'Firma del segurista', path: header.segurista_signature_path },
            { label: 'Firma del supervisor', path: header.supervisor_signature_path },
          ];

  const out: { label: string; url: string }[] = [];
  for (const s of specs) {
    const url = await signedUrl(s.path);
    if (url) out.push({ label: s.label, url });
  }
  return out;
}

function buildAuditChecklist(responses: Record<string, string>): PdfChecklist {
  const labelOf = (v: string | undefined) =>
    v === 'C' ? 'Cumple' : v === 'NC' ? 'No cumple' : v === 'NA' ? 'N.A.' : 'Sin responder';
  return AUDIT_CRITERIA.flatMap((block) =>
    block.subsections.map((sub) => ({
      title: `${sub.key} ${sub.title}`,
      items: sub.items.map((item, i) => ({
        text: item.text,
        value: labelOf(responses?.[auditItemKey(sub.key, i)]),
      })),
    })),
  );
}

type TaskCatalog = Record<string, { title: string; items: ReadonlyArray<{ text: string; time?: string }> }>;

function buildTaskChecklist(catalog: TaskCatalog, responses: Record<string, boolean>): PdfChecklist {
  return Object.entries(catalog).map(([key, section]) => ({
    title: section.title,
    items: section.items.map((item, i) => ({
      text: item.text,
      value: responses?.[`${key}-${i}`] ? 'Hecho' : 'Pendiente',
    })),
  }));
}

export async function buildPdfDoc(
  kind: RecordKind,
  detail: RecordDetail,
  names: { plantName: string; authorName: string },
): Promise<PdfDoc> {
  const h = detail.header;
  const c = detail.children;

  let compliance: PdfDoc['compliance'] = null;
  let checklist: PdfChecklist = [];
  const tables: PdfTable[] = [];
  const findings: PdfFinding[] = [];
  const meta: { label: string; value: string }[] = [];

  if (kind === 'auditoria') {
    const pct = h.pct_cumplimiento != null ? Number(h.pct_cumplimiento) : null;
    const sem = (h.semaforo as Semaforo) ?? calcSemaforo(h.total_cumple ?? 0, h.total_no_cumple ?? 0).semaforo;
    compliance = { pct, semaforo: sem };
    meta.push(
      { label: 'Turno', value: val(h.turno) },
      { label: 'Cumple / No cumple / N.A.', value: `${h.total_cumple ?? 0} / ${h.total_no_cumple ?? 0} / ${h.total_na ?? 0}` },
      { label: 'Hora inicio', value: val(h.start_time) },
      { label: 'Hora fin', value: val(h.end_time) },
    );
    checklist = buildAuditChecklist(h.responses ?? {});
    const sampling = c.audit_sampling ?? [];
    tables.push({
      title: 'Muestreo físico',
      columns: ['Actividad', 'Existe', 'Calidad', 'Foto coincide', 'Observación'],
      rows: sampling.map((s: any) => [
        val(s.activity_description),
        val(s.exists_in_site),
        val(s.quality_ok),
        val(s.photos_match),
        val(s.observation),
      ]),
    });
    const fRows = c.findings ?? [];
    const actions = detail.correctiveActions ?? [];
    fRows.forEach((f: any) => {
      const a = actions.find((x: any) => x.finding_id === f.id);
      findings.push({
        description: val(f.description),
        severity: val(f.severity),
        category: val(f.category),
        action: a ? val(a.action_description) : '—',
        status: a ? val(a.status) : 'sin acción',
      });
    });
  } else if (kind === 'supervisor') {
    meta.push(
      { label: 'Turno', value: val(h.turno) },
      { label: 'Clima', value: val(h.weather) },
      { label: 'Asistencias', value: val(h.asistencias) },
      { label: 'Actividades cerradas', value: val(h.actividades_cerradas) },
    );
    checklist = buildTaskChecklist(SUPERVISOR_CHECKLIST, h.checklist_responses ?? {});
    tables.push({
      title: 'Asistencia',
      columns: ['Trabajador', 'Especialidad', 'Entrada', 'Salida', 'Estatus'],
      rows: (c.supervisor_attendance ?? []).map((r: any) => [
        val(r.worker_name),
        val(r.specialty),
        val(r.entrada),
        val(r.salida),
        val(r.status),
      ]),
    });
    tables.push({
      title: 'Actividades',
      columns: ['Actividad', 'Área', 'Responsable', 'Estatus'],
      rows: (c.supervisor_activities ?? []).map((r: any) => [
        val(r.activity_name),
        val(r.area),
        val(r.responsible_name),
        val(r.status),
      ]),
    });
    tables.push({
      title: 'Incidencias',
      columns: ['Descripción', 'Causa', 'Acción tomada'],
      rows: (c.supervisor_incidents ?? []).map((r: any) => [val(r.description), val(r.cause), val(r.action_taken)]),
    });
    tables.push({
      title: 'Materiales',
      columns: ['Material', 'Cantidad', 'Usado en', '¿Faltó?'],
      rows: (c.supervisor_materials ?? []).map((r: any) => [
        val(r.material_name),
        val(r.quantity),
        val(r.used_in),
        val(r.was_missing),
      ]),
    });
  } else {
    meta.push(
      { label: 'Turno', value: val(h.turno) },
      { label: 'Charla', value: val(h.talk_topic) },
      { label: 'Asistentes a charla', value: val(h.talk_attendees) },
      { label: 'Días sin accidente', value: val(h.dias_sin_accidente) },
    );
    checklist = buildTaskChecklist(SAFETY_CHECKLIST, h.checklist_responses ?? {});
    tables.push({
      title: 'Inspección de EPP',
      columns: ['Trabajador', 'Casco', 'Lentes', 'Guantes', 'Calzado', 'Tapones'],
      rows: (c.epp_inspections ?? []).map((r: any) => [
        val(r.worker_name),
        val(r.casco),
        val(r.lentes),
        val(r.guantes),
        val(r.calzado),
        val(r.tapones),
      ]),
    });
    tables.push({
      title: 'Permisos de trabajo',
      columns: ['Actividad/Área', 'Tipo', 'ATS', 'Firmado cliente', 'Archivado'],
      rows: (c.permits ?? []).map((r: any) => [
        val(r.activity_area),
        val(r.permit_type),
        val(r.ats_elaborated),
        val(r.client_signed),
        val(r.archived),
      ]),
    });
    tables.push({
      title: 'Incidentes',
      columns: ['Hora', 'Tipo', 'Descripción', 'Área afectada', 'Acción'],
      rows: (c.incidents ?? []).map((r: any) => [
        val(r.occurrence_time),
        val(r.type),
        val(r.description),
        val(r.affected_area),
        val(r.immediate_action),
      ]),
    });
  }

  const signatures = await collectSignatures(kind, h);
  const date = kind === 'auditoria' ? h.audit_date : h.report_date;

  return {
    kind,
    title: KIND_TITLE[kind],
    plantName: names.plantName,
    authorName: names.authorName,
    date: val(date),
    folio: String(h.id ?? '').slice(0, 8).toUpperCase(),
    compliance,
    meta,
    checklist,
    tables,
    findings,
    signatures,
  };
}
