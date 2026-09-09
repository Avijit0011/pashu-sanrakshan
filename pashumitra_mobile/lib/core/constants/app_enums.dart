enum UserRole { farmer, veterinarian, authority }

enum RiskLevel { low, medium, high, critical }

enum CaseStatus {
  submitted,
  aiScreened,
  pendingVetReview,
  investigating,
  sampleCollected,
  sentToLab,
  labResultReceived,
  treatmentStarted,
  followUpScheduled,
  resolved,
  escalated,
}

enum SampleType { blood, swab, stool, milk, tissue, other }

enum LabResultStatus { positive, negative, inconclusive, pending }

enum TreatmentStatus { started, ongoing, completed, modified, failed }

enum SyncStatus { online, offline, syncing, pendingSync, synced, syncFailed }
