import { Router } from 'express';
import { evaluateLivestockRisk } from '../services/riskEngine';
import axios from 'axios';

const router = Router();

router.post('/screen', async (req, res) => {
  const payload = req.body;

  try {
    // Attempt forward to FastAPI microservice if running on port 8000
    const pyRes = await axios.post('http://localhost:8000/screen', payload, { timeout: 2000 });
    if (pyRes.data && pyRes.data.risk_score !== undefined) {
      return res.json(pyRes.data);
    }
  } catch (err) {
    // Graceful fallback to embedded transparent Risk Engine
  }

  const result = evaluateLivestockRisk({
    species: payload.species,
    symptoms: payload.symptoms || [],
    affected_count: Number(payload.affected_count) || 1,
    death_count: Number(payload.death_count) || 0,
    latitude: Number(payload.latitude) || 22.5645,
    longitude: Number(payload.longitude) || 72.9289,
  });

  return res.json(result);
});

export default router;
