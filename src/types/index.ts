export type UserRole = 'FARMER' | 'VETERINARIAN';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  token?: string;
}

export type AnimalSpecies = 'Cow' | 'Buffalo' | 'Goat' | 'Sheep';
export type AnimalSex = 'Male' | 'Female';

export interface Animal {
  id: string;
  owner_id: string;
  animal_identifier: string;
  species: AnimalSpecies;
  breed: string;
  age: number; // in years or months
  sex: AnimalSex;
  created_at: string;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type CaseStatus =
  | 'SUBMITTED'
  | 'AI_SCREENED'
  | 'PENDING_VET_REVIEW'
  | 'ACCEPTED'
  | 'FIELD_VISIT'
  | 'LAB_REQUEST'
  | 'MONITORING'
  | 'RESOLVED';

export type SyncStatus = 'ONLINE' | 'OFFLINE' | 'SYNCING' | 'PENDING_SYNC' | 'SYNCED' | 'SYNC_FAILED';

export interface RiskFactor {
  title: string;
  description: string;
  weight: number;
}

export interface ConditionPrediction {
  condition: string;
  probability: number;
  severity_level?: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  description?: string;
}

export interface DiagnosticItem {
  test_name: string;
  category: 'LAB_PCR' | 'CLINICAL_EXAM' | 'BIOPSY_HISTOPATH' | 'BLOOD_WORK' | 'SWAB_CULTURE';
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'ROUTINE';
}

export interface DoctorUrgency {
  level: 'IMMEDIATE_EMERGENCY' | 'HIGH_PRIORITY' | 'MODERATE' | 'ROUTINE';
  timeframe: string; // e.g. "Within 2 - 4 Hours", "Within 24 Hours", "Within 48 Hours"
  description: string;
  warning_signs: string[];
}

export interface AIScreeningResult {
  risk_score: number; // 0 - 100
  risk_level: RiskLevel;
  screening_status: CaseStatus;
  contributing_factors: string[];
  probable_conditions?: ConditionPrediction[];
  recommended_diagnostics?: DiagnosticItem[];
  doctor_urgency?: DoctorUrgency;
  clinical_judgement?: string;
  disclaimer: string;
  screened_at: string;
}

export interface DiseaseReport {
  id: string;
  animal_id: string;
  animal?: Animal;
  reported_by: string;
  reporter_name?: string;
  symptoms: string[];
  affected_count: number;
  death_count: number;
  duration_days: number;
  image_url?: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  risk_score: number;
  risk_level: RiskLevel;
  contributing_factors?: string[];
  probable_conditions?: ConditionPrediction[];
  recommended_diagnostics?: DiagnosticItem[];
  doctor_urgency?: DoctorUrgency;
  clinical_judgement?: string;
  status: CaseStatus;
  created_at: string;
  sync_status?: SyncStatus;
}

export interface VeterinaryCase {
  id: string;
  report_id: string;
  report: DiseaseReport;
  veterinarian_id?: string;
  veterinarian_name?: string;
  status: CaseStatus;
  observation?: string;
  treatment?: string;
  follow_up_date?: string;
  created_at: string;
  updated_at: string;
  events?: CaseEvent[];
}

export interface CaseEvent {
  id: string;
  case_id: string;
  user_id: string;
  user_name?: string;
  user_role?: UserRole;
  previous_status: CaseStatus;
  new_status: CaseStatus;
  notes?: string;
  created_at: string;
}

export interface Cluster {
  id: string;
  center_latitude: number;
  center_longitude: number;
  radius_km: number;
  case_count: number;
  risk_level: RiskLevel;
  status: 'SUSPECTED' | 'VERIFIED' | 'CONTAINED';
  related_case_ids: string[];
  district_name?: string;
  created_at: string;
}

export interface MapFilters {
  riskLevel?: RiskLevel | 'ALL';
  species?: AnimalSpecies | 'ALL';
  status?: CaseStatus | 'ALL';
  searchQuery?: string;
}

