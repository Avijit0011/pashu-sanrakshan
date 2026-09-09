import { RiskLevel, CaseStatus } from '../../src/types/index';

export interface RiskEvaluationRequest {
  species?: string;
  symptoms: string[];
  affected_count: number;
  death_count: number;
  latitude: number;
  longitude: number;
}

export interface RiskEvaluationResult {
  risk_score: number;
  risk_level: RiskLevel;
  screening_status: CaseStatus;
  contributing_factors: string[];
  disclaimer: string;
}

export function evaluateLivestockRisk(req: RiskEvaluationRequest): RiskEvaluationResult {
  let score = 20; // baseline risk score
  const factors: string[] = [];

  // Symptom weight scoring
  if (req.symptoms.includes('difficulty_breathing')) {
    score += 20;
    factors.push('Severe respiratory distress observed');
  }
  if (req.symptoms.includes('fever')) {
    score += 15;
    factors.push('High febrile reaction');
  }
  if (req.symptoms.includes('swelling')) {
    score += 15;
    factors.push('Edema / swollen dewlap or throat');
  }
  if (req.symptoms.includes('skin_abnormality')) {
    score += 15;
    factors.push('Lumpy skin lesions or mucosal blisters');
  }
  if (req.symptoms.includes('diarrhea')) {
    score += 10;
    factors.push('Acute enteritis / diarrhea');
  }

  // Herd scale & mortality factors
  if (req.affected_count > 3) {
    score += 15;
    factors.push(`Multiple animals affected (${req.affected_count} in herd)`);
  }
  if (req.death_count > 0) {
    score += 25;
    factors.push(`Mortality reported (${req.death_count} dead)`);
  }

  const finalScore = Math.min(Math.max(score, 10), 98);

  let level: RiskLevel = 'LOW';
  if (finalScore >= 81) level = 'CRITICAL';
  else if (finalScore >= 61) level = 'HIGH';
  else if (finalScore >= 31) level = 'MEDIUM';

  return {
    risk_score: finalScore,
    risk_level: level,
    screening_status: 'PENDING_VET_REVIEW',
    contributing_factors: factors,
    disclaimer:
      'PashuMitra AI risk screening is a decision-support system, not a definitive medical diagnosis. Veterinary inspection required.',
  };
}
