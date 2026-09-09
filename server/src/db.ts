import { Animal, DiseaseReport, VeterinaryCase, CaseEvent, Cluster } from '../../src/types/index';
import { SEED_ANIMALS, SEED_REPORTS, SEED_CLUSTERS } from './seedData';

// Extended Interfaces for Point 3
export interface InvestigationData {
  id: string;
  case_id: string;
  body_temp: number;
  resp_rate: number;
  heart_rate: number;
  appetite: string;
  activity_level: string;
  hydration: string;
  suspected_disease: string;
  differential_diagnosis: string;
  severity: string;
  decision: string;
  clinical_notes: string;
  created_at: string;
}

export interface SampleData {
  id: string; // LAB-2026-00128
  case_id: string;
  animal_id: string;
  type: string;
  collection_date: string;
  location: string;
  priority: string;
  notes: string;
}

export interface LabReferralData {
  id: string;
  sample_id: string;
  laboratory_name: string;
  test_required: string;
  status: string;
  created_at: string;
}

export interface TreatmentData {
  id: string;
  case_id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  method: string;
  start_date: string;
  end_date: string;
  status: string;
  vet_notes: string;
}

export interface FollowUpData {
  id: string;
  case_id: string;
  follow_up_date: string;
  animal_condition: string;
  new_symptoms: string;
  treatment_response: string;
  notes: string;
}

export interface EscalationData {
  id: string;
  case_id: string;
  reason: string;
  severity: string;
  immediate_action: string;
  authority_alert_notes: string;
  created_at: string;
}

// In-Memory Database Store
let animalsTable: Animal[] = [...SEED_ANIMALS];
let reportsTable: DiseaseReport[] = [...SEED_REPORTS];
let clustersTable: Cluster[] = [...SEED_CLUSTERS];

let investigationsTable: InvestigationData[] = [];
let samplesTable: SampleData[] = [];
let referralsTable: LabReferralData[] = [];
let treatmentsTable: TreatmentData[] = [];
let followUpsTable: FollowUpData[] = [];
let escalationsTable: EscalationData[] = [];

let casesTable: VeterinaryCase[] = SEED_REPORTS.map((r) => ({
  id: `case-${r.id}`,
  report_id: r.id,
  report: r,
  veterinarian_id: 'vet-demo-001',
  veterinarian_name: 'Dr. Anita Sharma (District Vet)',
  status: r.status,
  observation: r.status !== 'PENDING_VET_REVIEW' ? 'Initial screening verified by district epidemiologist.' : undefined,
  treatment: r.status === 'FIELD_VISIT' ? 'Oxytetracycline 10mg/kg & Ring Vaccination deployed' : undefined,
  created_at: r.created_at,
  updated_at: r.created_at,
  events: [
    {
      id: `evt-init-${r.id}`,
      case_id: `case-${r.id}`,
      user_id: r.reported_by,
      user_name: r.reporter_name || 'Farmer',
      user_role: 'FARMER',
      previous_status: 'SUBMITTED',
      new_status: r.status,
      notes: `Report submitted with ${r.symptoms.length} observed symptoms. AI Risk score: ${r.risk_score}/100 (${r.risk_level})`,
      created_at: r.created_at,
    },
  ],
}));

