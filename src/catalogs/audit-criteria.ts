// Fallback local de criterios de AUDITORÍA (versión 1).
// Bloque A (inspección física) y Bloque B (revisión administrativa).
// Sin horarios sugeridos.

export type AuditSubsectionDef = {
  key: string; // ej. 'A.1'
  title: string;
  items: ReadonlyArray<{ text: string }>;
};

export type AuditBlockDef = {
  label: string;
  color: 'green' | 'amber';
  subsections: AuditSubsectionDef[];
};

export const AUDIT_BLOCK_A: AuditBlockDef = {
  label: 'Bloque A — Inspección física',
  color: 'green',
  subsections: [
    {
      key: 'A.1',
      title: 'Personal en sitio',
      items: [
        { text: 'Personal físicamente presente coincide con lista de asistencia' },
        { text: 'Todos portan uniforme completo' },
        { text: 'Todos portan EPP correspondiente al trabajo (casco, guantes, lentes, etc.)' },
        { text: 'Personal trabajando en el área asignada' },
      ],
    },
    {
      key: 'A.2',
      title: 'Trabajos en ejecución',
      items: [
        { text: 'Las actividades reportadas como "en proceso" sí se están ejecutando' },
        { text: 'Trabajadores cuentan con la herramienta adecuada' },
        { text: 'Trabajadores cuentan con el material necesario' },
        { text: 'Permiso de trabajo visible o disponible en sitio (cuando aplica)' },
      ],
    },
    {
      key: 'A.3',
      title: 'Trabajos cerrados — verificación física',
      items: [
        { text: 'Trabajo terminado coincide con lo reportado por el supervisor' },
        { text: 'Calidad visible aceptable, sin retrabajo evidente' },
        { text: 'Área limpia tras la intervención' },
        { text: 'Sin daño colateral (paredes, equipos, pisos, instalaciones)' },
        { text: 'Cliente interno conforme (validación verbal o firma)' },
      ],
    },
    {
      key: 'A.4',
      title: 'Seguridad y orden del área',
      items: [
        { text: 'Áreas de trabajo señalizadas (cintas, conos, letreros)' },
        { text: 'Sin riesgos eléctricos o mecánicos expuestos' },
        { text: 'Herramientas guardadas u ordenadas al final del turno' },
        { text: 'Sin residuos o material acumulado fuera de lugar' },
      ],
    },
  ],
};

export const AUDIT_BLOCK_B: AuditBlockDef = {
  label: 'Bloque B — Revisión administrativa',
  color: 'amber',
  subsections: [
    {
      key: 'B.1',
      title: 'Reporte diario del supervisor',
      items: [
        { text: 'Reporte entregado en tiempo (antes del horario acordado)' },
        { text: 'Reporte completo: asistencia + actividades + evidencias + observaciones' },
        { text: 'Llenado legible, sin tachones ni correcciones sin firma' },
        { text: 'Resumen del día enviado por el canal acordado' },
      ],
    },
    {
      key: 'B.2',
      title: 'Lista de asistencia',
      items: [
        { text: 'Lista del día firmada por cada trabajador' },
        { text: 'Horas de entrada y salida registradas' },
        { text: 'Faltas y retardos marcados con su causa' },
        { text: 'Total de asistentes coincide con personal observado en planta' },
      ],
    },
    {
      key: 'B.3',
      title: 'Permisos de trabajo',
      items: [
        { text: 'Permisos del día vigentes y firmados' },
        { text: 'Permisos archivados en carpeta semanal' },
        { text: 'Permisos firmados/sellados por el cliente cuando aplica' },
        { text: 'Sin permisos extraviados de días anteriores' },
      ],
    },
    {
      key: 'B.4',
      title: 'Evidencia fotográfica',
      items: [
        { text: 'Cada actividad cerrada tiene foto antes y después' },
        { text: 'Fotos etiquetadas o nombradas con fecha / área / actividad' },
        { text: 'Carpeta digital o física del día organizada' },
        { text: 'Sin actividades "cerradas" sin respaldo fotográfico' },
      ],
    },
    {
      key: 'B.5',
      title: 'Bitácora de incidencias y pendientes',
      items: [
        { text: 'Incidencias del día registradas (faltas, retrasos, accidentes, quejas)' },
        { text: 'Pendientes con causa documentada (material, permiso, cliente, etc.)' },
        { text: 'Pendientes de días previos con seguimiento al día' },
        { text: 'Acciones correctivas anteriores cerradas o en curso' },
      ],
    },
    {
      key: 'B.6',
      title: 'Control de materiales y herramienta',
      items: [
        { text: 'Solicitudes de material del día documentadas' },
        { text: 'Herramienta entregada y devuelta con vale o registro' },
        { text: 'Sin pérdidas o faltantes reportados sin investigar' },
      ],
    },
  ],
};

export const AUDIT_CRITERIA: AuditBlockDef[] = [AUDIT_BLOCK_A, AUDIT_BLOCK_B];

/** Lista de claves de subsección (para selects de categoría de hallazgos). */
export const AUDIT_SUBSECTION_KEYS = AUDIT_CRITERIA.flatMap((b) =>
  b.subsections.map((s) => `${s.key} ${s.title}`),
);

/** Total de criterios de auditoría (40). */
export const AUDIT_CRITERIA_TOTAL = AUDIT_CRITERIA.reduce(
  (acc, b) => acc + b.subsections.reduce((a, s) => a + s.items.length, 0),
  0,
);

/** Construye la clave única de respuesta para un ítem: `A.1-0`. */
export function auditItemKey(sectionKey: string, index: number): string {
  return `${sectionKey}-${index}`;
}
