// Fallback local de criterios del SEGURISTA (versión 1).
// El segurista llega 30 min antes (7:30) y se queda al cierre.

export const SAFETY_CHECKLIST = {
  inicio_turno: {
    title: 'Inicio de turno',
    items: [
      { text: 'Llegar 30 min antes que el personal', time: 'Antes 7:30' },
      { text: 'Revisar instalaciones: extintores, salidas de emergencia, botiquín, señalización', time: '7:35' },
      { text: 'Recibir personal y hacer inspección de EPP por trabajador', time: '8:00' },
      { text: 'Canjear o complementar EPP defectuoso. Registrar entregas', time: '8:10' },
      { text: 'Revisar y firmar permisos de trabajo del día (vigentes y completos)', time: '8:15' },
      { text: 'Elaborar / revisar Análisis de Trabajo Seguro (ATS) por actividad de riesgo', time: '8:20' },
      { text: 'Charla pre-operacional de 5 minutos (tema, riesgos del día, recordatorios)', time: '8:25' },
      { text: 'Recolectar firmas de asistencia a la charla', time: '8:30' },
      { text: 'Identificar y señalizar áreas de riesgo del día (cintas, conos, letreros)', time: '8:35' },
      { text: 'Confirmar con el SUPERVISOR que ya se pueden iniciar actividades', time: '8:40' },
    ],
  },
  durante_turno: {
    title: 'Durante el turno',
    items: [
      { text: 'Verificar uso correcto y constante de EPP en todas las áreas', time: '1ª ronda' },
      { text: 'Vigilar cumplimiento de procedimientos de trabajo seguro', time: 'Continuo' },
      { text: 'DETENER de inmediato cualquier acto o condición insegura', time: 'Cuando ocurra' },
      { text: 'Validar bloqueo de energía (LOTO), trabajo en altura, espacios confinados, trabajo en caliente cuando aplique', time: 'Por trabajo' },
      { text: 'Inspección de herramientas en uso (cables, filos, agarres)', time: '2ª ronda' },
      { text: 'Registrar near-misses (casi-accidentes) en bitácora', time: 'Continuo' },
      { text: 'Atender de inmediato cualquier accidente o incidente. Aplicar primeros auxilios si aplica', time: 'Cuando ocurra' },
      { text: 'Coordinarse con personal de seguridad del cliente cuando aplique', time: 'Continuo' },
      { text: 'Validación de seguridad previo al cierre', time: '3ª ronda' },
    ],
  },
  cierre_turno: {
    title: 'Cierre de turno',
    items: [
      { text: 'Recoger y revisar EPP de uso compartido', time: '16:30' },
      { text: 'Verificar que las áreas queden seguras (sin riesgos remanentes, cables, herramientas)', time: '16:40' },
      { text: 'Confirmar entrega de herramienta de seguridad (arneses, guantes especiales, etc.)', time: '16:50' },
      { text: 'Llenar el REPORTE DIARIO DE SEGURIDAD', time: '17:00' },
      { text: 'Cierre conjunto con el SUPERVISOR: cruzar incidentes y pendientes', time: '17:05' },
      { text: 'Archivar permisos y ATS firmados en la carpeta semanal de seguridad', time: '17:10' },
      { text: 'Subir evidencia fotográfica de seguridad al canal acordado', time: '17:20' },
      { text: 'Si hubo incidente: iniciar reporte formal de investigación', time: '17:25' },
      { text: 'Enviar resumen del día al jefe directo (incidentes, near-misses, condiciones inseguras)', time: '17:30' },
    ],
  },
} as const;

/** Total de ítems del checklist de segurista (28). */
export const SAFETY_CHECKLIST_TOTAL = Object.values(SAFETY_CHECKLIST).reduce(
  (acc, s) => acc + s.items.length,
  0,
);
