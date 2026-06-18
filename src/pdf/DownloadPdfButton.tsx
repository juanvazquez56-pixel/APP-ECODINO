import { useState } from 'react';
import { FileDown } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { fetchRecordDetail, type RecordKind } from '@/db/queries/adminRecords';
import { buildPdfDoc } from './pdfData';

type Props = {
  kind: RecordKind;
  id: string;
  plantName: string;
  authorName: string;
};

export function DownloadPdfButton({ kind, id, plantName, authorName }: Props) {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    setBusy(true);
    try {
      const detail = await fetchRecordDetail(kind, id);
      const doc = await buildPdfDoc(kind, detail, { plantName, authorName });
      // Lazy import: @react-pdf/renderer + plantilla se cargan solo al pedir el PDF.
      const [{ pdf }, { ReportPdfTemplate }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./ReportPdfTemplate'),
      ]);
      const blob = await pdf(<ReportPdfTemplate doc={doc} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${kind}_${doc.folio}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generando PDF', err);
      alert('No se pudo generar el PDF. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button icon={<FileDown className="h-4 w-4" />} loading={busy} onClick={handleClick}>
      Descargar PDF
    </Button>
  );
}
