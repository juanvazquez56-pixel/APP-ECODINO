import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/shared/components/Header';
import { BottomBar } from '@/shared/components/BottomBar';
import { Button } from '@/shared/components/Button';
import { Banner } from '@/shared/components/Banner';
import { Accordion } from '@/shared/components/Accordion';
import { SyncBadge } from '@/shared/components/SyncBadge';
import { Field } from '@/shared/components/Field';
import { useOnline } from '@/shared/hooks/useOnline';
import { AUDIT_BLOCK_A, AUDIT_BLOCK_B, auditItemKey } from '@/catalogs/audit-criteria';
import { fetchActivePlants, fetchProfilesByRole } from '@/db/queries/catalogs';
import { checkReportsSubmittedForDate } from '@/db/queries/audits';
import { auditResult, useAuditorStore } from '@/modules/auditor/store';
import { BlockBanner } from './components/BlockBanner';
import { CriteriaSubsection } from './components/CriteriaSubsection';
import { SamplingTable } from './components/SamplingTable';
import { ResultCard } from './components/ResultCard';
import { FindingsSection } from './components/FindingsSection';
import { AuditSignaturesSection } from './components/SignaturesSection';
import { calcSemaforo } from '@/shared/utils/calcSemaforo';
import type { Turno } from '@/types/domain';
import { formatDateTime } from '@/shared/utils/formatDate';

const TURNOS: Turno[] = ['Matutino', 'Vespertino', 'Nocturno'];

type Person = { id: string; full_name: string };

function blockPct(responses: Record<string, 'C' | 'NC' | 'NA'>, block: typeof AUDIT_BLOCK_A) {
  let c = 0;
  let nc = 0;
  for (const sub of block.subsections) {
    sub.items.forEach((_, i) => {
      const v = responses[auditItemKey(sub.key, i)];
      if (v === 'C') c += 1;
      else if (v === 'NC') nc += 1;
    });
  }
  return calcSemaforo(c, nc).pct;
}

