import { db, OfflineReportRecord } from '@/core/storage/dexieDb';
import { api } from '@/core/api/axiosInstance';
import { create } from 'zustand';

interface SyncStoreState {
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: string | null;
  syncError: string | null;
  refreshPendingCount: () => Promise<number>;
  syncNow: () => Promise<{ success: boolean; syncedCount: number; error?: string }>;
}

export const useSyncStore = create<SyncStoreState>((set, get) => ({
  isSyncing: false,
  pendingCount: 0,
  lastSyncedAt: null,
  syncError: null,

  refreshPendingCount: async () => {
    try {
      const count = await db.offlineReports
        .filter((r) => r.sync_status === 'PENDING_SYNC' || r.sync_status === 'SYNC_FAILED')
        .count();
      set({ pendingCount: count });
      return count;
    } catch {
      return 0;
    }
  },

  syncNow: async () => {
    if (get().isSyncing) return { success: false, syncedCount: 0, error: 'Sync already in progress' };

    set({ isSyncing: true, syncError: null });
    let syncedCount = 0;

    try {
      const pendingItems = await db.offlineReports
        .filter((r) => r.sync_status === 'PENDING_SYNC' || r.sync_status === 'SYNC_FAILED')
        .toArray();

      if (pendingItems.length === 0) {
        set({ isSyncing: false, pendingCount: 0 });
        return { success: true, syncedCount: 0 };
      }

      for (const item of pendingItems) {
        try {
          const payload = {
            animal_id: item.animal_id,
            symptoms: item.symptoms,
            affected_count: item.affected_count,
            death_count: item.death_count,
            duration_days: item.duration_days,
            image_url: item.image_url,
            latitude: item.latitude,
            longitude: item.longitude,
            created_at: item.created_at,
          };

          const res = await api.post('/reports', payload);

          if (res.status === 200 || res.status === 201) {
            // Successfully uploaded -> update Dexie record status
            await db.offlineReports.update(item.local_id, {
              sync_status: 'SYNCED',
              id: res.data.id || item.id,
            });
            syncedCount++;
          }
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || err.message || 'Server error';
          await db.offlineReports.update(item.local_id, {
            sync_status: 'SYNC_FAILED',
            retry_count: (item.retry_count || 0) + 1,
            last_error: errorMessage,
          });
        }
      }

      const remaining = await db.offlineReports
        .filter((r) => r.sync_status === 'PENDING_SYNC' || r.sync_status === 'SYNC_FAILED')
        .count();

      set({
        isSyncing: false,
        pendingCount: remaining,
        lastSyncedAt: new Date().toISOString(),
        syncError: remaining > 0 ? 'Some items failed to sync' : null,
      });

      return { success: remaining === 0, syncedCount };
    } catch (err: any) {
      set({ isSyncing: false, syncError: err.message || 'Synchronization failed' });
      return { success: false, syncedCount: 0, error: err.message };
    }
  },
}));
