import React, { useEffect } from 'react';
import { useOnlineStatus } from '@/core/offline/useOnlineStatus';
import { useSyncStore } from '@/core/offline/syncManager';
import { WifiOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { pendingCount, isSyncing, syncNow, refreshPendingCount, syncError } = useSyncStore();

  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  // Trigger sync when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      syncNow();
    }
  }, [isOnline, pendingCount, syncNow]);

  if (isOnline && pendingCount === 0 && !isSyncing && !syncError) {
    return null; // All clear
  }

  return (
    <div
      className={`w-full text-xs sm:text-sm px-4 py-2.5 flex items-center justify-between transition-colors ${
        !isOnline
          ? 'bg-amber-600 text-white'
          : isSyncing
          ? 'bg-blue-600 text-white'
          : pendingCount > 0
          ? 'bg-orange-600 text-white'
          : syncError
          ? 'bg-red-600 text-white'
          : 'bg-emerald-700 text-white'
      }`}
    >
      <div className="flex items-center gap-2 max-w-3xl">
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
            <span>
              <strong>Offline Mode Active</strong> — Reports are saved locally to IndexedDB and will auto-sync when internet is restored.
            </span>
          </>
        ) : isSyncing ? (
          <>
            <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />
            <span>Synchronizing {pendingCount} offline report(s) with central veterinary database...</span>
          </>
        ) : pendingCount > 0 ? (
          <>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Internet restored. <strong>{pendingCount} report(s) pending sync.</strong>
            </span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>All local health reports synced successfully!</span>
          </>
        )}
      </div>

      {isOnline && pendingCount > 0 && (
        <button
          onClick={() => syncNow()}
          disabled={isSyncing}
          className="ml-3 px-3 py-1 bg-white text-orange-900 rounded-lg text-xs font-bold shadow-sm hover:bg-orange-50 transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
      )}
    </div>
  );
};
