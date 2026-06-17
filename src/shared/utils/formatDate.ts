import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/** Formatea una fecha (Date o ISO string) en español (México). */
export function formatDate(date: Date | string, pattern = "d 'de' MMMM 'de' yyyy"): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern, { locale: es });
}

/** Formatea fecha y hora cortas: dd/MM/yyyy HH:mm */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd/MM/yyyy HH:mm', { locale: es });
}
