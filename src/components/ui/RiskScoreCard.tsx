import React from 'react';
import { RiskLevel } from '@/types';
import { RiskLevelBadge } from './RiskLevelBadge';
import { CheckCircle2, AlertOctagon, Info, Stethoscope } from 'lucide-react';

interface RiskScoreCardProps {
  score: number;
  level: RiskLevel;
  factors?: string[];
  species?: string;
  showDisclaimer?: boolean;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({
  score,
  level,
  factors = [],
  species = 'Livestock',
  showDisclaimer = true,
}) => {
  const getScoreColor = () => {
    if (score >= 81) return 'from-red-500 to-rose-600 text-red-600';
    if (score >= 61) return 'from-orange-500 to-amber-600 text-orange-600';
    if (score >= 31) return 'from-amber-400 to-yellow-500 text-amber-600';
    return 'from-emerald-400 to-teal-500 text-emerald-600';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
            AI Triage & Risk Screening
          </span>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Risk Assessment</span>
            <RiskLevelBadge level={level} size="sm" />
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-500 font-medium">Risk Score</div>
            <div className={`text-2xl sm:text-3xl font-extrabold font-mono ${getScoreColor()}`}>
              {score}<span className="text-sm text-slate-400 font-normal">/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar Meter */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-500 font-medium">
          <span>0 (Low)</span>
          <span>30</span>
          <span>60</span>
          <span>80</span>
          <span>100 (Critical)</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex p-0.5 border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${getScoreColor()}`}
            style={{ width: `${Math.min(Math.max(score, 5), 100)}%` }}
          />
        </div>
      </div>

      {/* Factors list */}
      {factors.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Contributing Risk Factors:
          </span>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700">
            {factors.map((factor, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Escalation Recommendation */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-xs sm:text-sm text-amber-900 flex items-start gap-3">
        <Stethoscope className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-bold text-amber-950">
            {level === 'HIGH' || level === 'CRITICAL'
              ? 'High-risk case — veterinary review recommended immediately.'
              : 'Moderate risk — store report for veterinary monitoring.'}
          </div>
          <p className="text-amber-800 text-xs">
            Assigned to veterinary surveillance queue for district review and potential field inspection.
          </p>
        </div>
      </div>

      {/* Transparency Disclaimer */}
      {showDisclaimer && (
        <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span>
            PashuMitra AI risk screening is a decision-support tool, not a definitive medical diagnosis.
          </span>
        </div>
      )}
    </div>
  );
};
