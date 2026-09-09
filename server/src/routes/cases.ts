import { Router } from 'express';
import { dbStore } from '../db';

const router = Router();

// GET all cases
router.get('/', (req, res) => {
  const cases = dbStore.getCases();
  return res.json(cases);
});

// GET case by ID
router.get('/:id', (req, res) => {
  const foundCase = dbStore.getCaseById(req.params.id);
  if (!foundCase) return res.status(404).json({ message: 'Case not found' });
  return res.json(foundCase);
});

// PATCH case status
router.patch('/:id', (req, res) => {
  const { status, observation, treatment, follow_up_date } = req.body;
  const updated = dbStore.updateCaseStatus(
    req.params.id,
    status,
    observation,
    treatment,
    follow_up_date
  );

  if (!updated) return res.status(404).json({ message: 'Case not found' });
  return res.json(updated);
});

// POST /api/cases/:id/investigation
router.post('/:id/investigation', (req, res) => {
  const caseId = req.params.id;
  const body = req.body;
  const investigation = dbStore.addInvestigation(caseId, {
    id: `inv-${Date.now()}`,
    case_id: caseId,
    body_temp: Number(body.body_temp) || 102.5,
    resp_rate: Number(body.resp_rate) || 30,
    heart_rate: Number(body.heart_rate) || 70,
    appetite: body.appetite || 'Reduced',
    activity_level: body.activity_level || 'Lethargic',
    hydration: body.hydration || 'Mildly Dehydrated',
    suspected_disease: body.suspected_disease || 'Haemorrhagic Septicaemia',
    differential_diagnosis: body.differential_diagnosis || 'Blackquarter',
    severity: body.severity || 'Severe',
    decision: body.decision || 'Request Laboratory Test',
    clinical_notes: body.clinical_notes || '',
    created_at: new Date().toISOString(),
  });
  return res.status(201).json(investigation);
});

// POST /api/cases/:id/samples
router.post('/:id/samples', (req, res) => {
  const caseId = req.params.id;
  const body = req.body;
  const sample = dbStore.addSample(caseId, {
    id: body.id || `LAB-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    case_id: caseId,
    animal_id: body.animal_id || 'AN-4582',
    type: body.type || 'Swab',
    collection_date: new Date().toISOString(),
    location: body.location || 'Anand Village',
    priority: body.priority || 'HIGH',
    notes: body.notes || 'Specimen collected in transport medium',
  });
  return res.status(201).json(sample);
});

// POST /api/cases/:id/treatment
router.post('/:id/treatment', (req, res) => {
  const caseId = req.params.id;
  const body = req.body;
  const treatment = dbStore.addTreatment(caseId, {
    id: `trt-${Date.now()}`,
    case_id: caseId,
    medicine: body.medicine || 'Oxytetracycline Injection',
    dosage: body.dosage || '10 mg/kg IV',
    frequency: body.frequency || 'Once Daily',
    duration: body.duration || '5 Days',
    method: body.method || 'Intravenous',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 5 * 86400000).toISOString(),
    status: body.status || 'STARTED',
    vet_notes: body.vet_notes || '',
  });
  return res.status(201).json(treatment);
});

// POST /api/cases/:id/follow-up
router.post('/:id/follow-up', (req, res) => {
  const caseId = req.params.id;
  const body = req.body;
  const followUp = dbStore.addFollowUp(caseId, {
    id: `flw-${Date.now()}`,
    case_id: caseId,
    follow_up_date: body.follow_up_date || new Date(Date.now() + 3 * 86400000).toISOString(),
    animal_condition: body.animal_condition || 'Improving',
    new_symptoms: body.new_symptoms || 'Fever subsided',
    treatment_response: body.treatment_response || 'Favorable response',
    notes: body.notes || '',
  });
  return res.status(201).json(followUp);
});

// POST /api/cases/:id/escalate
router.post('/:id/escalate', (req, res) => {
  const caseId = req.params.id;
  const body = req.body;
  const escalation = dbStore.addEscalation(caseId, {
    id: `esc-${Date.now()}`,
    case_id: caseId,
    reason: body.reason || 'High mortality rate & rapid spatial spread',
    severity: body.severity || 'CRITICAL',
    immediate_action: body.immediate_action || 'Quarantine & Ring Vaccination',
    authority_alert_notes: body.authority_alert_notes || 'Alert sent to Chief District Veterinary Officer',
    created_at: new Date().toISOString(),
  });
  return res.status(201).json(escalation);
});

export default router;
