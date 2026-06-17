import { ChecklistItem } from '@/shared/components/ChecklistItem';
import { checklistKey } from '@/shared/utils/checklist';

type Item = { text: string; time?: string };

type ChecklistSectionProps = {
  sectionKey: string;
  items: ReadonlyArray<Item>;
  responses: Record<string, boolean>;
  onToggle: (key: string, value: boolean) => void;
};

/**
 * Lista de ítems de un checklist de tareas (variante done-only).
 * Pensado para envolverse en un Accordion en el formulario.
 */
export function ChecklistSection({ sectionKey, items, responses, onToggle }: ChecklistSectionProps) {
  return (
    <div>
      {items.map((item, index) => {
        const key = checklistKey(sectionKey, index);
        const value = responses[key];
        return (
          <ChecklistItem
            key={key}
            text={item.text}
            suggestedTime={item.time}
            variant="done-only"
            value={value ? 'C' : undefined}
            onChange={() => onToggle(key, !value)}
          />
        );
      })}
    </div>
  );
}
