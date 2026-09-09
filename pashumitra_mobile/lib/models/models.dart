import '../core/constants/app_enums.dart';

class User {
  final String id;
  final String name;
  final String phone;
  final UserRole role;

  User({
    required this.id,
    required this.name,
    required this.phone,
    required this.role,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      role: json['role'] == 'VETERINARIAN'
          ? UserRole.veterinarian
          : json['role'] == 'AUTHORITY'
              ? UserRole.authority
              : UserRole.farmer,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'phone': phone,
        'role': role.name.toUpperCase(),
      };
}

class Animal {
  final String id;
  final String ownerId;
  final String animalIdentifier;
  final String species;
  final String breed;
  final double age;
  final String sex;

  Animal({
    required this.id,
    required this.ownerId,
    required this.animalIdentifier,
    required this.species,
    required this.breed,
    required this.age,
    required this.sex,
  });

  factory Animal.fromJson(Map<String, dynamic> json) {
    return Animal(
      id: json['id'] ?? '',
      ownerId: json['owner_id'] ?? '',
      animalIdentifier: json['animal_identifier'] ?? '',
      species: json['species'] ?? 'Cow',
      breed: json['breed'] ?? 'Desi',
      age: (json['age'] as num?)?.toDouble() ?? 3.0,
      sex: json['sex'] ?? 'Female',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'owner_id': ownerId,
        'animal_identifier': animalIdentifier,
        'species': species,
        'breed': breed,
        'age': age,
        'sex': sex,
      };
}

class DiseaseReport {
  final String id;
  final String animalId;
  final Animal? animal;
  final List<String> symptoms;
  final int affectedCount;
  final int deathCount;
  final int durationDays;
  final String? imageUrl;
  final double latitude;
  final double longitude;
  final String? locationName;
  final int riskScore;
  final RiskLevel riskLevel;
  final List<String> contributingFactors;
  final String status;
  final String createdAt;

  DiseaseReport({
    required this.id,
    required this.animalId,
    this.animal,
    required this.symptoms,
    required this.affectedCount,
    required this.deathCount,
    required this.durationDays,
    this.imageUrl,
    required this.latitude,
    required this.longitude,
    this.locationName,
    required this.riskScore,
    required this.riskLevel,
    required this.contributingFactors,
    required this.status,
    required this.createdAt,
  });

  factory DiseaseReport.fromJson(Map<String, dynamic> json) {
    RiskLevel parseRisk(String? level) {
      switch (level?.toUpperCase()) {
        case 'CRITICAL':
          return RiskLevel.critical;
        case 'HIGH':
          return RiskLevel.high;
        case 'MEDIUM':
          return RiskLevel.medium;
        default:
          return RiskLevel.low;
      }
    }

    return DiseaseReport(
      id: json['id'] ?? '',
      animalId: json['animal_id'] ?? '',
      animal: json['animal'] != null ? Animal.fromJson(json['animal']) : null,
      symptoms: List<String>.from(json['symptoms'] ?? []),
      affectedCount: json['affected_count'] ?? 1,
      deathCount: json['death_count'] ?? 0,
      durationDays: json['duration_days'] ?? 1,
      imageUrl: json['image_url'],
      latitude: (json['latitude'] as num?)?.toDouble() ?? 22.5645,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 72.9289,
      locationName: json['location_name'] ?? 'Anand District',
      riskScore: json['risk_score'] ?? 50,
      riskLevel: parseRisk(json['risk_level']),
      contributingFactors: List<String>.from(json['contributing_factors'] ?? []),
      status: json['status'] ?? 'SUBMITTED',
      createdAt: json['created_at'] ?? DateTime.now().toIso8601String(),
    );
  }
}

class Investigation {
  final String id;
  final String caseId;
  final double bodyTemp;
  final int respRate;
  final int heartRate;
  final String appetite;
  final String activityLevel;
  final String hydration;
  final String suspectedDisease;
  final String differentialDiagnosis;
  final String severity;
  final String decision;
  final String clinicalNotes;
  final String createdAt;

  Investigation({
    required this.id,
    required this.caseId,
    required this.bodyTemp,
    required this.respRate,
    required this.heartRate,
    required this.appetite,
    required this.activityLevel,
    required this.hydration,
    required this.suspectedDisease,
    required this.differentialDiagnosis,
    required this.severity,
    required this.decision,
    required this.clinicalNotes,
    required this.createdAt,
  });

