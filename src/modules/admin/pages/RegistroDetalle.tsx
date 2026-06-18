import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { Loading } from '@/shared/components/Loading';
import { EmptyState } from '@/shared/components/EmptyState';
import { SemaforoPill } from '@/shared/components/SemaforoPill';
import { DownloadPdfButton } from '@/pdf/DownloadPdfButton';
import {
  fetchRecordDetail,
  fetchPlantsMap,
  fetchProfilesMap,
  type RecordKind,
} from '@/db/queries/adminRecords';
import { buildPdfDoc, type PdfDoc } from '@/pdf/pdfData';

const VALID: RecordKind[] = ['auditoria', 'supervisor', 'segurista'];

export function RegistroDetalle() {
  const { kind, id } = useParams<{ kind: string; id: string }>();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<PdfDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const validKind = VALID.includes(kind as RecordKind) ? (kind as RecordKind) : null;

  useEffect(() => {
    if (!validKind || !id) {
      setError(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const [detail, plantsMap, profilesMap] = await Promise.all([
          fetchRecordDetail(validKind, id),
          fetchPlantsMap(),
          fetchProfilesMap(),
        ]);
        const authorId =
          validKind === 'auditoria' ? detail.header.auditor_id : detail.header.profile_id;
        const d = await buildPdfDoc(validKind, detail, {
          plantName: plantsMap[detail.header.plant_id] ?? '—',
          authorName: profilesMap[authorId] ?? '—',
        });
        setDoc(d);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [validKind, id]);

  if (loading) return <Loading text="Cargando registro…" />;
  if (error || !doc || !validKind || !id) {
    return <EmptyState title="Registro no encontrado" description="No se pudo cargar este registro." />;
  }

  return (
    <div className="flex flex-col gap-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-brand-600">
        <ChevronLeft className="h-4 w-4" /> Volver
      </button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{doc.title}</h1>
          <p className="text-sm text-slate-500">
            {doc.plantName} · {doc.date} · {doc.authorName}
          </p>
          {doc.compliance && (
            <div className="mt-2">
              <SemaforoPill semaforo={doc.compliance.semaforo} pct={doc.compliance.pct} size="lg" />
            </div>
          )}
        </div>
        <DownloadPdfButton kind={validKind} id={id} plantName={doc.plantName} authorName={doc.authorName} />
      </div>

      {/* Meta */}
      <Card>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {doc.meta.map((m) => (
            <div key={m.label}>
              <p className="text-xs text-slate-500">{m.label}</p>
              <p className="font-medium text-slate-800">{m.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Tablas */}
      {doc.tables
        .filter((t) => t.rows.length > 0)
        .map((t) => (
          <Card key={t.title}>
            <h2 className="mb-3 font-semibold text-slate-700">{t.title}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    {t.columns.map((c) => (
                      <th key={c} className="px-2 py-2 font-medium">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {t.rows.map((row, ri) => (
                    <tr key={ri} className="border-b border-slate-100 last:border-0">
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-2 py-2 text-slate-700">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}

      {/* Hallazgos */}
      {doc.findings.length > 0 && (
        <Card>
          <h2 className="mb-3 font-semibold text-slate-700">Hallazgos</h2>
          <div className="flex flex-col gap-2">
            {doc.findings.map((f, i) => (
              <div key={i} className="rounded-lg border-l-4 border-brand-500 bg-slate-50 p-3">
                <p className="text-sm font-medium text-slate-800">
                  [{f.severity}] {f.description}
                </p>
                <p className="text-xs text-slate-500">
                  Categoría: {f.category} · Acción: {f.action} · Estado: {f.status}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Firmas */}
      {doc.signatures.length > 0 && (
        <Card>
          <h2 className="mb-3 font-semibold text-slate-700">Firmas</h2>
          <div className="flex flex-wrap gap-6">
            {doc.signatures.map((s) => (
              <div key={s.label}>
                <img src={s.url} alt={s.label} className="h-24 w-40 rounded border border-slate-200 object-contain" />
                <p className="mt-1 text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
