import { SignaturePad } from '@/shared/components/SignaturePad';
import { useSafetyStore } from '@/modules/segurista/store';

export function SafetySignaturesSection() {
  const { draft, setSeguristaSignature, setSupervisorSignature } = useSafetyStore();
  return (
    <div className="flex flex-col gap-6">
      <SignaturePad
        label="Firma del segurista *"
        value={draft.seguristaSignature}
        onChange={setSeguristaSignature}
        onClear={() => setSeguristaSignature(null)}
      />
      <SignaturePad
        label="Firma del supervisor (cierre conjunto) *"
        value={draft.supervisorSignature}
        onChange={setSupervisorSignature}
        onClear={() => setSupervisorSignature(null)}
      />
    </div>
  );
}
