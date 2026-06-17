import { db, type LocalPhoto } from '@/db/dexie';

type EntityType = LocalPhoto['entityType'];

/** Persiste un blob de foto/firma en Dexie y devuelve su id. */
export async function savePhoto(
  entityType: EntityType,
  entityLocalId: string,
  field: string,
  blob: Blob,
): Promise<string> {
  const id = `${entityType}-${entityLocalId}-${field}`;
  await db.photos.put({
    id,
    entityType,
    entityLocalId,
    field,
    blob,
    uploadedPath: null,
    syncStatus: 'pending',
    lastModified: Date.now(),
  });
  return id;
}

export async function removePhoto(id: string): Promise<void> {
  await db.photos.delete(id);
}

export async function getPhotoBlob(id: string): Promise<Blob | null> {
  const p = await db.photos.get(id);
  return p?.blob ?? null;
}
