import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'features/dashboard/screens/vet_dashboard_screen.dart';
import 'features/cases/screens/case_details_screen.dart';
import 'features/investigation/screens/investigation_screen.dart';
import 'features/laboratory/screens/sample_collection_screen.dart';
import 'features/laboratory/screens/lab_referral_screen.dart';
import 'features/laboratory/screens/sample_tracking_screen.dart';
import 'features/treatment/screens/treatment_screen.dart';
import 'features/follow_up/screens/follow_up_screen.dart';
import 'features/escalation/screens/escalation_screen.dart';

void main() {
  runApp(
    const ProviderScope(
      child: PashuMitraApp(),
    ),
  );
}

class PashuMitraApp extends StatelessWidget {
  const PashuMitraApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PashuMitra — Veterinary Case Management Module',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const MainTabNavigator(),
    );
  }
}

class MainTabNavigator extends StatefulWidget {
  const MainTabNavigator({Key? key}) : super(key: key);

  @override
  State<MainTabNavigator> createState() => _MainTabNavigatorState();
}

class _MainTabNavigatorState extends State<MainTabNavigator> {
  int _currentIndex = 0;
  String _activeCaseId = 'PM-1028';
  String _subScreen = 'dashboard'; // 'dashboard', 'details', 'investigation', 'sample', 'referral', 'tracking', 'treatment', 'followup', 'escalate'

  @override
  Widget build(BuildContext context) {
    Widget activeWidget;

    switch (_subScreen) {
      case 'details':
        activeWidget = CaseDetailsScreen(
          caseId: _activeCaseId,
          onStartInvestigation: () => setState(() => _subScreen = 'investigation'),
          onRequestLabTest: () => setState(() => _subScreen = 'sample'),
          onPrescribeTreatment: () => setState(() => _subScreen = 'treatment'),
          onScheduleFollowUp: () => setState(() => _subScreen = 'followup'),
          onEscalate: () => setState(() => _subScreen = 'escalate'),
        );
        break;
      case 'investigation':
        activeWidget = InvestigationScreen(
          caseId: _activeCaseId,
          onSubmitSuccess: () => setState(() => _subScreen = 'details'),
        );
        break;
      case 'sample':
        activeWidget = SampleCollectionScreen(
          caseId: _activeCaseId,
          onSampleRegistered: () => setState(() => _subScreen = 'referral'),
        );
        break;
      case 'referral':
        activeWidget = LabReferralScreen(
          sampleId: 'LAB-2026-00128',
          onReferralSubmitted: () => setState(() => _subScreen = 'tracking'),
        );
        break;
      case 'tracking':
        activeWidget = SampleTrackingScreen(sampleId: 'LAB-2026-00128');
        break;
      case 'treatment':
        activeWidget = TreatmentScreen(
          caseId: _activeCaseId,
          onTreatmentSaved: () => setState(() => _subScreen = 'details'),
        );
        break;
      case 'followup':
        activeWidget = FollowUpScreen(
          caseId: _activeCaseId,
          onFollowUpScheduled: () => setState(() => _subScreen = 'details'),
        );
        break;
      case 'escalate':
        activeWidget = EscalationScreen(
          caseId: _activeCaseId,
          onEscalated: () => setState(() => _subScreen = 'details'),
        );
        break;
      default:
        activeWidget = VetDashboardScreen(
          onOpenCases: () => setState(() => _subScreen = 'details'),
          onOpenCaseDetails: (id) => setState(() {
            _activeCaseId = id;
            _subScreen = 'details';
          }),
        );
    }

    return Scaffold(
      body: activeWidget,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() {
            _currentIndex = index;
            if (index == 0) _subScreen = 'dashboard';
            if (index == 1) _subScreen = 'details';
            if (index == 2) _subScreen = 'tracking';
          });
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.local_hospital_outlined), selectedIcon: Icon(Icons.local_hospital), label: 'Active Case'),
          NavigationDestination(icon: Icon(Icons.science_outlined), selectedIcon: Icon(Icons.science), label: 'Lab Tracking'),
        ],
      ),
    );
  }
}
