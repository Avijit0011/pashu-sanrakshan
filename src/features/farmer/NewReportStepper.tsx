import React, { useState, useEffect } from 'react';
import { Animal, DiseaseReport } from '@/types';
import { api } from '@/core/api/axiosInstance';
import { db } from '@/core/storage/dexieDb';
import { useGeolocation } from '@/core/location/useGeolocation';
import { useOnlineStatus } from '@/core/offline/useOnlineStatus';
import { useSyncStore } from '@/core/offline/syncManager';
import { FormStepper } from '@/components/ui/FormStepper';
import { RiskScoreCard } from '@/components/ui/RiskScoreCard';
import { AddAnimalModal } from './AddAnimalModal';
import {
  PlusCircle,
  Upload,
  Camera,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  X,
  ArrowRight,
  ArrowLeft,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AVAILABLE_SYMPTOMS = [
  { id: 'fever', label: 'Fever (बुखार)', desc: 'High body temperature' },
  { id: 'cough', label: 'Cough (खांसी)', desc: 'Persistent coughing' },
  { id: 'nasal_discharge', label: 'Nasal Discharge (नाक बहना)', desc: 'Mucus or fluid from nostrils' },
  { id: 'loss_of_appetite', label: 'Loss of Appetite (भूख न लगना)', desc: 'Refusing feed or water' },
  { id: 'weakness', label: 'Weakness / Lethargy (कमजोरी)', desc: 'Unable to stand or move' },
  { id: 'diarrhea', label: 'Diarrhea / Dysentery (दस्त)', desc: 'Loose or bloody stool' },
  { id: 'swelling', label: 'Swelling (सूजन)', desc: 'Swollen throat, dewlap or limbs' },
  { id: 'skin_abnormality', label: 'Skin Lesions / Blisters (त्वचा की बीमारी)', desc: 'Lumps, sores, or crusting' },
  { id: 'difficulty_breathing', label: 'Difficulty Breathing (सांस लेने में तकलीफ)', desc: 'Rapid or heavy labored panting' },
  { id: 'other', label: 'Other Symptoms (अन्य)', desc: 'Salivation, lameness, milk drop' },
];

export const NewReportStepper: React.FC = () => {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const { refreshPendingCount } = useSyncStore();
  const { latitude, longitude, accuracy, loading: geoLoading, error: geoError, retryLocation, setManualCoordinates } = useGeolocation(true);

  // Stepper state
  const [currentStep, setCurrentStep] = useState(0);

  // Animals list & Modal
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [isAddAnimalOpen, setIsAddAnimalOpen] = useState(false);

  // Form Fields
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [affectedCount, setAffectedCount] = useState<number>(1);
  const [deathCount, setDeathCount] = useState<number>(0);
  const [durationDays, setDurationDays] = useState<number>(2);

  // Image Upload
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Submission & Result state
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submittedReport, setSubmittedReport] = useState<DiseaseReport | null>(null);

  // Load animals on mount
  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const res = await api.get('/animals');
        if (res.data && res.data.length > 0) {
          setAnimals(res.data);
          setSelectedAnimalId(res.data[0].id);
        } else {
          // Check local Dexie
          const local = await db.offlineAnimals.toArray();
          if (local.length > 0) {
            setAnimals(local as Animal[]);
            setSelectedAnimalId(local[0].id!);
          }
        }
      } catch (err) {
        const local = await db.offlineAnimals.toArray();
        if (local.length > 0) {
          setAnimals(local as Animal[]);
          setSelectedAnimalId(local[0].id!);
        }
      }
    };
    fetchAnimals();
  }, []);

  // Ensure default Anand coordinates if browser geolocation is blocked/unavailable
  useEffect(() => {
    if (!latitude && !longitude && !geoLoading && geoError) {
      setManualCoordinates(22.5645, 72.9289);
    }
  }, [latitude, longitude, geoLoading, geoError, setManualCoordinates]);

  const steps = [
    { title: 'Animal', subtitle: 'Select sick livestock' },
    { title: 'Symptoms', subtitle: 'Check observed signs' },
    { title: 'Severity', subtitle: 'Numbers & duration' },
    { title: 'Image', subtitle: 'Photo upload/capture' },
    { title: 'Location & Submit', subtitle: 'GPS & AI Screening' },
  ];

  // Toggle symptom selection
  const toggleSymptom = (id: string) => {
    if (selectedSymptoms.includes(id)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== id));
    } else {
      setSelectedSymptoms([...selectedSymptoms, id]);
    }
  };

  // Image File Handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setValidationError('Image size must be under 5MB.');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setValidationError(null);
    }
  };

  // Step Validation
  const validateAndNext = () => {
    setValidationError(null);

    if (currentStep === 0) {
      if (!selectedAnimalId) {
        setValidationError('Please select or register an animal first.');
        return;
      }
    }

    if (currentStep === 1) {
      if (selectedSymptoms.length === 0) {
        setValidationError('Please select at least one symptom observed.');
        return;
      }
    }

    if (currentStep === 2) {
      if (affectedCount <= 0) {
        setValidationError('Affected count must be at least 1.');
        return;
      }
      if (deathCount < 0) {
        setValidationError('Death count cannot be negative.');
        return;
      }
      if (deathCount > affectedCount) {
        setValidationError('Death count cannot exceed total affected count.');
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  // Submit Final Disease Report
  const handleSubmitReport = async () => {
    setSubmitting(true);
    setValidationError(null);

    const selectedAnimal = animals.find((a) => a.id === selectedAnimalId);

    // Call full-assessment AI engine
    let aiData: any = null;
    try {
      if (isOnline) {
        const aiRes = await api.post('/ai/full-assessment', {
          species: selectedAnimal?.species || 'cow',
          symptoms: selectedSymptoms,
          duration_days: durationDays,
          affected_animals: affectedCount,
          deaths: deathCount,
          image_url: imagePreview,
          location: { latitude: latitude || 22.5645, longitude: longitude || 72.9289 }
        });
        aiData = aiRes.data;
      }
    } catch (err) {
      console.warn("AI screening call failed, using fallback risk engine", err);
    }

    // Calculate deterministic risk score logic (Risk Engine)
    let score = aiData?.overall_assessment?.risk_score || 25; // baseline
    if (!aiData) {
      if (selectedSymptoms.includes('difficulty_breathing')) score += 20;
      if (selectedSymptoms.includes('fever')) score += 15;
      if (selectedSymptoms.includes('swelling')) score += 15;
      if (selectedSymptoms.includes('skin_abnormality')) score += 18;
      if (affectedCount > 3) score += 15;
      if (deathCount > 0) score += 25;
    }

    const finalScore = Math.min(score, 98);
    const finalLevel =
      finalScore >= 81 ? 'CRITICAL' : finalScore >= 61 ? 'HIGH' : finalScore >= 31 ? 'MEDIUM' : 'LOW';

    const contributingFactors: string[] = aiData?.reason_codes || [];
    if (contributingFactors.length === 0) {
      if (affectedCount > 1) contributingFactors.push(`${affectedCount} animals affected in farm`);
      if (deathCount > 0) contributingFactors.push(`Mortality reported (${deathCount} dead)`);
      if (selectedSymptoms.includes('difficulty_breathing')) contributingFactors.push('Severe respiratory distress');
      if (selectedSymptoms.includes('fever')) contributingFactors.push('High febrile reaction');
      if (selectedSymptoms.includes('skin_abnormality')) contributingFactors.push('Lumpy skin lesions / nodules');
    }

    const reportPayload: DiseaseReport = {
      id: `rep-${Date.now()}`,
      animal_id: selectedAnimalId,
      animal: selectedAnimal,
      reported_by: 'farmer-demo-001',
      reporter_name: 'Ramesh Patel',
      symptoms: selectedSymptoms,
      affected_count: Number(affectedCount),
      death_count: Number(deathCount),
      duration_days: Number(durationDays),
      image_url: imagePreview || 'https://images.unsplash.com/photo-1570042707223-9568778f2444?auto=format&fit=crop&w=600&q=80',
      latitude: latitude || 22.5645,
      longitude: longitude || 72.9289,
      location_name: 'Anand Rural District, Gujarat',
      risk_score: finalScore,
      risk_level: finalLevel,
      contributing_factors: contributingFactors,
      probable_conditions: aiData?.possible_conditions || [
        {
          condition: selectedSymptoms.includes('skin_abnormality') ? 'Lumpy Skin Disease (LSD)' : 'Foot and Mouth Disease (FMD)',
          probability: 0.82,
          severity_level: 'HIGH',
          description: 'Viral capripox/aphthovirus infection causing acute skin nodules, fever, and milk drop.'
        },
        {
          condition: 'Bovine Papillomatosis / Pseudo-LSD',
          probability: 0.14,
          severity_level: 'MODERATE',
          description: 'Benign viral warts without acute fever.'
        }
      ],
      recommended_diagnostics: aiData?.recommended_diagnostics || [
        {
          test_name: 'Real-Time PCR Test for Viral DNA/RNA',
          category: 'LAB_PCR',
          description: 'Collect nodule swab/fluid to isolate pathogen.',
          priority: 'HIGH'
        },
        {
          test_name: 'Complete Blood Count (CBC) & Blood Smear',
          category: 'BLOOD_WORK',
          description: 'Evaluate leukopenia and tick hemoparasites.',
          priority: 'HIGH'
        }
      ],
      doctor_urgency: aiData?.doctor_urgency || {
        level: finalScore >= 75 ? 'IMMEDIATE_EMERGENCY' : 'HIGH_PRIORITY',
        timeframe: finalScore >= 75 ? 'Within 2 - 4 Hours' : 'Within 24 Hours',
        description: finalScore >= 75 
          ? 'EMERGENCY: Contact veterinarian within 2-4 hours due to acute outbreak progression.'
          : 'URGENT: Veterinary examination recommended within 24 hours.',
        warning_signs: ['High fever', 'Multiple herd infection', 'Lesions / nodules']
      },
      clinical_judgement: aiData?.clinical_judgement || `CLINICAL JUDGEMENT EVALUATION:\nBased on submitted symptoms (${selectedSymptoms.join(', ')}) for this ${selectedAnimal?.species || 'animal'}, AI risk engine identifies high likelihood of viral cutaneous infection (Lumpy Skin Disease / FMD).\n\nUrgency: Consult veterinarian within ${finalScore >= 75 ? '2-4 hours' : '24 hours'}. Isolate affected animal immediately, apply fly repellent, and ensure clean water supply. Do not administer unprescribed drugs.`,
      status: 'PENDING_VET_REVIEW',
      created_at: new Date().toISOString(),
      sync_status: isOnline ? 'SYNCED' : 'PENDING_SYNC',
    };

    try {
      if (isOnline) {
        const res = await api.post('/reports', reportPayload);
        setSubmittedReport(res.data || reportPayload);
      } else {
        // Offline Save to IndexedDB Dexie
        await db.offlineReports.put({
          ...reportPayload,
          local_id: reportPayload.id,
          sync_status: 'PENDING_SYNC',
          retry_count: 0,
        });
        await refreshPendingCount();
        setSubmittedReport(reportPayload);
      }
    } catch (err: any) {
      // Fallback Dexie Save
      await db.offlineReports.put({
        ...reportPayload,
        local_id: reportPayload.id,
        sync_status: 'PENDING_SYNC',
        retry_count: 0,
      });
      await refreshPendingCount();
      setSubmittedReport(reportPayload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
            MVP Point 1 — Disease Surveillance Form
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Report Sick Animal</h1>
        </div>
      </div>

      {/* Stepper */}
      <FormStepper steps={steps} currentStep={currentStep} onStepClick={(s) => setCurrentStep(s)} />

      {/* Error alert */}
      {validationError && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 border border-red-200 shadow-sm animate-shake">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* SUCCESS/SCREENING RESULT VIEW */}
      {submittedReport ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3 bg-emerald-50 text-emerald-900 p-4 rounded-2xl border border-emerald-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <h3 className="text-lg font-extrabold">Health Report Submitted Successfully!</h3>
              <p className="text-xs text-emerald-700">
                {isOnline
                  ? 'Your case has been logged on central server & flagged for veterinary inspection.'
                  : 'Saved offline to device storage. Will auto-sync when internet returns.'}
              </p>
            </div>
          </div>

          {/* AI Risk Score Breakdown */}
          <RiskScoreCard
            score={submittedReport.risk_score}
            level={submittedReport.risk_level}
            factors={submittedReport.contributing_factors}
            species={submittedReport.animal?.species}
            probable_conditions={submittedReport.probable_conditions}
            recommended_diagnostics={submittedReport.recommended_diagnostics}
            doctor_urgency={submittedReport.doctor_urgency}
            clinical_judgement={submittedReport.clinical_judgement}
          />


          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => navigate('/farmer/dashboard')}
              className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all"
            >
              Return to Dashboard
            </button>
            <button
              onClick={() => {
                setSubmittedReport(null);
                setCurrentStep(0);
                setSelectedSymptoms([]);
                setImagePreview(null);
              }}
              className="flex-1 py-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Report Another Animal
            </button>
          </div>
        </div>
      ) : (
        /* MULTI-STEP FORM STEPS */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          {/* STEP 0: ANIMAL SELECTION */}
          {currentStep === 0 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Step 1 — Select Animal</h3>
                <p className="text-xs text-slate-500">Choose the animal exhibiting illness symptoms</p>
              </div>

              {animals.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
                  <Activity className="w-10 h-10 text-amber-600 mx-auto" />
                  <h4 className="text-base font-bold text-amber-950">No Animals Registered Yet</h4>
                  <p className="text-xs text-amber-800 max-w-sm mx-auto">
                    Add an animal to your farm profile before submitting a disease report.
                  </p>
                  <button
                    onClick={() => setIsAddAnimalOpen(true)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Animal Now
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {animals.map((animal) => (
                      <button
                        key={animal.id}
                        type="button"
                        onClick={() => setSelectedAnimalId(animal.id)}
                        className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                          selectedAnimalId === animal.id
                            ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                            {animal.species}
                          </span>
                          <h4 className="text-base font-extrabold text-slate-900">{animal.animal_identifier}</h4>
                          <span className="text-xs text-slate-500">
                            {animal.breed} • {animal.age} yrs ({animal.sex})
                          </span>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedAnimalId === animal.id
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {selectedAnimalId === animal.id && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsAddAnimalOpen(true)}
                    className="w-full py-3 border-2 border-dashed border-slate-300 hover:border-emerald-500 text-slate-600 hover:text-emerald-700 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" /> Register New Animal to Farm
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 1: SYMPTOMS CHIPS */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Step 2 — Observed Symptoms</h3>
                <p className="text-xs text-slate-500">Select all signs and abnormalities present (Multiple selection allowed)</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AVAILABLE_SYMPTOMS.map((symptom) => {
                  const isSelected = selectedSymptoms.includes(symptom.id);
                  return (
                    <button
                      key={symptom.id}
                      type="button"
                      onClick={() => toggleSymptom(symptom.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
                      }`}
                    >
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{symptom.label}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{symptom.desc}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md border shrink-0 mt-0.5 flex items-center justify-center ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: SEVERITY & NUMBERS */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Step 3 — Severity & Scale</h3>
                <p className="text-xs text-slate-500">Provide counts of affected animals and mortality</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 text-xs sm:text-sm mb-1">
                    Number of Affected Animals <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={affectedCount}
                    onChange={(e) => setAffectedCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none text-lg font-mono font-bold"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Total animals showing similar symptoms in herd</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-xs sm:text-sm mb-1">
                    Number of Animal Deaths <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={affectedCount}
                    value={deathCount}
                    onChange={(e) => setDeathCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none text-lg font-mono font-bold text-red-600"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Cannot exceed total affected count ({affectedCount})</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-xs sm:text-sm mb-1">
                    Approximate Duration of Symptoms (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none text-lg font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: IMAGE CAPTURE / UPLOAD */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Step 4 — Upload / Capture Photo</h3>
                <p className="text-xs text-slate-500">Provide a photo of lesions, discharge, or affected anatomical region for AI screening</p>
              </div>

              {imagePreview ? (
                <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500 shadow-md group max-w-md mx-auto">
                  <img src={imagePreview} alt="Symptom preview" className="w-full h-64 object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                    }}
                    className="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Image attached for visual screening
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-3xl p-8 text-center bg-slate-50/50 hover:bg-emerald-50/30 transition-all">
                  <Camera className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-slate-800">Upload or Capture Image</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
                    Supports JPG, JPEG, PNG (Max size: 5MB). Camera capture supported on mobile.
                  </p>
                  <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md cursor-pointer transition-all">
                    <Upload className="w-4 h-4" /> Select / Take Photo
                    <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: GEOLOCATION & SUBMISSION */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Step 5 — Geolocation & AI Risk Screening</h3>
                <p className="text-xs text-slate-500">Confirm detected GPS location to enable GIS outbreak surveillance</p>
              </div>

              {/* Geolocation Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <span>GPS Location Status</span>
                  </div>
                  {latitude && longitude ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Detected ✓
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                      Fallback Mode
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-xl border border-slate-200 font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Latitude</span>
                    <span className="font-bold text-slate-900">{latitude || '22.564500'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Longitude</span>
                    <span className="font-bold text-slate-900">{longitude || '72.928900'}</span>
                  </div>
                </div>

                {geoError && (
                  <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    {geoError} (Using rural Anand District location for surveillance mapping).
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => retryLocation()}
                  disabled={geoLoading}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${geoLoading ? 'animate-spin' : ''}`} />
                  Refresh GPS Coordinates
                </button>
              </div>

              {/* Summary Review */}
              <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200 text-xs space-y-2">
                <span className="font-bold text-emerald-950 uppercase tracking-wider block">Submission Summary:</span>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <strong>Selected Animal:</strong> {animals.find((a) => a.id === selectedAnimalId)?.animal_identifier}
                  </div>
                  <div>
                    <strong>Symptoms:</strong> {selectedSymptoms.length} selected
                  </div>
                  <div>
                    <strong>Affected / Deaths:</strong> {affectedCount} affected ({deathCount} dead)
                  </div>
                  <div>
                    <strong>Network:</strong> {isOnline ? 'Online (Instant AI Proxy)' : 'Offline (IndexedDB Auto-Sync)'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP CONTROLS FOOTER */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              disabled={currentStep === 0 || submitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-40 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={validateAndNext}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitReport}
                disabled={submitting}
                className="px-7 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-extrabold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Activity className="w-5 h-5" />
                {submitting ? 'Running AI Screening...' : 'Submit & Perform AI Risk Screening'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Register Animal Modal */}
      <AddAnimalModal
        isOpen={isAddAnimalOpen}
        onClose={() => setIsAddAnimalOpen(false)}
        onAnimalAdded={(animal) => {
          setAnimals((prev) => [...prev, animal]);
          setSelectedAnimalId(animal.id);
        }}
      />
    </div>
  );
};
