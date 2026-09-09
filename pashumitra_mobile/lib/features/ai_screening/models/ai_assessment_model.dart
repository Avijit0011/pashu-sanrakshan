class ConditionPrediction {
  final String condition;
  final double probability;
  final String severityLevel;

  ConditionPrediction({
    required this.condition,
    required this.probability,
    this.severityLevel = 'MODERATE',
  });

  factory ConditionPrediction.fromJson(Map<String, dynamic> json) {
    return ConditionPrediction(
      condition: json['condition'] ?? 'Unknown Condition',
      probability: (json['probability'] as num?)?.toDouble() ?? 0.0,
      severityLevel: json['severity_level'] ?? 'MODERATE',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'condition': condition,
      'probability': probability,
      'severity_level': severityLevel,
    };
  }
}

class AIAssessment {
  final String assessmentId;
  final double riskScore;
  final String riskLevel;
  final double confidence;
  final List<ConditionPrediction> predictions;
  final List<String> reasonCodes;
  final String recommendedAction;
  final bool urgent;
  final String disclaimer;

  AIAssessment({
    required this.assessmentId,
    required this.riskScore,
    required this.riskLevel,
    required this.confidence,
    required this.predictions,
    required this.reasonCodes,
    required this.recommendedAction,
    this.urgent = false,
    this.disclaimer = 'AI-generated screening is for decision support only and does not replace veterinary diagnosis.',
  });

  factory AIAssessment.fromJson(Map<String, dynamic> json) {
    final overall = json['overall_assessment'] as Map<String, dynamic>? ?? {};
    final rawPreds = json['possible_conditions'] as List<dynamic>? ?? [];
    final rawCodes = json['reason_codes'] as List<dynamic>? ?? [];

    return AIAssessment(
      assessmentId: json['assessment_id'] ?? 'AI-MOCK',
      riskScore: (overall['risk_score'] as num?)?.toDouble() ?? (json['risk_score'] as num?)?.toDouble() ?? 0.0,
      riskLevel: overall['risk_level'] ?? json['risk_level'] ?? 'LOW',
      confidence: (overall['confidence'] as num?)?.toDouble() ?? (json['confidence'] as num?)?.toDouble() ?? 0.80,
      predictions: rawPreds.map((e) => ConditionPrediction.fromJson(e as Map<String, dynamic>)).toList(),
      reasonCodes: rawCodes.map((e) => e.toString()).toList(),
      recommendedAction: json['recommended_action'] ?? 'VETERINARY_REVIEW',
      urgent: json['urgent'] ?? false,
      disclaimer: json['disclaimer'] ?? 'AI screening is decision support only.',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'assessment_id': assessmentId,
      'risk_score': riskScore,
      'risk_level': riskLevel,
      'confidence': confidence,
      'predictions': predictions.map((e) => e.toJson()).toList(),
      'reason_codes': reasonCodes,
      'recommended_action': recommendedAction,
      'urgent': urgent,
      'disclaimer': disclaimer,
    };
  }
}
