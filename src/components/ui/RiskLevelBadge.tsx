import React from 'react';
import { RiskLevel } from '@/types';
import { ShieldAlert, AlertCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

interface RiskLevelBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RiskLevelBadge: React.FC<RiskLevelBadgeProps> = ({
  level,
  score,
  size = 'md',
  className = '',
}) => {
  const getConfig = () => {
    switch (level) {
      case 'LOW':
        return {
          label: 'LOW RISK',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: ShieldCheck,
        };
      case 'MEDIUM':
        return {
          label: 'MEDIUM RISK',
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: AlertTriangle,
        };
      case 'HIGH':
        return {
          label: 'HIGH RISK',
          bg: 'bg-orange-100 text-orange-900 border-orange-400 font-semibold',
          icon: AlertCircle,
        };
      case 'CRITICAL':
        return {
          label: 'CRITICAL RISK',
          bg: 'bg-red-100 text-red-900 border-red-400 font-bold animate-pulse',
          icon: ShieldAlert,
        };
      default:
        return {
          label: level,
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          icon: AlertTriangle,
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-xs sm:text-sm gap-1.5',
    lg: 'px-4 py-1.5 text-sm sm:text-base gap-2 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm ${config.bg} ${sizeClasses[size]} ${className}`}
    >
      <Icon className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      <span>{config.label}</span>
      {score !== undefined && (
        <span className="ml-1 opacity-90 font-mono">({score}/100)</span>
      )}
    </span>
  );
};
