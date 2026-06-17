import { useEffect, useRef, useState } from 'react';
import { Button } from '@/shared/components/Button';

type SignaturePadProps = {
  label: string;
  value: Blob | string | null;
  onChange: (blob: Blob | null) => void;
  onClear: () => void;
};

export function SignaturePad({ label, value, onChange, onClear }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasStroke = useRef(false);
  const [editing, setEditing] = useState(!value);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (value instanceof Blob) {
      const url = URL.createObjectURL(value);
      setSavedUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setSavedUrl(typeof value === 'string' ? value : null);
  }, [value]);

  useEffect(() => {
    if (!editing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1F3864';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [editing]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * e.currentTarget.width,
      y: ((e.clientY - rect.top) / rect.height) * e.currentTarget.height,
    };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const ctx = e.currentTarget.getContext('2d');
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = e.currentTarget.getContext('2d');
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    hasStroke.current = true;
  };

  const end = () => {
    drawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    hasStroke.current = false;
    onClear();
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasStroke.current) return;
    canvas.toBlob((blob) => {
      if (blob) {
        onChange(blob);
        setEditing(false);
      }
    }, 'image/png');
  };

  return (
    <div>
      <p className="mb-1 text-sm font-medium text-slate-700">{label}</p>
      {!editing && savedUrl ? (
        <div className="flex flex-col gap-2">
          <img
            src={savedUrl}
            alt={label}
            className="h-[150px] w-full max-w-[320px] rounded-xl border border-slate-200 bg-white object-contain"
          />
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
            Volver a firmar
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <canvas
            ref={canvasRef}
            width={320}
            height={150}
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={end}
            onPointerLeave={end}
            className="w-full max-w-[320px] touch-none rounded-xl border border-slate-300 bg-white"
          />
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={clearCanvas}>
              Limpiar
            </Button>
            <Button size="sm" onClick={save}>
              Guardar firma
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
