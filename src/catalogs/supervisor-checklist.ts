// Fallback local de criterios del SUPERVISOR (versión 1).
// Mismos textos sembrados en Supabase. Sirve como fallback offline
// y para tipado fuerte.

export const SUPERVISOR_CHECKLIST = {
  inicio_turno: {
    title: 'Inicio de turno',
    items: [
      { text: 'Llegar mínimo 15 min antes que el personal', time: 'Antes 8:00' },
      { text: 'Pasar lista de asistencia. Registrar entradas y firmas', time: '8:00' },
      { text: 'Marcar retardos / faltas y avisar al jefe directo', time: '8:05' },
      { text: 'Asignar actividades del día por trabajador (verbal y por escrito)', time: '8:10' },
      { text: 'Coordinar con el segurista: confirmar que EPP y permisos están entregados', time: '8:15' },
      { text: 'Participar en la charla pre-operacional que da el segurista', time: '8:20' },
      { text: 'Confirmar que cada trabajador tiene herramienta y material para su actividad', time: '8:25' },
      { text: 'Revisar pendientes del día anterior y comunicar prioridades del día', time: '8:30' },
      { text: 'Coordinarse con el contacto del cliente: confirmar accesos y prioridades', time: '8:30' },
    ],
  },
  durante_turno: {
    title: 'Durante el turno',
    items: [
      { text: 'Recorrer todas las áreas y validar inicio de actividades', time: '1ª ronda' },
      { text: 'Tomar foto ANTES de iniciar cada actividad', time: 'Por trabajo' },
      { text: 'Supervisar avance, calidad y comportamiento del personal', time: 'Continuo' },
      { text: 'Validar que actividades en proceso van conforme a lo previsto', time: '2ª ronda' },
      { text: 'Tomar foto DURANTE el trabajo (si la naturaleza lo permite)', time: 'Por trabajo' },
      { text: 'Registrar de inmediato cualquier incidencia operativa o queja del cliente', time: 'Cuando ocurra' },
      { text: 'Comunicar al segurista cualquier riesgo o acto inseguro que observes', time: 'Cuando ocurra' },
      { text: 'Confirmar abastecimiento de materiales y herramienta', time: 'Continuo' },
      { text: 'Validar avance previo al cierre de turno', time: '3ª ronda' },
    ],
  },
  cierre_turno: {
    title: 'Cierre de turno',
    items: [
      { text: 'Recorrer cada trabajo y verificar calidad de terminado', time: '16:30' },
      { text: 'Tomar foto DESPUÉS de cada actividad cerrada', time: 'Por trabajo' },
      { text: 'Validar que no haya daño colateral (paredes, equipos, pisos)', time: '16:45' },
      { text: 'Confirmar limpieza de áreas intervenidas', time: '16:50' },
      { text: 'Recoger y resguardar herramienta. Verificar inventario', time: '16:55' },
      { text: 'Llenar el REPORTE DIARIO OPERATIVO', time: '17:00' },
      { text: 'Hacer cierre conjunto con el SEGURISTA: cruzar incidencias y pendientes', time: '17:05' },
      { text: 'Pasar lista de salida y registrar horas', time: '17:10' },
      { text: 'Subir o enviar evidencia fotográfica al canal acordado', time: '17:20' },
      { text: 'Enviar resumen del día al jefe directo', time: '17:30' },
    ],
  },
} as const;

export type ChecklistSectionDef = {
  title: string;
  items: ReadonlyArray<{ text: string; time?: string }>;
};

/** Total de ítems del checklist de supervisor (28). */
export const SUPERVISOR_CHECKLIST_TOTAL = Object.values(SUPERVISOR_CHECKLIST).reduce(
  (acc, s) => acc + s.items.length,
  0,
);
