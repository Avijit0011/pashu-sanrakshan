import { Router } from 'express';
import { dbStore } from '../db';
import { evaluateLivestockRisk } from '../services/riskEngine';
import { DiseaseReport } from '../../src/types/index';

const router = Router();

router.get('/', (req, res) => {
  const reports = dbStore.getReports();
  return res.json(reports);
});

router.get('/:id', (req, res) => {
  const report = dbStore.getReportById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });
  return res.json(report);
});

router.post('/', (req, res) => {
  const body = req.body;

  // Run AI Risk Engine Evaluation
  const riskEval = evaluateLivestockRisk({
    species: body.species,
    symptoms: body.symptoms || [],
    affected_count: Number(body.affected_count) || 1,
    death_count: Number(body.death_count) || 0,
    latitude: Number(body.latitude) || 22.5645,
    longitude: Number(body.longitude) || 72.9289,
  });

  const animal = dbStore.getAnimals().find((a) => a.id === body.animal_id) || body.animal;

  const newReport: DiseaseReport = {
    id: body.id || `rep-${Date.now()}`,
    animal_id: body.animal_id,
    animal,
    reported_by: body.reported_by || 'farmer-demo-001',
    reporter_name: body.reporter_name || 'Ramesh Patel (Farmer)',
    symptoms: body.symptoms || [],
    affected_count: Number(body.affected_count) || 1,
    death_count: Number(body.death_count) || 0,
    duration_days: Number(body.duration_days) || 1,
    image_url: body.image_url || 'https://images.unsplash.com/photo-1570042707223-9568778f2444?auto=format&fit=crop&w=600&q=80',
    latitude: Number(body.latitude) || 22.5645,
    longitude: Number(body.longitude) || 72.9289,
    location_name: body.location_name || 'Anand Rural District, Gujarat',
    risk_score: riskEval.risk_score,
    risk_level: riskEval.risk_level,
    contributing_factors: riskEval.contributing_factors,
    status: riskEval.screening_status,
    created_at: body.created_at || new Date().toISOString(),
    sync_status: 'SYNCED',
  };

  const saved = dbStore.addReport(newReport);
  return res.status(201).json(saved);
});

export default router;
