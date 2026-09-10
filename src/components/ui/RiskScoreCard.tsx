import React from 'react';
import { RiskLevel, ConditionPrediction, DiagnosticItem, DoctorUrgency } from '@/types';
import { RiskLevelBadge } from './RiskLevelBadge';
import { CheckCircle2, Info, Stethoscope, Clock, Microscope, FileText, ShieldCheck } from 'lucide-react';

interface RiskScoreCardProps {
  score: number;
  level: RiskLevel;
  factors?: string[];
  species?: string;
  probable_conditions?: ConditionPrediction[];
  recommended_diagnostics?: DiagnosticItem[];
  doctor_urgency?: DoctorUrgency;
  clinical_judgement?: string;
  showDisclaimer?: boolean;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({
  score,
  level,
  factors = [],
  species = 'Livestock',
  probable_conditions = [],
  recommended_diagnostics = [],
  doctor_urgency,
  clinical_judgement,
  showDisclaimer = true,
}) => {
  const getScoreColor = () => {
    if (score >= 81) return 'from-red-500 to-rose-600 text-red-600';
    if (score >= 61) return 'from-orange-500 to-amber-600 text-orange-600';
    if (score >= 31) return 'from-amber-400 to-yellow-500 text-amber-600';
    return 'from-emerald-400 to-teal-500 text-emerald-600';
  };

  const getTimeframeBadge = () => {
    if (doctor_urgency?.timeframe) return doctor_urgency.timeframe;
    if (score >= 75) return 'Within 2 - 4 Hours';
    if (score >= 50) return 'Within 24 Hours';
    return 'Within 48 Hours';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      {/* Header & Score */}
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

      {/* Doctor Urgency Triage Timeline Box */}
      <div className={`p-4 rounded-xl border flex flex-col gap-2 ${
        score >= 75 ? 'bg-red-50 border-red-200 text-red-950' :
        score >= 50 ? 'bg-amber-50 border-amber-200 text-amber-950' :
        'bg-blue-50 border-blue-200 text-blue-950'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Clock className="w-4 h-4 shrink-0 text-emerald-700" />
            <span>How soon should you visit the Doctor?</span>
          </div>
          <span className="px-3 py-1 bg-slate-900 text-white text-xs font-black rounded-full shadow-sm">
            ⚡ {getTimeframeBadge()}
          </span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          {doctor_urgency?.description || (
            score >= 75 ? 'EMERGENCY: Contact veterinarian within 2-4 hours due to acute contagion & systemic severity.' :
            score >= 50 ? 'URGENT: Veterinary inspection recommended within 24 hours to prevent secondary complications.' :
            'MODERATE: Schedule routine veterinary consultation within 48 hours.'
          )}
        </p>
      </div>

      {/* Probable Diseases Breakdown */}
      {probable_conditions.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-600" />
              Disease Probabilities (Differential Diagnosis)
            </span>
          </div>

          <div className="space-y-2.5">
            {probable_conditions.map((cond, idx) => {
              const probPct = Math.round(cond.probability * 100);
              return (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>{cond.condition}</span>
                    <span className="text-emerald-700 font-mono font-black">{probPct}% Probable</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full transition-all duration-500" 
                      style={{ width: `${probPct}%` }}
                    />
                  </div>
                  {cond.description && (
                    <p className="text-[11px] text-slate-600 leading-tight pt-0.5">{cond.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommended Diagnostics */}
      {recommended_diagnostics.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Microscope className="w-4 h-4 text-cyan-600" />
            Recommended Diagnostic Tests:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recommended_diagnostics.map((diag, idx) => (
              <div key={idx} className="bg-cyan-50/60 border border-cyan-200/80 p-2.5 rounded-xl text-xs space-y-0.5">
                <div className="font-bold text-cyan-950 flex items-center justify-between">
                  <span>{diag.test_name}</span>
                  <span className="text-[9px] bg-cyan-200 text-cyan-900 px-1.5 py-0.2 rounded font-bold">{diag.priority}</span>
                </div>
                <p className="text-[11px] text-cyan-800">{diag.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Judgement Narrative */}
      {clinical_judgement && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            AI Clinical Judgement & Biosecurity Guidance:
          </span>
          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs leading-relaxed whitespace-pre-line font-sans shadow-inner">
            {clinical_judgement}
          </div>
        </div>
      )}

      {/* Factors list */}
      {factors.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
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

