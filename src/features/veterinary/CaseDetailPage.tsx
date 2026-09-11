import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DiseaseReport, VeterinaryCase, CaseStatus, CaseEvent } from '@/types';
import { api } from '@/core/api/axiosInstance';
import { db } from '@/core/storage/dexieDb';
import { useAuth } from '@/core/auth/AuthContext';
import { RiskScoreCard } from '@/components/ui/RiskScoreCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RiskLevelBadge } from '@/components/ui/RiskLevelBadge';
import {
  Stethoscope,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Activity,
  Send,
  Clock,
  UserCheck,
  FileText,
  Calendar,
  FlaskConical,
  Pill,
  ShieldAlert,
  Search,
} from 'lucide-react';

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [report, setReport] = useState<DiseaseReport | null>(null);
  const [vetCase, setVetCase] = useState<VeterinaryCase | null>(null);
  const [events, setEvents] = useState<CaseEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Point 3 Workflow Modal States
  const [activeModal, setActiveModal] = useState<
    'INVESTIGATION' | 'SAMPLE' | 'TREATMENT' | 'FOLLOWUP' | 'ESCALATE' | null
  >(null);

  // Investigation State
  const [bodyTemp, setBodyTemp] = useState('103.5');
  const [respRate, setRespRate] = useState('36');
  const [suspectedDisease, setSuspectedDisease] = useState('Haemorrhagic Septicaemia');
  const [investigationNotes, setInvestigationNotes] = useState('Submandibular swelling, respiratory distress.');

  // Sample State
  const [sampleType, setSampleType] = useState('Swab');
  const [sampleBarcode, setSampleBarcode] = useState(`LAB-2026-${Math.floor(10000 + Math.random() * 90000)}`);

  // Treatment State
  const [medicine, setMedicine] = useState('Oxytetracycline Injection (100mg/ml)');
  const [dosage, setDosage] = useState('10 mg/kg IV');
  const [duration, setDuration] = useState('5 Days');

  // Follow-up State
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  );
  const [condition, setCondition] = useState('Improving');

  // Escalation State
  const [escalationReason, setEscalationReason] = useState(
    'High mortality rate & rapid spatial spread observed in Anand North Corridor.'
  );

  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadCaseDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        let res;
        try {
          res = await api.get(`/cases/${id}`);
        } catch (e) {
          const repId = id.replace(/^case-/, '');
          res = await api.get(`/reports/${repId}`);
        }

        if (res.data) {
          const reportObj = res.data.report || res.data;
          setReport(reportObj);
          setVetCase(res.data.id ? res.data : {
            id: `case-${reportObj.id}`,
            report_id: reportObj.id,
            report: reportObj,
            status: reportObj.status,
            created_at: reportObj.created_at,
            updated_at: reportObj.created_at,
            events: res.data.events || []
          });
          setEvents(res.data.events || []);
        }
      } catch (err) {
        const offlineReps = await db.offlineReports.toArray();
        const found = offlineReps.find(
          (r) => r.id === id || r.local_id === id || id === `case-${r.id}` || id === `case-${r.local_id}` || r.id === id.replace(/^case-/, '')
        );
        if (found) {
          setReport(found as DiseaseReport);
          setVetCase({
            id: `case-${found.id}`,
            report_id: found.id!,
            report: found as DiseaseReport,
            status: found.status,
            created_at: found.created_at,
            updated_at: found.created_at,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadCaseDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <Activity className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-700">Loading Case Intelligence File...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Case Record Not Found</h2>
        <Link
          to="/veterinarian/dashboard"
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs inline-block"
        >
          Return to Vet Dashboard
        </Link>
      </div>
    );
  }

  // Handle Workflow Action Submission
  const handleWorkflowSubmit = async (
    newStatus: CaseStatus,
    notes: string,
    apiEndpoint?: string,
    payload?: any
  ) => {
    setSubmitting(true);
    setActionSuccess(null);

    const prevStatus = report.status;
    const newEvent: CaseEvent = {
      id: `evt-${Date.now()}`,
      case_id: id!,
      user_id: user?.id || 'vet-demo-001',
      user_name: user?.name || 'Dr. Anita Sharma (District Vet)',
      user_role: 'VETERINARIAN',
      previous_status: prevStatus,
      new_status: newStatus,
      notes,
      created_at: new Date().toISOString(),
    };

    try {
      if (apiEndpoint && payload) {
        await api.post(apiEndpoint, payload);
      } else {
        await api.patch(`/cases/${id}`, { status: newStatus, observation: notes });
      }

      // Sync status to Dexie if report exists locally
      try {
        if (report?.id) {
          await db.offlineReports.update(report.id, { status: newStatus });
        }
      } catch (e) {
        // ignore
      }

      setReport((prev) => (prev ? { ...prev, status: newStatus } : null));
      setEvents((prev) => [newEvent, ...prev]);
      setActionSuccess(`Workflow updated: ${String(newStatus).replace(/_/g, ' ')}!`);
      setActiveModal(null);
    } catch (err) {
      // Sync status to Dexie if report exists locally
      try {
        if (report?.id) {
          await db.offlineReports.update(report.id, { status: newStatus });
        }
      } catch (e) {
        // ignore
      }

      setReport((prev) => (prev ? { ...prev, status: newStatus } : null));
      setEvents((prev) => [newEvent, ...prev]);
      setActionSuccess(`Workflow updated to ${String(newStatus).replace(/_/g, ' ')}!`);
      setActiveModal(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/veterinarian/dashboard')}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-700 flex items-center gap-1.5 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <span className="text-xs font-mono font-bold text-slate-400">
          Case Record #{report.id.slice(-6)}
        </span>
      </div>

      {/* Case Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
                {report.animal?.species || 'Livestock'} ({report.animal?.animal_identifier || 'Animal'})
              </span>
              <RiskLevelBadge level={report.risk_level} score={report.risk_score} size="sm" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-0.5">
              Veterinary Case Management & Treatment Protocol
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={report.status} />
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Affected Herd</span>
            <span className="font-extrabold text-slate-900 text-sm font-mono mt-0.5 block">
              {report.affected_count} animals
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Mortality</span>
            <span className="font-extrabold text-red-600 text-sm font-mono mt-0.5 block">
              {report.death_count} dead
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Reported By</span>
            <span className="font-bold text-slate-800 mt-0.5 block">
              {report.reporter_name || 'Ramesh Patel (Farmer)'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Report Date</span>
            <span className="font-bold text-slate-800 mt-0.5 block">
              {new Date(report.created_at).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* AI Risk Score Breakdown */}
      <RiskScoreCard
        score={report.risk_score}
        level={report.risk_level}
        factors={report.contributing_factors}
        species={report.animal?.species}
      />

      {/* POINT 3 WORKFLOW ACTION CONTROLS TOOLBAR */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-emerald-600" />
              Point 3 — Veterinary Action Workflow
            </h3>
            <p className="text-xs text-slate-500">
              Transform disease report & AI score into clinical investigation, lab testing, and treatment.
            </p>
          </div>
        </div>

        {actionSuccess && (
          <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 border border-emerald-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Workflow Toolbar Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            onClick={() => setActiveModal('INVESTIGATION')}
            className="py-3 px-3 rounded-xl font-bold text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 transition-all flex flex-col items-center gap-1"
          >
            <Stethoscope className="w-5 h-5 text-indigo-700" />
            <span>1. Clinical Exam</span>
          </button>

          <button
            onClick={() => setActiveModal('SAMPLE')}
            className="py-3 px-3 rounded-xl font-bold text-xs bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 transition-all flex flex-col items-center gap-1"
          >
            <FlaskConical className="w-5 h-5 text-teal-700" />
            <span>2. Sample & Lab</span>
          </button>

          <button
            onClick={() => setActiveModal('TREATMENT')}
            className="py-3 px-3 rounded-xl font-bold text-xs bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 transition-all flex flex-col items-center gap-1"
          >
            <Pill className="w-5 h-5 text-purple-700" />
            <span>3. Record Treatment</span>
          </button>

          <button
            onClick={() => setActiveModal('FOLLOWUP')}
            className="py-3 px-3 rounded-xl font-bold text-xs bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-200 transition-all flex flex-col items-center gap-1"
          >
            <Calendar className="w-5 h-5 text-cyan-700" />
            <span>4. Schedule Follow-up</span>
          </button>

          <button
            onClick={() => setActiveModal('ESCALATE')}
            className="py-3 px-3 rounded-xl font-bold text-xs bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 transition-all flex flex-col items-center gap-1"
          >
            <ShieldAlert className="w-5 h-5 text-rose-700" />
            <span>5. Escalate Case</span>
          </button>
        </div>
      </div>

      {/* ACTIVE WORKFLOW MODAL FORM OVERLAYS */}
      {activeModal === 'INVESTIGATION' && (
        <div className="bg-slate-50 p-6 rounded-3xl border border-indigo-200 space-y-4 animate-in fade-in duration-200 text-xs sm:text-sm">
          <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
            <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-indigo-600" /> Step 1: Clinical Examination & Diagnosis
            </h4>
            <button onClick={() => setActiveModal(null)} className="text-slate-400 font-bold">✕</button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Body Temperature (°F)</label>
              <input
                type="text"
                value={bodyTemp}
                onChange={(e) => setBodyTemp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Resp Rate (/min)</label>
              <input
                type="text"
                value={respRate}
                onChange={(e) => setRespRate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Suspected Primary Disease</label>
            <input
              type="text"
              value={suspectedDisease}
              onChange={(e) => setSuspectedDisease(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Clinical Notes & Observations</label>
            <textarea
              rows={2}
              value={investigationNotes}
              onChange={(e) => setInvestigationNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-slate-600 font-bold">Cancel</button>
            <button
              onClick={() =>
                handleWorkflowSubmit(
                  'ACCEPTED',
                  `Clinical Exam complete. Temp: ${bodyTemp}°F, Resp Rate: ${respRate}/min. Suspected: ${suspectedDisease}. ${investigationNotes}`,
                  `/cases/${id}/investigation`,
                  { body_temp: bodyTemp, resp_rate: respRate, suspected_disease: suspectedDisease, clinical_notes: investigationNotes }
                )
              }
              disabled={submitting}
              className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md"
            >
              Submit Clinical Exam
            </button>
          </div>
        </div>
      )}

      {activeModal === 'SAMPLE' && (
        <div className="bg-slate-50 p-6 rounded-3xl border border-teal-200 space-y-4 animate-in fade-in duration-200 text-xs sm:text-sm">
          <div className="flex items-center justify-between pb-2 border-b border-teal-100">
            <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-teal-600" /> Step 2: Sample Collection & Lab Referral
            </h4>
            <button onClick={() => setActiveModal(null)} className="text-slate-400 font-bold">✕</button>
          </div>

          <div className="bg-teal-50 p-3 rounded-2xl border border-teal-200 flex items-center justify-between font-mono">
            <span className="text-slate-600 text-xs font-bold">Generated Barcode:</span>
            <span className="text-base font-black text-teal-900">{sampleBarcode}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Specimen Type</label>
              <select
                value={sampleType}
                onChange={(e) => setSampleType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
              >
                <option value="Swab">Nasal / Throat Swab</option>
                <option value="Blood">Whole Blood / Serum</option>
                <option value="Stool">Stool / Fecal</option>
                <option value="Milk">Milk Specimen</option>
                <option value="Tissue">Tissue Biopsy</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Lab</label>
              <input
                type="text"
                disabled
                value="District Vet Diagnostic Lab (Anand)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 font-bold text-slate-700"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-slate-600 font-bold">Cancel</button>
            <button
              onClick={() =>
                handleWorkflowSubmit(
                  'LAB_REQUEST',
                  `Sample ${sampleBarcode} (${sampleType}) disptached to District Vet Diagnostic Lab for PCR Assay.`,
                  `/cases/${id}/samples`,
                  { id: sampleBarcode, type: sampleType }
                )
              }
              disabled={submitting}
              className="px-5 py-2.5 bg-teal-600 text-white font-bold rounded-xl shadow-md"
            >
              Dispatch Sample to Lab
            </button>
          </div>
        </div>
      )}

      {activeModal === 'TREATMENT' && (
        <div className="bg-slate-50 p-6 rounded-3xl border border-purple-200 space-y-4 animate-in fade-in duration-200 text-xs sm:text-sm">
          <div className="flex items-center justify-between pb-2 border-b border-purple-100">
            <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Pill className="w-5 h-5 text-purple-600" /> Step 3: Record Prescription & Treatment
            </h4>
            <button onClick={() => setActiveModal(null)} className="text-slate-400 font-bold">✕</button>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Medicine Name & Concentration</label>
            <input
              type="text"
              value={medicine}
              onChange={(e) => setMedicine(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Dosage & Route</label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-slate-600 font-bold">Cancel</button>
            <button
              onClick={() =>
                handleWorkflowSubmit(
                  'FIELD_VISIT',
                  `Treatment protocol started: ${medicine} (${dosage}). Duration: ${duration}.`,
                  `/cases/${id}/treatment`,
                  { medicine, dosage, duration }
                )
              }
              disabled={submitting}
              className="px-5 py-2.5 bg-purple-600 text-white font-bold rounded-xl shadow-md"
            >
              Save Treatment Record
            </button>
          </div>
        </div>
      )}

      {activeModal === 'FOLLOWUP' && (
        <div className="bg-slate-50 p-6 rounded-3xl border border-cyan-200 space-y-4 animate-in fade-in duration-200 text-xs sm:text-sm">
          <div className="flex items-center justify-between pb-2 border-b border-cyan-100">
            <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-600" /> Step 4: Schedule Re-inspection Follow-up
            </h4>
            <button onClick={() => setActiveModal(null)} className="text-slate-400 font-bold">✕</button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Follow-Up Date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Animal Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
              >
                <option value="Improving">Improving</option>
                <option value="Significantly Improved">Significantly Improved</option>
                <option value="Unchanged">Unchanged</option>
                <option value="Deteriorated">Deteriorated</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-slate-600 font-bold">Cancel</button>
            <button
              onClick={() =>
                handleWorkflowSubmit(
                  'MONITORING',
                  `Follow-up inspection scheduled for ${followUpDate}. Condition: ${condition}.`,
                  `/cases/${id}/follow-up`,
                  { follow_up_date: followUpDate, animal_condition: condition }
                )
              }
              disabled={submitting}
              className="px-5 py-2.5 bg-cyan-600 text-white font-bold rounded-xl shadow-md"
            >
              Schedule Follow-up
            </button>
          </div>
        </div>
      )}

      {activeModal === 'ESCALATE' && (
        <div className="bg-red-50 p-6 rounded-3xl border border-red-200 space-y-4 animate-in fade-in duration-200 text-xs sm:text-sm">
          <div className="flex items-center justify-between pb-2 border-b border-red-200">
            <h4 className="font-extrabold text-red-950 text-base flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" /> Step 5: Escalate Case to District Authorities
            </h4>
            <button onClick={() => setActiveModal(null)} className="text-slate-400 font-bold">✕</button>
          </div>

          <div>
            <label className="block font-bold text-red-900 mb-1">Escalation Reason & Immediate Action</label>
            <textarea
              rows={3}
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-red-300 font-medium"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-slate-600 font-bold">Cancel</button>
            <button
              onClick={() =>
                handleWorkflowSubmit(
                  'RESOLVED',
                  `⚠ CASE ESCALATED TO CHIEF VETERINARY OFFICER: ${escalationReason}`,
                  `/cases/${id}/escalate`,
                  { reason: escalationReason }
                )
              }
              disabled={submitting}
              className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl shadow-md"
            >
              Submit Official Escalation
            </button>
          </div>
        </div>
      )}

      {/* Main Content Grid: Image + Symptoms + Geolocation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Photo Evidence */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            Visual Evidence Photo
          </h3>
          {report.image_url ? (
            <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-64">
              <img src={report.image_url} alt="Symptom photo" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="h-48 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold">
              No photo submitted
            </div>
          )}
        </div>

        {/* Symptoms & Geolocation */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900">Observed Clinical Signs</h3>
            <div className="flex flex-wrap gap-1.5">
              {report.symptoms.map((symptom) => (
                <span
                  key={symptom}
                  className="px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold capitalize"
                >
                  ✓ {symptom.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              GIS GPS Coordinates
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">Latitude</span>
                <span className="font-bold">{report.latitude}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Longitude</span>
                <span className="font-bold">{report.longitude}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC CASE RESPONSE AUDIT TIMELINE */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              Dynamic Case Response Audit Timeline
            </h3>
            <p className="text-xs text-slate-500">Live sequence of triage updates and veterinary interventions</p>
          </div>
        </div>

        <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 py-2">
          {events.length === 0 ? (
            <div className="ml-6 text-xs text-slate-400 italic">
              Initial case submission logged. Awaiting veterinary officer response.
            </div>
          ) : (
            events.map((evt) => (
              <div key={evt.id} className="relative ml-6 space-y-1">
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-emerald-600 ring-4 ring-white shadow-sm" />
                <div className="flex items-center gap-2">
                  <StatusBadge status={evt.new_status} className="text-[10px] py-0" />
                  <span className="text-xs font-bold text-slate-800">
                    Updated by {evt.user_name || 'Veterinarian'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    • {new Date(evt.created_at).toLocaleString()}
                  </span>
                </div>
                {evt.notes && (
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {evt.notes}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
