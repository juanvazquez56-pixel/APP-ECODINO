export type Semaforo = 'verde' | 'amarillo' | 'rojo' | 'sin-datos';

/**
 * Calcula porcentaje de cumplimiento y semáforo a partir de los conteos
 * de criterios "Cumple" y "No cumple" (los N.A. no entran al denominador).
 * Replica la lógica del trigger `recalc_audit_semaforo` para feedback en vivo.
 */
export function calcSemaforo(
  cumple: number,
  noCumple: number,
): { pct: number | null; semaforo: Semaforo } {
  const total = cumple + noCumple;
  if (total === 0) return { pct: null, semaforo: 'sin-datos' };
  const pct = Math.round((cumple / total) * 1000) / 10;
  if (pct >= 90) return { pct, semaforo: 'verde' };
  if (pct >= 75) return { pct, semaforo: 'amarillo' };
  return { pct, semaforo: 'rojo' };
}
