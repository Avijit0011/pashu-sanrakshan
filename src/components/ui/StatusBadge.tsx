import React from 'react';
import { CaseStatus, SyncStatus } from '@/types';
import { Clock, CheckCircle2, AlertTriangle, Activity, Stethoscope, Search, ShieldCheck } from 'lucide-react';

interface StatusBadgeProps {
  status: CaseStatus | SyncStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'SUBMITTED':
        return { label: 'Submitted', bg: 'bg-slate-100 text-slate-700 border-slate-300', icon: Clock };
      case 'AI_SCREENED':
        return { label: 'AI Screened', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: Search };
      case 'PENDING_VET_REVIEW':
        return { label: 'Pending Vet Review', bg: 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse', icon: AlertTriangle };
      case 'ACCEPTED':
        return { label: 'Case Accepted', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: CheckCircle2 };
      case 'FIELD_VISIT':
        return { label: 'Field Visit Requested', bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: Stethoscope };
      case 'LAB_REQUEST':
        return { label: 'Lab Sample Requested', bg: 'bg-teal-50 text-teal-700 border-teal-200', icon: Activity };
      case 'MONITORING':
        return { label: 'Under Monitoring', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200', icon: Clock };
      case 'RESOLVED':
        return { label: 'Resolved', bg: 'bg-emerald-50 text-emerald-700 border-emerald-300', icon: ShieldCheck };

      // Sync statuses
      case 'ONLINE':
        return { label: 'Online', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle2 };
      case 'OFFLINE':
        return { label: 'Offline', bg: 'bg-amber-100 text-amber-800 border-amber-300', icon: AlertTriangle };
      case 'SYNCING':
        return { label: 'Syncing...', bg: 'bg-blue-100 text-blue-800 border-blue-300 animate-spin', icon: Activity };
      case 'PENDING_SYNC':
        return { label: 'Pending Sync', bg: 'bg-orange-100 text-orange-800 border-orange-300', icon: Clock };
      case 'SYNCED':
        return { label: 'Synced', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle2 };
      case 'SYNC_FAILED':
        return { label: 'Sync Failed', bg: 'bg-red-100 text-red-800 border-red-300', icon: AlertTriangle };
      default:
        return { label: status, bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: Clock };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};