export function AuditFormPage() {
  const { localId } = useParams<{ localId: string }>();
  const navigate = useNavigate();
  const online = useOnline();
  const { draft, loadDraft, updateGeneral, saveDraft, submitAudit } = useAuditorStore();
  const [plants, setPlants] = useState<Person[]>([]);
  const [supervisors, setSupervisors] = useState<Person[]>([]);
  const [seguristas, setSeguristas] = useState<Person[]>([]);
  const [crossCheck, setCrossCheck] = useState<Awaited<ReturnType<typeof checkReportsSubmittedForDate>> | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const readOnly = draft.status !== 'borrador';

  useEffect(() => {
    if (localId) void loadDraft(localId);
  }, [localId, loadDraft]);

  useEffect(() => {
    fetchActivePlants().then((p) => setPlants(p.map((x: any) => ({ id: x.id, full_name: x.name })))).catch(() => {});
    fetchProfilesByRole('supervisor').then((p) => setSupervisors(p as Person[])).catch(() => {});
    fetchProfilesByRole('segurista').then((p) => setSeguristas(p as Person[])).catch(() => {});
  }, []);

  // Cruce automático (requiere conexión).
  useEffect(() => {
    if (!online || !draft.general.plantId || !draft.general.fecha) {
      setCrossCheck(null);
      return;
    }
    checkReportsSubmittedForDate(draft.general.plantId, draft.general.fecha)
      .then(setCrossCheck)
      .catch(() => setCrossCheck(null));
  }, [online, draft.general.plantId, draft.general.fecha]);

  const result = auditResult(draft.responses);

  const handleSave = async () => {
    setSaving(true);
    await saveDraft();
    setSaving(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await submitAudit();
    setSubmitting(false);
    if (!res.ok) {
      setErrors(res.errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrors([]);
    navigate('/auditor', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header title="Auditoría" showBack onBack={() => navigate('/auditor')} right={<SyncBadge />} />

      <main className="flex flex-1 flex-col gap-3 p-4 pb-28">
        {errors.length > 0 && (
          <Banner tone="error" title="Corrige antes de enviar">
            <ul className="list-disc pl-4">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </Banner>
        )}

        {readOnly && (
          <Banner tone="info" title="Auditoría enviada">
            Esta auditoría ya fue enviada. Se muestra en modo lectura.
          </Banner>
        )}

        <Accordion title="Datos generales" defaultOpen>
          <div className="flex flex-col gap-3">
            <Field label="Fecha" type="date" value={draft.general.fecha} onChange={(e) => updateGeneral({ fecha: e.target.value })} />
            <Select
              label="Planta"
              value={draft.general.plantId}
              onChange={(v) => updateGeneral({ plantId: v })}
              options={plants}
              placeholder="Selecciona una planta…"
            />
            <Select
              label="Supervisor en turno"
              value={draft.general.supervisorId}
              onChange={(v) => updateGeneral({ supervisorId: v })}
              options={supervisors}
              placeholder="Selecciona…"
            />
            <Select
              label="Segurista (opcional)"
              value={draft.general.seguristaId}
              onChange={(v) => updateGeneral({ seguristaId: v })}
              options={seguristas}
              placeholder="Selecciona…"
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Turno</label>
              <div className="flex gap-2">
                {TURNOS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => updateGeneral({ turno: t })}
                    className={
                      'flex-1 rounded-xl border py-2 text-sm font-medium ' +
                      (draft.general.turno === t ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-300 text-slate-600')
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Hora inicio" type="time" value={draft.general.startTime} onChange={(e) => updateGeneral({ startTime: e.target.value })} />
              <Field label="Hora fin" type="time" value={draft.general.endTime} onChange={(e) => updateGeneral({ endTime: e.target.value })} />
            </div>
          </div>
        </Accordion>

        {/* Cruce automático */}
        {!online ? (
          <Banner tone="warn" title="Cruce no disponible sin conexión" />
        ) : crossCheck ? (
          <div className="flex flex-col gap-2">
            <Banner
              tone={crossCheck.supervisorSubmitted ? 'info' : 'warn'}
              title={
                crossCheck.supervisorSubmitted
                  ? `✓ Supervisor entregó su reporte${crossCheck.supervisorTime ? ` (${formatDateTime(crossCheck.supervisorTime)})` : ''}`
                  : '⚠ Supervisor aún no entrega reporte de hoy'
              }
            />
            <Banner
              tone={crossCheck.seguristaSubmitted ? 'info' : 'warn'}
              title={
                crossCheck.seguristaSubmitted
                  ? `✓ Segurista entregó su reporte${crossCheck.seguristaTime ? ` (${formatDateTime(crossCheck.seguristaTime)})` : ''}`
                  : '⚠ Segurista aún no entrega reporte de hoy'
              }
            />
          </div>
        ) : null}

        {/* BLOQUE A */}
        <BlockBanner label={AUDIT_BLOCK_A.label} color="green" pct={blockPct(draft.responses, AUDIT_BLOCK_A)} />
        {AUDIT_BLOCK_A.subsections.map((sub) => (
          <CriteriaSubsection key={sub.key} sub={sub} />
        ))}
        <Accordion title="A.5 Muestreo físico" badge={`${draft.sampling.length}`}>
          <SamplingTable />
        </Accordion>

        {/* BLOQUE B */}
        <BlockBanner label={AUDIT_BLOCK_B.label} color="amber" pct={blockPct(draft.responses, AUDIT_BLOCK_B)} />
        {AUDIT_BLOCK_B.subsections.map((sub) => (
          <CriteriaSubsection key={sub.key} sub={sub} />
        ))}

        {/* RESULTADO */}
        <ResultCard />
        {result.semaforo === 'rojo' && (
          <Banner tone="error" title="Resultado en rojo">
            Debes registrar al menos un hallazgo con acción correctiva para poder enviar.
          </Banner>
        )}

        <Accordion title="Hallazgos críticos y acciones correctivas" defaultOpen={result.semaforo === 'rojo'} badge={`${draft.findings.length}`}>
          <FindingsSection people={[...supervisors, ...seguristas]} />
        </Accordion>

        <Accordion title="Firmas" color={draft.auditorSignature && draft.supervisorSignature ? 'green' : 'slate'}>
          <AuditSignaturesSection />
        </Accordion>
      </main>

      {!readOnly && (
        <BottomBar>
          <Button variant="secondary" fullWidth loading={saving} onClick={handleSave}>
            Guardar borrador
          </Button>
          <Button fullWidth loading={submitting} onClick={handleSubmit}>
            Enviar auditoría
          </Button>
        </BottomBar>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Person[];
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <select
        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.full_name}
          </option>
        ))}
      </select>
    </div>
  );
}
