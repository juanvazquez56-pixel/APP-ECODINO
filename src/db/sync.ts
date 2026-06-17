import { sb } from '@/db/supabase';
import { db, type SyncStatus } from '@/db/dexie';
import type { Table } from 'dexie';

export const PHOTO_BUCKET = 'reports-photos';

// =====================================================
// Contrato de payload que producen los stores de cada módulo.
// Se guarda en el campo `data` de cada registro local de Dexie.
// =====================================================
export type PhotoPlacement =
  | { kind: 'header'; column: string }
  | { kind: 'child'; table: string; rowIndex: number; column: string };

export type ChildGroup = {
  table: string;
  fk: string; // columna FK que apunta al id de la cabecera
  rows: Record<string, any>[];
  skipDelete?: boolean; // true cuando el borrado se cubre por cascade (ej. corrective_actions)
};

export type ReportPayload = {
  table: 'supervisor_reports' | 'safety_reports' | 'audits';
  header: Record<string, any>; // columnas de la tabla principal (id = localId)
  children: ChildGroup[];
  photos: { photoId: string; placement: PhotoPlacement }[];
};

// =====================================================
// Estado del motor (lastSyncAt + suscriptores)
// =====================================================
let lastSyncAt: number | null = null;
let running = false;
let intervalId: ReturnType<typeof setInterval> | null = null;
const subscribers = new Set<() => void>();

export function getLastSyncAt(): number | null {
  return lastSyncAt;
}

export function subscribeSync(cb: () => void): () => void {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

function notify() {
  subscribers.forEach((cb) => cb());
}

const BACKOFF_MS = [2000, 8000, 32000];

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

type ReportTable = Table<{ localId: string; remoteId: string | null; data: any; syncStatus: SyncStatus; syncError?: string; lastModified: number }, string>;

const REPORT_TABLES: ReportTable[] = [
  db.supervisorReports as ReportTable,
  db.safetyReports as ReportTable,
  db.audits as ReportTable,
];

// =====================================================
// Subida de una foto: comprime ya hecho en captura, aquí solo sube.
// =====================================================
async function uploadPhoto(reportId: string, field: string, blob: Blob): Promise<string> {
  const path = `${reportId}/${field}_${Date.now()}.jpg`;
  const { error } = await sb.storage.from(PHOTO_BUCKET).upload(path, blob, {
    contentType: 'image/jpeg',
    upsert: true,
  });
  if (error) throw error;
  return path;
}

function applyPlacement(payload: ReportPayload, placement: PhotoPlacement, path: string) {
  if (placement.kind === 'header') {
    payload.header[placement.column] = path;
  } else {
    const group = payload.children.find((g) => g.table === placement.table);
    if (group && group.rows[placement.rowIndex]) {
      group.rows[placement.rowIndex][placement.column] = path;
    }
  }
}

// =====================================================
// Procesa UNA entidad (reporte/auditoría) con su árbol completo.
// =====================================================
async function processEntity(table: ReportTable, localId: string): Promise<void> {
  const record = await table.get(localId);
  if (!record) return;
  const payload = record.data as ReportPayload;

  await table.update(localId, { syncStatus: 'syncing' });
  notify();

  // 1. Subir fotos pendientes y resolver sus paths dentro del payload.
  for (const ref of payload.photos ?? []) {
    const photo = await db.photos.get(ref.photoId);
    if (!photo) continue;
    let path = photo.uploadedPath;
    if (!path) {
      path = await uploadPhoto(localId, photo.field, photo.blob);
      await db.photos.update(ref.photoId, { uploadedPath: path, syncStatus: 'synced' });
    }
    applyPlacement(payload, ref.placement, path);
  }

  // 2. Upsert de la cabecera (idempotente por id = localId).
  payload.header.id = localId;
  const { error: headerError } = await sb
    .from(payload.table)
    .upsert(payload.header, { onConflict: 'id' });
  if (headerError) throw headerError;

  // 3. Reemplazar sub-tablas. Borrado en orden inverso (cascade cubre el resto).
  for (const group of payload.children) {
    if (!group.skipDelete) {
      const { error: delError } = await sb.from(group.table).delete().eq(group.fk, localId);
      if (delError) throw delError;
    }
  }
  for (const group of payload.children) {
    if (group.rows.length === 0) continue;
    const rows = group.rows.map((r) => ({ ...r, [group.fk]: r[group.fk] ?? localId }));
    const { error: insError } = await sb.from(group.table).insert(rows);
    if (insError) throw insError;
  }

  // 4. Marcar sincronizado.
  await table.update(localId, {
    syncStatus: 'synced',
    remoteId: localId,
    data: payload,
    syncError: undefined,
  });
  notify();
}

async function processWithRetry(table: ReportTable, localId: string): Promise<void> {
  for (let attempt = 0; attempt < BACKOFF_MS.length; attempt += 1) {
    try {
      await processEntity(table, localId);
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error de sincronización';
      if (attempt === BACKOFF_MS.length - 1) {
        await table.update(localId, { syncStatus: 'error', syncError: message });
        notify();
        return;
      }
      await delay(BACKOFF_MS[attempt]);
    }
  }
}

// =====================================================
// API pública
// =====================================================
export async function syncPendingReports(): Promise<void> {
  for (const table of REPORT_TABLES) {
    const pending = await table.where('syncStatus').equals('pending').toArray();
    for (const rec of pending) {
      await processWithRetry(table, rec.localId);
    }
  }
}

/**
 * Las fotos se suben dentro de `processEntity` junto con su reporte. Esta
 * función reintenta fotos huérfanas en estado 'error' cuyo reporte ya subió.
 */
export async function syncPendingPhotos(): Promise<void> {
  const photos = await db.photos.where('syncStatus').equals('error').toArray();
  for (const photo of photos) {
    try {
      const path = await uploadPhoto(photo.entityLocalId, photo.field, photo.blob);
      await db.photos.update(photo.id, { uploadedPath: path, syncStatus: 'synced' });
    } catch {
      // se reintenta en el siguiente ciclo
    }
  }
}

export async function forceSyncNow(): Promise<void> {
  if (running) return;
  if (!navigator.onLine) return;
  running = true;
  try {
    // Reactivar entidades en error para reintento manual.
    for (const table of REPORT_TABLES) {
      const errored = await table.where('syncStatus').equals('error').toArray();
      for (const rec of errored) {
        await table.update(rec.localId, { syncStatus: 'pending' });
      }
    }
    await syncPendingReports();
    await syncPendingPhotos();
    lastSyncAt = Date.now();
    notify();
  } finally {
    running = false;
  }
}

export function startSyncEngine(): void {
  const onOnline = () => {
    notify();
    void forceSyncNow();
  };
  const onOffline = () => notify();

  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  // Respaldo: algunos Android no disparan 'online' de forma fiable.
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => {
    if (navigator.onLine) void forceSyncNow();
  }, 30000);

  // Primer intento al arrancar.
  if (navigator.onLine) void forceSyncNow();
}
