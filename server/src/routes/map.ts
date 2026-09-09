import { Router } from 'express';
import { dbStore } from '../db';
import { detectSpatialClusters } from '../services/clusterDetector';

const router = Router();

router.get('/cases', (req, res) => {
  const reports = dbStore.getReports();
  return res.json(reports);
});

router.get('/clusters', (req, res) => {
  const reports = dbStore.getReports();
  const dbClusters = dbStore.getClusters();

  // Run spatial clustering algorithm on live reports
  const dynamicClusters = detectSpatialClusters(reports, 12);
  const combined = [...dbClusters, ...dynamicClusters];

  // Remove duplicate cluster IDs
  const uniqueClusters = Array.from(new Map(combined.map((c) => [c.id, c])).values());

  return res.json(uniqueClusters);
});

export default router;
