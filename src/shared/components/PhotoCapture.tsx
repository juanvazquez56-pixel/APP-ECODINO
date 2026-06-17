import { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { compressImage } from '@/shared/utils/compressImage';
import { cn } from '@/shared/utils/cn';

type PhotoCaptureProps = {
  label: string;
  value: Blob | string | null; // Blob local sin subir, o string URL/path remoto
  onChange: (blob: Blob | null) => void;
  required?: boolean;
};

export function PhotoCapture({ label, value, onChange, required = false }: PhotoCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (value instanceof Blob) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(typeof value === 'string' ? value : null);
  }, [value]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blob = await compressImage(file);
    onChange(blob);
    e.target.value = '';
  };

  const missing = required && !value;

  return (
    <div>
      <p className="mb-1 text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-bad-600">*</span>}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
      {preview ? (
        <div className="flex items-center gap-3">
          <img src={preview} alt={label} className="h-20 w-20 rounded-xl object-cover" />
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-sm font-medium text-brand-600 hover:underline"
            >
              Cambiar foto
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-1 text-sm font-medium text-bad-600 hover:underline"
            >
              <X className="h-4 w-4" /> Quitar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-xs',
            missing ? 'border-bad-400 text-bad-500' : 'border-slate-300 text-slate-400',
          )}
        >
          <Camera className="h-6 w-6" />
          {missing ? 'Requerida' : 'Foto'}
        </button>
      )}
    </div>
  );
}
