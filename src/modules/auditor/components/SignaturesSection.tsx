import { SignaturePad } from '@/shared/components/SignaturePad';
import { useAuditorStore } from '@/modules/auditor/store';

export function AuditSignaturesSection() {
  const { draft, setAuditorSignature, setSupervisorSignature } = useAuditorStore();
  return (
    <div className="flex flex-col gap-6">
      <SignaturePad
        label="Firma del auditor *"
        value={draft.auditorSignature}
        onChange={setAuditorSignature}
        onClear={() => setAuditorSignature(null)}
      />
      <SignaturePad
        label="Firma del supervisor *"
        value={draft.supervisorSignature}
        onChange={setSupervisorSignature}
        onClear={() => setSupervisorSignature(null)}
      />
    </div>
  );
}
