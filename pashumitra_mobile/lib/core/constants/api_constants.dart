class ApiConstants {
  static const String baseUrl = 'http://localhost:5001/api';
  static const Duration timeout = Duration(seconds: 12);

  // Endpoints
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String cases = '/cases';
  static const String reports = '/reports';
  static const String animals = '/animals';
  static const String mapCases = '/map/cases';
  static const String mapClusters = '/map/clusters';
  static const String aiScreen = '/ai/screen';

  // Point 3 Specific Endpoints
  static String investigation(String caseId) => '/cases/$caseId/investigation';
  static String samples(String caseId) => '/cases/$caseId/samples';
  static String labReferral(String sampleId) => '/samples/$sampleId/referral';
  static String labResult(String sampleId) => '/samples/$sampleId/result';
  static String treatment(String caseId) => '/cases/$caseId/treatment';
  static String followUp(String caseId) => '/cases/$caseId/follow-up';
  static String escalate(String caseId) => '/cases/$caseId/escalate';
}
