import Dexie, { type Table } from 'dexie';

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'error';

export type LocalSupervisorReport = {
  localId: string; // uuid generado en cliente, es el mismo que se manda como id remoto
  remoteId: string | null;
  data: Record<string, any>; // payload completo del reporte (cabecera + sub-tablas embebidas)
  syncStatus: SyncStatus;
  syncError?: string;
  lastModified: number; // timestamp epoch ms
};

export type LocalSafetyReport = {
  localId: string;
  remoteId: string | null;
  data: Record<string, any>;
  syncStatus: SyncStatus;
  syncError?: string;
  lastModified: number;
};

export type LocalAudit = {
  localId: string;
  remoteId: string | null;
  data: Record<string, any>;
  syncStatus: SyncStatus;
  syncError?: string;
  lastModified: number;
};

export type LocalPhoto = {
  id: string; // `${entityType}-${entityLocalId}-${field}`
  entityType: 'supervisor_report' | 'safety_report' | 'audit';
  entityLocalId: string;
  field: string; // ej. 'activity_3_photo_before'
  blob: Blob;
  uploadedPath: string | null;
  syncStatus: SyncStatus;
  lastModified: number;
};

export type CatalogCache = {
  id: string; // `${module}-v${version}`
  module: string;
  version: number;
  data: any[];
  cachedAt: number;
};

class AppDB extends Dexie {
  supervisorReports!: Table<LocalSupervisorReport, string>;
  safetyReports!: Table<LocalSafetyReport, string>;
  audits!: Table<LocalAudit, string>;
  photos!: Table<LocalPhoto, string>;
  catalogs!: Table<CatalogCache, string>;

  constructor() {
    super('auditoria-industrial-db');
    this.version(1).stores({
      supervisorReports: 'localId, syncStatus, lastModified',
      safetyReports: 'localId, syncStatus, lastModified',
      audits: 'localId, syncStatus, lastModified',
      photos: 'id, entityLocalId, syncStatus',
      catalogs: 'id, module',
    });
  }
}

export const db = new AppDB();

/** Genera un UUID en cliente (usado como localId == id remoto). */
export function newLocalId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
