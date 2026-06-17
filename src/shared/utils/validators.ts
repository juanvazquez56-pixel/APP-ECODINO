import type {
  ActivityRow,
  AttendanceRow,
  EppRow,
  FindingRow,
  PermitRow,
  SafetyIncidentRow,
  SamplingRow,
} from '@/types/forms';
import { calcSemaforo } from '@/shared/utils/calcSemaforo';
import { SUPERVISOR_CHECKLIST_TOTAL } from '@/catalogs/supervisor-checklist';
import { SAFETY_CHECKLIST_TOTAL } from '@/catalogs/safety-checklist';
import { AUDIT_CRITERIA_TOTAL } from '@/catalogs/audit-criteria';

export type ValidationResult = { valid: boolean; errors: string[] };

const CHECKLIST_THRESHOLD = 0.8;

function countTrue(responses: Record<string, boolean>): number {
  return Object.values(responses).filter(Boolean).length;
}

// =====================================================
// SUPERVISOR
// =====================================================
export type SupervisorValidationInput = {
  checklistResponses: Record<string, boolean>;
  hasSupervisorSignature: boolean;
  attendance: AttendanceRow[];
  activities: ActivityRow[];
};

/**
 * Valida el reporte del supervisor. Como efecto secundario, las actividades
 * "Cerrado" sin ambas fotos se reclasifican a "Cerrado con observación"
 * (se devuelven en `adjustedActivities` para que el caller persista el cambio).
 */
export function validateSupervisorReport(input: SupervisorValidationInput): ValidationResult & {
  adjustedActivities: ActivityRow[];
} {
  const errors: string[] = [];

  const responded = countTrue(input.checklistResponses);
  if (responded / SUPERVISOR_CHECKLIST_TOTAL < CHECKLIST_THRESHOLD) {
    errors.push(
      `Completa al menos el 80% del checklist (${responded}/${SUPERVISOR_CHECKLIST_TOTAL} marcados).`,
    );
  }

  if (!input.hasSupervisorSignature) {
    errors.push('Falta la firma del supervisor.');
  }

  if (input.attendance.length === 0) {
    errors.push('Agrega al menos un trabajador en asistencia.');
  }

  // Reclasificación automática de actividades cerradas sin evidencia completa.
  const adjustedActivities = input.activities.map((a) => {
    if (a.status === 'Cerrado' && (!a.photo_before.photoId && !a.photo_before.path
      || (!a.photo_after.photoId && !a.photo_after.path))) {
      const missingBefore = !a.photo_before.photoId && !a.photo_before.path;
      const missingAfter = !a.photo_after.photoId && !a.photo_after.path;
      if (missingBefore || missingAfter) {
        return { ...a, status: 'Cerrado con observación' as const };
      }
    }
    return a;
  });

  return { valid: errors.length === 0, errors, adjustedActivities };
}

// =====================================================
// SEGURISTA
// =====================================================
export type SafetyValidationInput = {
  checklistResponses: Record<string, boolean>;
  hasSeguristaSignature: boolean;
  hasSupervisorSignature: boolean;
  talkTopic: string;
  talkDurationMin: number | null;
  talkAttendees: number | null;
  incidents: SafetyIncidentRow[];
  // No usados directamente en validación pero se reciben por contrato:
  eppInspections?: EppRow[];
  permits?: PermitRow[];
};

export function validateSafetyReport(input: SafetyValidationInput): ValidationResult {
  const errors: string[] = [];

  const responded = countTrue(input.checklistResponses);
  if (responded / SAFETY_CHECKLIST_TOTAL < CHECKLIST_THRESHOLD) {
    errors.push(
      `Completa al menos el 80% del checklist (${responded}/${SAFETY_CHECKLIST_TOTAL} marcados).`,
    );
  }

  if (!input.hasSeguristaSignature) {
    errors.push('Falta la firma del segurista.');
  }

  if (!input.hasSupervisorSignature) {
    errors.push('Falta la firma del supervisor (cierre conjunto).');
  }

  if (!input.talkTopic.trim() || !input.talkDurationMin || !input.talkAttendees) {
    errors.push('La charla pre-operacional es obligatoria (tema, duración y asistentes).');
  }

  for (const inc of input.incidents) {
    if (inc.type === 'Accidente') {
      const hasPhoto = !!inc.photo.photoId || !!inc.photo.path;
      if (!hasPhoto || inc.description.trim().length < 50) {
        errors.push(
          'Un accidente requiere foto y una descripción de al menos 50 caracteres.',
        );
        break;
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// =====================================================
// AUDITOR
// =====================================================
export type AuditValidationInput = {
  responses: Record<string, 'C' | 'NC' | 'NA'>;
  hasAuditorSignature: boolean;
  hasSupervisorSignature: boolean;
  sampling: SamplingRow[];
  findings: FindingRow[];
};

export function validateAudit(input: AuditValidationInput): ValidationResult {
  const errors: string[] = [];

  const responded = Object.values(input.responses).filter(Boolean).length;
  if (responded / AUDIT_CRITERIA_TOTAL < CHECKLIST_THRESHOLD) {
    errors.push(
      `Responde al menos el 80% de los criterios (${responded}/${AUDIT_CRITERIA_TOTAL}).`,
    );
  }

  if (input.sampling.length < 2) {
    errors.push('Agrega al menos 2 filas de muestreo físico.');
  }

  let c = 0;
  let nc = 0;
  for (const v of Object.values(input.responses)) {
    if (v === 'C') c += 1;
    else if (v === 'NC') nc += 1;
  }
  const { semaforo } = calcSemaforo(c, nc);
  if (semaforo === 'rojo') {
    const hasFindingWithAction = input.findings.some(
      (f) => f.description.trim() && f.action.action_description.trim(),
    );
    if (!hasFindingWithAction) {
      errors.push('Resultado en rojo requiere al menos un hallazgo con acción correctiva.');
    }
  }

  if (!input.hasAuditorSignature) {
    errors.push('Falta la firma del auditor.');
  }
  if (!input.hasSupervisorSignature) {
    errors.push('Falta la firma del supervisor.');
  }

  return { valid: errors.length === 0, errors };
}