  factory Investigation.fromJson(Map<String, dynamic> json) {
    return Investigation(
      id: json['id'] ?? '',
      caseId: json['case_id'] ?? '',
      bodyTemp: (json['body_temp'] as num?)?.toDouble() ?? 102.5,
      respRate: json['resp_rate'] ?? 30,
      heartRate: json['heart_rate'] ?? 70,
      appetite: json['appetite'] ?? 'Reduced',
      activityLevel: json['activity_level'] ?? 'Lethargic',
      hydration: json['hydration'] ?? 'Mildly Dehydrated',
      suspectedDisease: json['suspected_disease'] ?? 'Haemorrhagic Septicaemia',
      differentialDiagnosis: json['differential_diagnosis'] ?? 'Blackquarter / Anthrax',
      severity: json['severity'] ?? 'Severe',
      decision: json['decision'] ?? 'Request Laboratory Test',
      clinicalNotes: json['clinical_notes'] ?? '',
      createdAt: json['created_at'] ?? DateTime.now().toIso8601String(),
    );
  }
}

class Sample {
  final String id; // LAB-2026-00128
  final String caseId;
  final String animalId;
  final SampleType type;
  final String collectionDate;
  final String location;
  final String priority;
  final String notes;

  Sample({
    required this.id,
    required this.caseId,
    required this.animalId,
    required this.type,
    required this.collectionDate,
    required this.location,
    required this.priority,
    required this.notes,
  });

  factory Sample.fromJson(Map<String, dynamic> json) {
    SampleType parseType(String? t) {
      switch (t?.toLowerCase()) {
        case 'swab':
          return SampleType.swab;
        case 'stool':
          return SampleType.stool;
        case 'milk':
          return SampleType.milk;
        case 'tissue':
          return SampleType.tissue;
        default:
          return SampleType.blood;
      }
    }

    return Sample(
      id: json['id'] ?? 'LAB-2026-00128',
      caseId: json['case_id'] ?? '',
      animalId: json['animal_id'] ?? '',
      type: parseType(json['type']),
      collectionDate: json['collection_date'] ?? DateTime.now().toIso8601String(),
      location: json['location'] ?? 'Anand Village',
      priority: json['priority'] ?? 'HIGH',
      notes: json['notes'] ?? '',
    );
  }
}

class LabResult {
  final String id;
  final String sampleId;
  final String testName;
  final String laboratoryName;
  final LabResultStatus status;
  final String testDate;
  final String remarks;

  LabResult({
    required this.id,
    required this.sampleId,
    required this.testName,
    required this.laboratoryName,
    required this.status,
    required this.testDate,
    required this.remarks,
  });

  factory LabResult.fromJson(Map<String, dynamic> json) {
    LabResultStatus parseRes(String? r) {
      switch (r?.toLowerCase()) {
        case 'positive':
          return LabResultStatus.positive;
        case 'negative':
          return LabResultStatus.negative;
        case 'inconclusive':
          return LabResultStatus.inconclusive;
        default:
          return LabResultStatus.pending;
      }
    }

    return LabResult(
      id: json['id'] ?? '',
      sampleId: json['sample_id'] ?? '',
      testName: json['test_name'] ?? 'PCR Assay (Pasteurella multocida)',
      laboratoryName: json['laboratory_name'] ?? 'District Veterinary Diagnostic Lab',
      status: parseRes(json['status']),
      testDate: json['test_date'] ?? DateTime.now().toIso8601String(),
      remarks: json['remarks'] ?? 'Positive for Pasteurella multocida Type B:2.',
    );
  }
}

class Treatment {
  final String id;
  final String caseId;
  final String medicine;
  final String dosage;
  final String frequency;
  final String duration;
  final String method;
  final String startDate;
  final String endDate;
  final TreatmentStatus status;
  final String vetNotes;

  Treatment({
    required this.id,
    required this.caseId,
    required this.medicine,
    required this.dosage,
    required this.frequency,
    required this.duration,
    required this.method,
    required this.startDate,
    required this.endDate,
    required this.status,
    required this.vetNotes,
  });

  factory Treatment.fromJson(Map<String, dynamic> json) {
    TreatmentStatus parseStatus(String? s) {
      switch (s?.toLowerCase()) {
        case 'completed':
          return TreatmentStatus.completed;
        case 'ongoing':
          return TreatmentStatus.ongoing;
        case 'failed':
          return TreatmentStatus.failed;
        default:
          return TreatmentStatus.started;
      }
    }

    return Treatment(
      id: json['id'] ?? '',
      caseId: json['case_id'] ?? '',
      medicine: json['medicine'] ?? 'Oxytetracycline Injection',
      dosage: json['dosage'] ?? '10 mg/kg IV',
      frequency: json['frequency'] ?? 'Once Daily',
      duration: json['duration'] ?? '5 Days',
      method: json['method'] ?? 'Intravenous',
      startDate: json['start_date'] ?? DateTime.now().toIso8601String(),
      endDate: json['end_date'] ?? DateTime.now().add(const Duration(days: 5)).toIso8601String(),
      status: parseStatus(json['status']),
      vetNotes: json['vet_notes'] ?? '',
    );
  }
}

class FollowUp {
  final String id;
  final String caseId;
  final String followUpDate;
  final String animalCondition;
  final String newSymptoms;
  final String treatmentResponse;
  final String notes;

