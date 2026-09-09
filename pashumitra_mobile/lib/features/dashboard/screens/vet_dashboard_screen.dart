import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/risk_gauge.dart';
import '../../../models/models.dart';

class VetDashboardScreen extends StatelessWidget {
  final VoidCallback? onOpenCases;
  final Function(String caseId)? onOpenCaseDetails;

  const VetDashboardScreen({
    Key? key,
    this.onOpenCases,
    this.onOpenCaseDetails,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Good Morning, Dr. Sharma',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            Text(
              'District Veterinary Officer • Anand / Bagnan Block',
              style: TextStyle(fontSize: 11, color: Colors.grey),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_active_outlined, color: AppTheme.primaryGreen),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.sync, color: Colors.grey),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Outbreak Alert Banner
            _buildOutbreakAlertCard(context),
            const SizedBox(height: 16),

            // Summary KPI Cards Grid
            const Text(
              'YOUR CASES OVERVIEW',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.1),
            ),
            const SizedBox(height: 8),
            _buildSummaryKpiGrid(),
            const SizedBox(height: 20),

            // Priority Cases Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'PRIORITY SURVEILLANCE CASES',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.1),
                ),
                TextButton(
                  onPressed: onOpenCases,
                  child: const Text('View All (12)', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryGreen)),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Priority Case Card Example 1
            _buildPriorityCaseCard(
              context: context,
              caseId: 'PM-1028',
              animalTag: 'Cow • AN-4582',
              village: 'Bagnan Village',
              symptoms: 'Respiratory distress, high fever, coughing',
              score: 82,
              level: RiskLevel.high,
              affected: 5,
              dead: 1,
              status: 'PENDING VET REVIEW',
              onTap: () => onOpenCaseDetails?.call('PM-1028'),
            ),

            const SizedBox(height: 12),

            // Priority Case Card Example 2 (Critical)
            _buildPriorityCaseCard(
              context: context,
              caseId: 'PM-1031',
              animalTag: 'Buffalo • BUF-9021',
              village: 'Anand Rural Sector B',
              symptoms: 'Submandibular edema, mucosal hemorrhage',
              score: 94,
              level: RiskLevel.critical,
              affected: 7,
              dead: 2,
              status: 'ESCALATED',
              onTap: () => onOpenCaseDetails?.call('PM-1031'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOutbreakAlertCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF991B1B), Color(0xFF7F1D1D)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 8, offset: Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: Colors.red.shade400.withOpacity(0.3), shape: BoxShape.circle),
                child: const Icon(Icons.warning_amber_rounded, color: Colors.white, size: 24),
              ),
              const SizedBox(width: 10),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('⚠ POTENTIAL OUTBREAK DETECTED', style: TextStyle(color: Colors.amberAccent, fontSize: 11, fontWeight: FontWeight.bold)),
                    Text('Multiple High-Risk Cases in Bagnan Block', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _OutbreakStatItem(label: 'Cluster Radius', value: '8.5 km'),
              _OutbreakStatItem(label: 'High Risk Cases', value: '5 Reports'),
              _OutbreakStatItem(label: 'Affected Animals', value: '17 Herd'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryKpiGrid() {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 3,
      crossAxisSpacing: 8,
      mainAxisSpacing: 8,
      childAspectRatio: 1.3,
      children: const [
        _KpiCard(title: 'New Cases', count: '12', color: AppTheme.primaryGreen, icon: Icons.folder_open),
        _KpiCard(title: 'High Risk', count: '4', color: Colors.red, icon: Icons.error_outline),
        _KpiCard(title: 'Lab Pending', count: '6', color: Colors.amber, icon: Icons.science_outlined),
        _KpiCard(title: 'Follow-ups', count: '8', color: Colors.purple, icon: Icons.event_repeat),
        _KpiCard(title: 'Escalated', count: '2', color: Colors.deepOrange, icon: Icons.local_hospital_outlined),
        _KpiCard(title: 'Resolved', count: '15', color: Colors.teal, icon: Icons.check_circle_outline),
      ],
    );
  }

  Widget _buildPriorityCaseCard({
    required BuildContext context,
    required String caseId,
    required String animalTag,
    required String village,
    required String symptoms,
    required int score,
    required RiskLevel level,
    required int affected,
    required int dead,
    required String status,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 2,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              RiskGaugeWidget(score: score, level: level, size: 70),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('CASE #$caseId', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.blue.shade50,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: Colors.blue.shade200),
                          ),
                          child: Text(status, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.blue)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(animalTag, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                    const SizedBox(height: 2),
                    Text('📍 Village: $village', style: TextStyle(fontSize: 12, color: Colors.grey.shade700)),
                    const SizedBox(height: 4),
                    Text('Symptoms: $symptoms', maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11, color: Colors.grey, fontStyle: FontStyle.italic)),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Text('$affected Affected', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF334155))),
                        if (dead > 0) ...[
                          const SizedBox(width: 8),
                          Text('($dead Dead)', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.red)),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: Colors.grey),
            ],
          ),
        ),
      ),
    );
  }
}

class _OutbreakStatItem extends StatelessWidget {
  final String label;
  final String value;
  const _OutbreakStatItem({Key? key, required this.label, required this.value}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 10)),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
      ],
    );
  }
}

class _KpiCard extends StatelessWidget {
  final String title;
  final String count;
  final Color color;
  final IconData icon;

  const _KpiCard({
    Key? key,
    required this.title,
    required this.count,
    required this.color,
    required this.icon,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon, size: 18, color: color),
              Text(count, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: color, fontFamily: 'monospace')),
            ],
          ),
          const SizedBox(height: 4),
          Text(title, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey.shade700)),
        ],
      ),
    );
  }
}
