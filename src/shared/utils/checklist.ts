/** Construye la clave de un ítem de checklist de tareas: `inicio_turno-0`. */
export function checklistKey(sectionKey: string, index: number): string {
  return `${sectionKey}-${index}`;
}

/** Cuenta cuántos ítems de una sección están marcados. */
export function countSectionResponses(
  sectionKey: string,
  total: number,
  responses: Record<string, boolean>,
): number {
  let n = 0;
  for (let i = 0; i < total; i += 1) {
    if (responses[checklistKey(sectionKey, i)]) n += 1;
  }
  return n;
}
