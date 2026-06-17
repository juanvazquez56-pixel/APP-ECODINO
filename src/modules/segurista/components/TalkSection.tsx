import { Field } from '@/shared/components/Field';
import { PhotoCapture } from '@/shared/components/PhotoCapture';
import { useSafetyStore } from '@/modules/segurista/store';

export function TalkSection() {
  const { draft, updateTalk } = useSafetyStore();
  const { talk } = draft;

  return (
    <div className="flex flex-col gap-3">
      <Field
        label="Tema de la charla"
        value={talk.topic}
        onChange={(e) => updateTalk({ topic: e.target.value })}
        placeholder="Ej. Uso correcto de arnés"
      />
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Duración (min)"
          type="number"
          value={talk.duration_min ?? ''}
          onChange={(e) => updateTalk({ duration_min: e.target.valueAsNumber || null })}
        />
        <Field
          label="Asistentes"
          type="number"
          value={talk.attendees ?? ''}
          onChange={(e) => updateTalk({ attendees: e.target.valueAsNumber || null })}
        />
      </div>
      <Field
        label="Hora"
        type="time"
        value={talk.time}
        onChange={(e) => updateTalk({ time: e.target.value })}
      />
      <PhotoCapture
        label="Foto de la hoja de firmas (recomendada)"
        value={talk.photo.blob ?? talk.photo.path ?? null}
        onChange={(blob) => updateTalk({ photo: { photoId: null, path: talk.photo.path, blob } })}
      />
    </div>
  );
}
