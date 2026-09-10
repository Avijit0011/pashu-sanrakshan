import React, { useState } from 'react';
import { 
  Activity, AlertTriangle, CheckCircle, ShieldAlert, FileText, 
  MapPin, X, Upload, RefreshCw, Cpu, PhoneCall, Clock, Stethoscope, Microscope, ShieldCheck
} from 'lucide-react';

interface AIAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSpecies?: string;
  initialSymptoms?: string[];
}

export const AIAssessmentModal: React.FC<AIAssessmentModalProps> = ({
  isOpen,
  onClose,
  initialSpecies = 'cow',
  initialSymptoms = ['cough', 'nasal_discharge']
}) => {
  const [species, setSpecies] = useState(initialSpecies);
  const [symptoms, setSymptoms] = useState<string[]>(initialSymptoms);
  const [durationDays, setDurationDays] = useState(3);
  const [affectedAnimals, setAffectedAnimals] = useState(4);
  const [deaths, setDeaths] = useState(0);
  const [vaccinationStatus, setVaccinationStatus] = useState('partial');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const availableSymptoms = [
    { id: 'fever', label: 'Fever' },
    { id: 'cough', label: 'Coughing' },
    { id: 'nasal_discharge', label: 'Nasal Discharge' },
    { id: 'skin_lesions', label: 'Skin Lesions / Nodules' },
    { id: 'blisters_mouth_feet', label: 'Blisters on Mouth/Feet' },
    { id: 'difficulty_breathing', label: 'Difficulty Breathing' },
    { id: 'salivation_drooling', label: 'Excessive Salivation' },
    { id: 'reduced_activity', label: 'Reduced Activity / Lethargy' },
    { id: 'swelling_neck_chest', label: 'Swelling (Neck/Dewlap)' }
  ];

  const handleSymptomToggle = (symId: string) => {
    if (symptoms.includes(symId)) {
      setSymptoms(symptoms.filter(s => s !== symId));
    } else {
      setSymptoms([...symptoms, symId]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const runFullAssessment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/full-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animal: {
            species,
            age: 4.0,
            sex: 'female',
            vaccination_status: vaccinationStatus
          },
          species,
          symptoms,
          duration_days: durationDays,
          vaccination_status: vaccinationStatus,
          affected_animals: affectedAnimals,
          deaths,
          location: { latitude: 22.5726, longitude: 88.3639, region: 'West Bengal' },
          image_base64: imageBase64
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("AI screening request error", err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-600 text-white border-red-700';
      case 'HIGH': return 'bg-orange-600 text-white border-orange-700';
      case 'MEDIUM': return 'bg-amber-500 text-white border-amber-600';
      default: return 'bg-emerald-600 text-white border-emerald-700';
    }
  };

  const getUrgencyBadge = (urgency: any) => {
    const level = urgency?.level || 'ROUTINE';
    if (level === 'IMMEDIATE_EMERGENCY') {
      return {
        bg: 'bg-red-950/80 border-red-600 text-red-200',
        badge: 'bg-red-600 text-white',
        iconColor: 'text-red-400',
        title: 'IMMEDIATE EMERGENCY — Consult Vet within 2 - 4 Hours'
      };
    }
    if (level === 'HIGH_PRIORITY') {
      return {
        bg: 'bg-amber-950/70 border-amber-600 text-amber-200',
        badge: 'bg-amber-600 text-white',
        iconColor: 'text-amber-400',
        title: 'HIGH PRIORITY — Consult Vet within 24 Hours'
      };
    }
    return {
      bg: 'bg-slate-800 border-slate-700 text-slate-200',
      badge: 'bg-blue-600 text-white',
      iconColor: 'text-blue-400',
      title: 'MODERATE — Consult Vet within 48 Hours'
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto text-slate-100 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/80 sticky top-0 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Multi-Modal AI Decision Support</h2>
              <p className="text-xs text-slate-400">Livestock Disease Surveillance, Probability Prediction & Triage</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {!result ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form Controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Species</label>
                  <select 
                    value={species} 
                    onChange={e => setSpecies(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="cow">Cattle / Cow</option>
                    <option value="buffalo">Buffalo</option>
                    <option value="goat">Goat</option>
                    <option value="sheep">Sheep</option>
                    <option value="poultry">Poultry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Clinical Symptoms</label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {availableSymptoms.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSymptomToggle(s.id)}
                        className={`text-left text-xs p-2.5 rounded-lg border transition ${
                          symptoms.includes(s.id)
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-medium'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Duration (Days)</label>
                    <input 
                      type="number" 
                      value={durationDays} 
                      onChange={e => setDurationDays(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Vaccination</label>
                    <select 
                      value={vaccinationStatus} 
                      onChange={e => setVaccinationStatus(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                    >
                      <option value="full">Fully Vaccinated</option>
                      <option value="partial">Partially Vaccinated</option>
                      <option value="none">Not Vaccinated</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Affected Herd Count</label>
                    <input 
                      type="number" 
                      value={affectedAnimals} 
                      onChange={e => setAffectedAnimals(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Mortality Count</label>
                    <input 
                      type="number" 
                      value={deaths} 
                      onChange={e => setDeaths(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload Column */}
              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Animal Image (Optional Screening Input)</label>
                  <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-emerald-500/50 transition bg-slate-800/40">
                    {imageBase64 ? (
                      <div className="space-y-3">
                        <img src={imageBase64} alt="Preview" className="h-40 mx-auto rounded-lg object-cover" />
                        <button 
                          onClick={() => setImageBase64(null)}
                          className="text-xs text-rose-400 hover:underline"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block space-y-2">
                        <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                        <span className="text-xs text-slate-400 block">Upload lesion / animal photo for visual AI screening</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    AI risk engine combines visual features, symptom rules, location outbreak data, and weather. AI output is for decision support only.
                  </span>
                </div>

                <button
                  onClick={runFullAssessment}
                  disabled={loading}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Running Multi-Modal Risk Engine...
                    </>
                  ) : (
                    <>
                      <Activity className="w-5 h-5" />
                      Run AI Full Assessment
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Results View */
            <div className="space-y-6">
              {/* Disclaimer */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{result.disclaimer}</span>
              </div>

              {/* Doctor Urgency & Timeline Triage Banner */}
              {result.doctor_urgency && (
                <div className={`p-4 rounded-xl border ${getUrgencyBadge(result.doctor_urgency).bg} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 font-extrabold text-sm sm:text-base">
                      <Clock className={`w-5 h-5 ${getUrgencyBadge(result.doctor_urgency).iconColor}`} />
                      <span>Doctor Visit Urgency Timeline:</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getUrgencyBadge(result.doctor_urgency).badge}`}>
                        {result.doctor_urgency.timeframe}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed opacity-95">
                    {result.doctor_urgency.description}
                  </p>

                  {result.doctor_urgency.warning_signs?.length > 0 && (
                    <div className="pt-2 border-t border-slate-700/50">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300 block mb-1">
                        Critical Warning Signs Present:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.doctor_urgency.warning_signs.map((sign: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs rounded-md font-medium">
                            • {sign}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Main Score Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-xl text-center flex flex-col justify-center items-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Risk Score</span>
                  <div className="text-4xl font-extrabold text-white mt-1">
                    {result.overall_assessment?.risk_score} <span className="text-base text-slate-400 font-normal">/ 100</span>
                  </div>
                  <span className={`mt-2 px-3 py-0.5 text-xs font-bold rounded-full border ${getRiskColor(result.overall_assessment?.risk_level)}`}>
                    {result.overall_assessment?.risk_level}
                  </span>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-xl flex flex-col justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Model Confidence</span>
                  <div className="text-2xl font-bold text-emerald-400">
                    {Math.round((result.overall_assessment?.confidence || 0.86) * 100)}%
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Based on symptom vector & visual feature match</p>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-xl flex flex-col justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recommended Escalation</span>
                  <div className="text-sm font-bold text-amber-400 mt-1">
                    {result.recommended_action?.replace(/_/g, ' ')}
                  </div>
                  <span className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    {result.urgent ? '⚡ Urgent triage escalation recommended' : 'Routine monitoring & report submission'}
                  </span>
                </div>
              </div>

              {/* Disease Probabilities Breakdown */}
              <div className="bg-slate-800/50 border border-slate-700/60 p-5 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    Disease Probability Distribution (Differential Diagnosis)
                  </h3>
                  <span className="text-xs text-slate-400">Top Matches Based on Photo & Symptoms</span>
                </div>

                <div className="space-y-4">
                  {result.possible_conditions?.map((cond: any, idx: number) => {
                    const probPct = Math.round(cond.probability * 100);
                    return (
                      <div key={idx} className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-100">{cond.condition}</span>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                              cond.severity_level === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                              cond.severity_level === 'HIGH' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
                              'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}>
                              {cond.severity_level || 'MODERATE'}
                            </span>
                          </div>
                          <span className="text-emerald-400 font-extrabold text-sm">{probPct}% Probability</span>
                        </div>

                        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-700 ${
                              probPct >= 70 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                              probPct >= 40 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                              'bg-slate-600'
                            }`}
                            style={{ width: `${probPct}%` }}
                          />
                        </div>

                        {cond.description && (
                          <p className="text-xs text-slate-400 pt-1 leading-relaxed">
                            {cond.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommended Diagnostics */}
              {result.recommended_diagnostics?.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700/60 p-5 rounded-xl space-y-3">
                  <h3 className="text-base font-extrabold text-slate-200 flex items-center gap-2">
                    <Microscope className="w-5 h-5 text-cyan-400" />
                    Recommended Diagnostics & Laboratory Tests
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {result.recommended_diagnostics.map((diag: any, idx: number) => (
                      <div key={idx} className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-cyan-300">{diag.test_name}</span>
                          <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-200 rounded text-[10px] font-bold">
                            {diag.priority || 'HIGH'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal">{diag.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed AI Clinical Judgement (Non-Short) */}
              {result.clinical_judgement && (
                <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-extrabold text-white">AI Clinical Judgement & Biosecurity Guidance</h3>
                  </div>
                  <div className="whitespace-pre-line text-xs sm:text-sm text-slate-300 leading-relaxed font-sans bg-slate-900/90 p-4 rounded-xl border border-slate-800/80">
                    {result.clinical_judgement}
                  </div>
                </div>
              )}

              {/* Geographic Outbreak Details */}
              {result.geographic_analysis && (
                <div className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-rose-400" />
                    <div>
                      <span className="text-xs font-bold text-white">Geographic Outbreak Risk Score: {result.geographic_analysis.geographic_risk_score}/100</span>
                      <p className="text-xs text-slate-400">
                        {result.geographic_analysis.cluster_detected 
                          ? `Local Cluster Detected (${result.geographic_analysis.nearby_cases_count} cases nearby within 10km)` 
                          : 'No major localized cluster detected.'}
                      </p>
                    </div>
                  </div>
                  {result.geographic_analysis.cluster_detected && (
                    <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-bold">
                      CLUSTER ALERT
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setResult(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition"
                >
                  Recalculate
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition shadow-lg shadow-emerald-600/20"
                >
                  Close & Escalate Case
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

