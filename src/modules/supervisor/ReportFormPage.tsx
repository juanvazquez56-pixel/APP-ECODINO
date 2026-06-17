import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/shared/components/Header';
import { BottomBar } from '@/shared/components/BottomBar';
import { Button } from '@/shared/components/Button';
import { Banner } from '@/shared/components/Banner';
import { Accordion } from '@/shared/components/Accordion';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { SyncBadge } from '@/shared/components/SyncBadge';
import { Field } from '@/shared/components/Field';
import { ChecklistSection } from '@/shared/components/ChecklistSection';
import { countSectionResponses } from '@/shared/utils/checklist';
import { SUPERVISOR_CHECKLIST, SUPERVISOR_CHECKLIST_TOTAL } from '@/catalogs/supervisor-checklist';
import { fetchActivePlants } from '@/db/queries/catalogs';
import { useSupervisorStore } from '@/modules/supervisor/store';
import { AttendanceTable } from './components/AttendanceTable';
import { ActivitiesTable } from './components/ActivitiesTable';
import { IncidentsTable } from './components/IncidentsTable';
import { MaterialsTable } from './components/MaterialsTable';
import { SummarySection } from './components/SummarySection';
import { SignaturesSection } from './components/SignaturesSection';
import type { Turno } from '@/types/domain';

const TURNOS: Turno[] = ['Matutino', 'Vespertino', 'Nocturno'];

export function SupervisorReportFormPage() {
  const { localId } = useParams<{ localId: string }>();
  const navigate = useNavigate();
  const {
    draft,
    loadDraft,
    updateGeneral,
    setChecklistResponse,
    saveDraft,
    submitReport,
  } = useSupervisorStore();
  const [plants, setPlants] = useState<{ id: string; name: string }[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const readOnly = draft.status !== 'borrador';

  useEffect(() => {
    if (localId) void loadDraft(localId);
  }, [localId, loadDraft]);

  useEffect(() => {
    fetchActivePlants()
      .then((p) => setPlants(p.map((x: any) => ({ id: x.id, name: x.name }))))
      .catch(() => setPlants([]));
  }, []);

  const sectionCounts = useMemo(() => {
    const r = draft.checklistResponses;
    return {
      inicio: countSectionResponses('inicio_turno', SUPERVISOR_CHECKLIST.inicio_turno.items.length, r),
      durante: countSectionResponses('durante_turno', SUPERVISOR_CHECKLIST.durante_turno.items.length, r),
      cierre: countSectionResponses('cierre_turno', SUPERVISOR_CHECKLIST.cierre_turno.items.length, r),
    };
  }, [draft.checklistResponses]);

  const progress = useMemo(() => {
    const respondedChecklist = Object.values(draft.checklistResponses).filter(Boolean).length;
    let done = respondedChecklist;
    let total = SUPERVISOR_CHECKLIST_TOTAL;
    // secciones con al menos 1 fila
    total += 3;
    if (draft.attendance.length > 0) done += 1;
    if (draft.activities.length > 0) done += 1;
    if (draft.materials.length > 0 || draft.incidents.length > 0) done += 1;
    // firmas
    total += 1;
    if (draft.supervisorSignature) done += 1;
    return Math.round((done / total) * 100);
  }, [draft]);

  const handleSave = async () => {
    setSaving(true);
    await saveDraft();
    setSaving(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const result = await submitReport();
    setSubmitting(false);
    if (!result.ok) {
      setErrors(result.errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrors([]);
    navigate('/supervisor', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        title="Reporte operativo"
        showBack
        onBack={() => navigate('/supervisor')}
        right={<SyncBadge />}
      />
      <div className="bg-brand-500 px-4 pb-3">
        <ProgressBar value={progress} />
      </div>

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
          <Banner tone="info" title="Reporte enviado">
            Este reporte ya fue enviado ({draft.status}). Se muestra en modo lectura.
          </Banner>
        )}

        <Accordion title="Datos del día" defaultOpen badge={draft.general.plantId ? '✓' : undefined}>
          <div className="flex flex-col gap-3">
            <Field
              label="Fecha"
              type="date"
              value={draft.general.fecha}
              onChange={(e) => updateGeneral({ fecha: e.target.value })}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Planta</label>
              <select
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={draft.general.plantId}
                onChange={(e) => updateGeneral({ plantId: e.target.value })}
              >
                <option value="">Selecciona una planta…</option>
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
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
                      (draft.general.turno === t
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-slate-300 text-slate-600')
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <Field
              label="Clima (opcional)"
              value={draft.general.weather ?? ''}
              onChange={(e) => updateGeneral({ weather: e.target.value })}
              placeholder="Soleado, lluvia…"
            />
          </div>
        </Accordion>

        <Accordion
          title="Checklist — Inicio de turno"
          badge={`${sectionCounts.inicio}/${SUPERVISOR_CHECKLIST.inicio_turno.items.length}`}
          color={sectionCounts.inicio === SUPERVISOR_CHECKLIST.inicio_turno.items.length ? 'green' : 'slate'}
        >
          <ChecklistSection
            sectionKey="inicio_turno"
            items={SUPERVISOR_CHECKLIST.inicio_turno.items}
            responses={draft.checklistResponses}
            onToggle={setChecklistResponse}
          />
        </Accordion>

        <Accordion
          title="Checklist — Durante el turno"
          badge={`${sectionCounts.durante}/${SUPERVISOR_CHECKLIST.durante_turno.items.length}`}
          color={sectionCounts.durante === SUPERVISOR_CHECKLIST.durante_turno.items.length ? 'green' : 'slate'}
        >
          <ChecklistSection
            sectionKey="durante_turno"
            items={SUPERVISOR_CHECKLIST.durante_turno.items}
            responses={draft.checklistResponses}
            onToggle={setChecklistResponse}
          />
        </Accordion>

        <Accordion
          title="Checklist — Cierre de turno"
          badge={`${sectionCounts.cierre}/${SUPERVISOR_CHECKLIST.cierre_turno.items.length}`}
          color={sectionCounts.cierre === SUPERVISOR_CHECKLIST.cierre_turno.items.length ? 'green' : 'slate'}
        >
          <ChecklistSection
            sectionKey="cierre_turno"
            items={SUPERVISOR_CHECKLIST.cierre_turno.items}
            responses={draft.checklistResponses}
            onToggle={setChecklistResponse}
          />
        </Accordion>

        <Accordion title="Control de asistencia" badge={`${draft.attendance.length}`}>
          <AttendanceTable />
        </Accordion>

        <Accordion title="Actividades del día" badge={`${draft.activities.length}`}>
          <ActivitiesTable />
        </Accordion>

        <Accordion title="Incidencias y pendientes" badge={`${draft.incidents.length}`}>
          <IncidentsTable />
        </Accordion>

        <Accordion title="Materiales y herramienta" badge={`${draft.materials.length}`}>
          <MaterialsTable />
        </Accordion>

        <Accordion title="Resumen numérico">
          <SummarySection />
        </Accordion>

        <Accordion title="Firmas" color={draft.supervisorSignature ? 'green' : 'slate'}>
          <SignaturesSection />
        </Accordion>
      </main>

      {!readOnly && (
        <BottomBar>
          <Button variant="secondary" fullWidth loading={saving} onClick={handleSave}>
            Guardar borrador
          </Button>
          <Button fullWidth loading={submitting} onClick={handleSubmit}>
            Enviar reporte
          </Button>
        </BottomBar>
      )}
    </div>
  );
}
