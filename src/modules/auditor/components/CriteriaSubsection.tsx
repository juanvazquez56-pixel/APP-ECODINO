import { ChecklistItem } from '@/shared/components/ChecklistItem';
import { Accordion } from '@/shared/components/Accordion';
import { auditItemKey, type AuditSubsectionDef } from '@/catalogs/audit-criteria';
import { useAuditorStore } from '@/modules/auditor/store';

export function CriteriaSubsection({ sub }: { sub: AuditSubsectionDef }) {
  const { draft, setResponse } = useAuditorStore();

  const responded = sub.items.filter((_, i) => draft.responses[auditItemKey(sub.key, i)]).length;

  return (
    <Accordion
      title={`${sub.key} ${sub.title}`}
      badge={`${responded}/${sub.items.length}`}
      color={responded === sub.items.length ? 'green' : 'slate'}
    >
      <div>
        {sub.items.map((item, i) => {
          const key = auditItemKey(sub.key, i);
          return (
            <ChecklistItem
              key={key}
              text={item.text}
              variant="three-state"
              value={draft.responses[key]}
              onChange={(v) => setResponse(key, v)}
            />
          );
        })}
      </div>
    </Accordion>
  );
}
