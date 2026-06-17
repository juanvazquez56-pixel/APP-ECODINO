import { SignaturePad } from '@/shared/components/SignaturePad';
import { Field } from '@/shared/components/Field';
import { useSupervisorStore } from '@/modules/supervisor/store';

export function SignaturesSection() {
  const {
    draft,
    setSupervisorSignature,
    setClientSignature,
    setClientSignatureName,
  } = useSupervisorStore();

  return (
    <div className="flex flex-col gap-6">
      <SignaturePad
        label="Firma del supervisor *"
        value={draft.supervisorSignature}
        onChange={setSupervisorSignature}
        onClear={() => setSupervisorSignature(null)}
      />
      <div className="flex flex-col gap-3">
        <SignaturePad
          label="Firma del cliente (opcional)"
          value={draft.clientSignature}
          onChange={setClientSignature}
          onClear={() => setClientSignature(null)}
        />
        <Field
          label="Nombre de quien firma"
          value={draft.clientSignatureName}
          onChange={(e) => setClientSignatureName(e.target.value)}
          placeholder="Nombre del cliente"
        />
      </div>
    </div>
  );
}