export const dbStore = {
  // Animals
  getAnimals: () => animalsTable,
  addAnimal: (animal: Animal) => {
    animalsTable.unshift(animal);
    return animal;
  },

  // Reports
  getReports: () => reportsTable,
  getReportById: (id: string) => reportsTable.find((r) => r.id === id),
  addReport: (report: DiseaseReport) => {
    reportsTable.unshift(report);

    const newCase: VeterinaryCase = {
      id: `case-${report.id}`,
      report_id: report.id,
      report,
      status: report.status,
      created_at: report.created_at,
      updated_at: report.created_at,
      events: [
        {
          id: `evt-${Date.now()}`,
          case_id: `case-${report.id}`,
          user_id: report.reported_by,
          user_name: report.reporter_name || 'Farmer',
          user_role: 'FARMER',
          previous_status: 'SUBMITTED',
          new_status: report.status,
          notes: `Health report submitted. AI Risk Score: ${report.risk_score}/100 (${report.risk_level})`,
          created_at: report.created_at,
        },
      ],
    };
    casesTable.unshift(newCase);
    return report;
  },

  // Cases
  getCases: () => casesTable,
  getCaseById: (id: string) => casesTable.find((c) => c.id === id || c.report_id === id),
  updateCaseStatus: (
    caseId: string,
    status: any,
    observation?: string,
    treatment?: string,
    followUpDate?: string,
    userId?: string
  ) => {
    const foundCase = casesTable.find((c) => c.id === caseId || c.report_id === caseId);
    if (!foundCase) return null;

    const prevStatus = foundCase.status;
    foundCase.status = status;
    foundCase.report.status = status;
    if (observation) foundCase.observation = observation;
    if (treatment) foundCase.treatment = treatment;
    if (followUpDate) foundCase.follow_up_date = followUpDate;
    foundCase.updated_at = new Date().toISOString();

    const event: CaseEvent = {
      id: `evt-${Date.now()}`,
      case_id: foundCase.id,
      user_id: userId || 'vet-demo-001',
      user_name: 'Dr. Anita Sharma (District Vet)',
      user_role: 'VETERINARIAN',
      previous_status: prevStatus,
      new_status: status,
      notes: observation ? `Observation: ${observation}. ${treatment ? `Treatment: ${treatment}` : ''}` : `Status updated to ${status}`,
      created_at: new Date().toISOString(),
    };
    if (!foundCase.events) foundCase.events = [];
    foundCase.events.unshift(event);

    return foundCase;
  },

  // Point 3 Workflow Handlers
  addInvestigation: (caseId: string, data: InvestigationData) => {
    investigationsTable.unshift(data);
    dbStore.updateCaseStatus(
      caseId,
      'INVESTIGATING',
      `Clinical Exam completed. Temp: ${data.body_temp}°F, Resp Rate: ${data.resp_rate}/min. Suspected: ${data.suspected_disease}. Decision: ${data.decision}`
    );
    return data;
  },

  addSample: (caseId: string, data: SampleData) => {
    samplesTable.unshift(data);
    dbStore.updateCaseStatus(
      caseId,
      'SAMPLE_COLLECTED',
      `Sample ${data.id} (${data.type.toUpperCase()}) collected and barcode generated.`
    );
    return data;
  },

  addReferral: (sampleId: string, data: LabReferralData) => {
    referralsTable.unshift(data);
    const sample = samplesTable.find((s) => s.id === sampleId);
    if (sample) {
      dbStore.updateCaseStatus(
        sample.case_id,
        'LAB_REQUEST',
        `Sample ${sampleId} dispatched to ${data.laboratory_name} for ${data.test_required}.`
      );
    }
    return data;
  },

  addTreatment: (caseId: string, data: TreatmentData) => {
    treatmentsTable.unshift(data);
    dbStore.updateCaseStatus(
      caseId,
      'FIELD_VISIT',
      `Treatment started: ${data.medicine} (${data.dosage}, ${data.frequency}). Duration: ${data.duration}.`
    );
    return data;
  },

  addFollowUp: (caseId: string, data: FollowUpData) => {
    followUpsTable.unshift(data);
    dbStore.updateCaseStatus(
      caseId,
      'MONITORING',
      `Follow-up inspection scheduled for ${data.follow_up_date}. Condition: ${data.animal_condition}.`
    );
    return data;
  },

  addEscalation: (caseId: string, data: EscalationData) => {
    escalationsTable.unshift(data);
    dbStore.updateCaseStatus(
      caseId,
      'RESOLVED', // Or escalated state
      `⚠ CASE ESCALATED TO DISTRICT AUTHORITY: ${data.reason}. Action: ${data.immediate_action}`
    );
    return data;
  },

  // Clusters
  getClusters: () => clustersTable,
  addCluster: (cluster: Cluster) => {
    clustersTable.unshift(cluster);
    return cluster;
  },
};