  FollowUp({
    required this.id,
    required this.caseId,
    required this.followUpDate,
    required this.animalCondition,
    required this.newSymptoms,
    required this.treatmentResponse,
    required this.notes,
  });

  factory FollowUp.fromJson(Map<String, dynamic> json) {
    return FollowUp(
      id: json['id'] ?? '',
      caseId: json['case_id'] ?? '',
      followUpDate: json['follow_up_date'] ?? DateTime.now().add(const Duration(days: 3)).toIso8601String(),
      animalCondition: json['animal_condition'] ?? 'Improving',
      newSymptoms: json['new_symptoms'] ?? 'Fever subsided',
      treatmentResponse: json['treatment_response'] ?? 'Favorable response to antibiotic therapy',
      notes: json['notes'] ?? '',
    );
  }
}

class Escalation {
  final String id;
  final String caseId;
  final String reason;
  final String severity;
  final String immediateAction;
  final String authorityAlertNotes;
  final String createdAt;

  Escalation({
    required this.id,
    required this.caseId,
    required this.reason,
    required this.severity,
    required this.immediateAction,
    required this.authorityAlertNotes,
    required this.createdAt,
  });

  factory Escalation.fromJson(Map<String, dynamic> json) {
    return Escalation(
      id: json['id'] ?? '',
      caseId: json['case_id'] ?? '',
      reason: json['reason'] ?? 'High mortality rate & rapid spatial spread across Anand block',
      severity: json['severity'] ?? 'CRITICAL',
      immediateAction: json['immediate_action'] ?? 'Quarantine & Ring Vaccination Deployed',
      authorityAlertNotes: json['authority_alert_notes'] ?? 'Alert sent to Chief District Veterinary Officer',
      createdAt: json['created_at'] ?? DateTime.now().toIso8601String(),
    );
  }
}

class CaseEvent {
  final String id;
  final String caseId;
  final String userName;
  final String userRole;
  final String previousStatus;
  final String newStatus;
  final String notes;
  final String createdAt;

  CaseEvent({
    required this.id,
    required this.caseId,
    required this.userName,
    required this.userRole,
    required this.previousStatus,
    required this.newStatus,
    required this.notes,
    required this.createdAt,
  });

  factory CaseEvent.fromJson(Map<String, dynamic> json) {
    return CaseEvent(
      id: json['id'] ?? '',
      caseId: json['case_id'] ?? '',
      userName: json['user_name'] ?? 'Dr. Anita Sharma',
      userRole: json['user_role'] ?? 'VETERINARIAN',
      previousStatus: json['previous_status'] ?? 'SUBMITTED',
      newStatus: json['new_status'] ?? 'AI_SCREENED',
      notes: json['notes'] ?? '',
      createdAt: json['created_at'] ?? DateTime.now().toIso8601String(),
    );
  }
}

class VeterinaryCase {
  final String id;
  final String reportId;
  final DiseaseReport report;
  final String veterinarianName;
  final String status;
  final Investigation? investigation;
  final Sample? sample;
  final LabResult? labResult;
  final Treatment? treatment;
  final FollowUp? followUp;
  final Escalation? escalation;
  final List<CaseEvent> events;

  VeterinaryCase({
    required this.id,
    required this.reportId,
    required this.report,
    required this.veterinarianName,
    required this.status,
    this.investigation,
    this.sample,
    this.labResult,
    this.treatment,
    this.followUp,
    this.escalation,
    required this.events,
  });

  factory VeterinaryCase.fromJson(Map<String, dynamic> json) {
    final reportData = json['report'] != null
        ? DiseaseReport.fromJson(json['report'])
        : DiseaseReport.fromJson(json);

    return VeterinaryCase(
      id: json['id'] ?? 'case-${reportData.id}',
      reportId: json['report_id'] ?? reportData.id,
      report: reportData,
      veterinarianName: json['veterinarian_name'] ?? 'Dr. Anita Sharma (District Vet)',
      status: json['status'] ?? reportData.status,
      investigation: json['investigation'] != null ? Investigation.fromJson(json['investigation']) : null,
      sample: json['sample'] != null ? Sample.fromJson(json['sample']) : null,
      labResult: json['lab_result'] != null ? LabResult.fromJson(json['lab_result']) : null,
      treatment: json['treatment'] != null ? Treatment.fromJson(json['treatment']) : null,
      followUp: json['follow_up'] != null ? FollowUp.fromJson(json['follow_up']) : null,
      escalation: json['escalation'] != null ? Escalation.fromJson(json['escalation']) : null,
      events: (json['events'] as List<dynamic>?)?.map((e) => CaseEvent.fromJson(e)).toList() ?? [],
    );
  }
}
