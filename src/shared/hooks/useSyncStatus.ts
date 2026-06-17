import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/dexie';
import { useOnline } from '@/shared/hooks/useOnline';
import { forceSyncNow, getLastSyncAt, subscribeSync } from '@/db/sync';

export type SyncStatusInfo = {
  isOnline: boolean;
  pendingCount: number;
  syncingCount: number;
  errorCount: number;
  lastSyncAt: Date | null;
  forceSyncNow: () => Promise<void>;
};

async function countByStatus(status: 'pending' | 'syncing' | 'error') {
  const [a, b, c] = await Promise.all([
    db.supervisorReports.where('syncStatus').equals(status).count(),
    db.safetyReports.where('syncStatus').equals(status).count(),
    db.audits.where('syncStatus').equals(status).count(),
  ]);
  return a + b + c;
}

export function useSyncStatus(): SyncStatusInfo {
  const isOnline = useOnline();
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(getLastSyncAt());

  useEffect(() => {
    const unsub = subscribeSync(() => setLastSyncAt(getLastSyncAt()));
    return () => {
      unsub();
    };
  }, []);

  const pendingCount = useLiveQuery(() => countByStatus('pending'), [], 0) ?? 0;
  const syncingCount = useLiveQuery(() => countByStatus('syncing'), [], 0) ?? 0;
  const errorCount = useLiveQuery(() => countByStatus('error'), [], 0) ?? 0;

  return {
    isOnline,
    pendingCount,
    syncingCount,
    errorCount,
    lastSyncAt: lastSyncAt ? new Date(lastSyncAt) : null,
    forceSyncNow,
  };
}
