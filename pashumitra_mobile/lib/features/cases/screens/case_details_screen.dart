import 'package:flutter/material.dart';
import '../../../core/constants/app_enums.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/risk_gauge.dart';
import '../../../core/widgets/timeline_widget.dart';
import '../../../models/models.dart';

class CaseDetailsScreen extends StatelessWidget {
  final String caseId;
  final VoidCallback? onStartInvestigation;
  final VoidCallback? onRequestLabTest;
  final VoidCallback? onPrescribeTreatment;
  final VoidCallback? onScheduleFollowUp;
  final VoidCallback? onEscalate;

  const CaseDetailsScreen({
    Key? key,
    required this.caseId,
    this.onStartInvestigation,
    this.onRequestLabTest,
    this.onPrescribeTreatment,
    this.onScheduleFollowUp,
    this.onEscalate,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('CASE FILE #$caseId'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Overall Risk Assessment Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    const RiskGaugeWidget(score: 82, level: RiskLevel.high, size: 85),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('OVERALL RISK ASSESSMENT', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
                          const SizedBox(height: 2),
                          const Text('82 / 100 — HIGH RISK', style: TextStyle(fontSize: 16, fontWeight: FontWeight.black, color: Colors.red)),
                          const SizedBox(height: 4),
                          Text('Multifactorial score: AI result + 5 herd affected + 1 mortality + Anand cluster proximity.', style: TextStyle(fontSize: 11, color: Colors.grey.shade700)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),

            // AI Screening Result Card
            Card(
              color: Colors.blue.shade50,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: BorderSide(color: Colors.blue.shade200),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.psychology, color: Colors.blue, size: 20),
                            SizedBox(width: 6),
                            Text('AI SCREENING RESULT', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.blue)),
                          ],
                        ),
                        Chip(
                          label: Text('High Confidence', style: TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold)),
                          backgroundColor: Colors.blue,
                          visualDensity: VisualDensity.compact,
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    const Text('Possible Condition: Respiratory Disease (Suspected Haemorrhagic Septicaemia)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                    const SizedBox(height: 8),
                    const Text('Detected Symptoms:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                    const SizedBox(height: 4),
                    const Wrap(
                      spacing: 6,
                      children: [
                        Chip(label: Text('✓ Coughing', style: TextStyle(fontSize: 10))),
                        Chip(label: Text('✓ Nasal discharge', style: TextStyle(fontSize: 10))),
                        Chip(label: Text('✓ Reduced activity', style: TextStyle(fontSize: 10))),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8)),
                      child: const Row(
                        children: [
                          Icon(Icons.info_outline, size: 14, color: Colors.grey),
                          SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              'AI screening is decision support and does not replace professional veterinary diagnosis.',
                              style: TextStyle(fontSize: 10, color: Colors.grey, fontStyle: FontStyle.italic),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Action Control Toolbar Buttons
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                ElevatedButton.icon(
                  onPressed: onStartInvestigation,
                  icon: const Icon(Icons.health_and_safety, size: 16),
                  label: const Text('Start Investigation'),
                ),
                OutlinedButton.icon(
                  onPressed: onRequestLabTest,
                  icon: const Icon(Icons.science, size: 16),
                  label: const Text('Request Lab Test'),
                ),
                OutlinedButton.icon(
                  onPressed: onPrescribeTreatment,
                  icon: const Icon(Icons.medication, size: 16),
                  label: const Text('Record Treatment'),
                ),
                OutlinedButton.icon(
                  onPressed: onScheduleFollowUp,
                  icon: const Icon(Icons.event, size: 16),
                  label: const Text('Schedule Follow-Up'),
                ),
                ElevatedButton.icon(
                  onPressed: onEscalate,
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                  icon: const Icon(Icons.warning, size: 16),
                  label: const Text('Escalate Case'),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Animal Information Section
            const Text('ANIMAL & OWNER INFORMATION', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.1)),
            const SizedBox(height: 8),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14.0),
                child: Column(
                  children: [
                    _buildInfoRow('Animal Tag ID', 'AN-4582 (Cow)'),
                    _buildInfoRow('Breed / Species', 'Gir Cow • 4.5 Years (Female)'),
                    _buildInfoRow('Owner Name', 'Ramesh Kumar (Farmer)'),
                    _buildInfoRow('Location', 'Bagnan Village, District Anand'),
                    _buildInfoRow('Vaccination Status', 'HS & FMD Vaccinated (6 mos ago)'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Disease Report Section
            const Text('DISEASE REPORT & SEVERITY', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.1)),
            const SizedBox(height: 8),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14.0),
                child: Column(
                  children: [
                    _buildInfoRow('Observed Symptoms', 'High fever (104°F), coughing, labored breathing'),
                    _buildInfoRow('Symptom Duration', '3 Days'),
                    _buildInfoRow('Affected Animals', '5 in farm herd'),
                    _buildInfoRow('Mortality Count', '1 animal death'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Dynamic Case Timeline
            const Text('DYNAMIC CASE RESPONSE TIMELINE', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.1)),
            const SizedBox(height: 8),
            CaseTimelineWidget(
              events: [
                CaseEvent(id: '1', caseId: caseId, userName: 'Ramesh Kumar', userRole: 'FARMER', previousStatus: 'SUBMITTED', newStatus: 'Report Submitted', notes: 'Cow exhibiting respiratory distress and fever', createdAt: '2026-09-09T10:30:00Z'),
                CaseEvent(id: '2', caseId: caseId, userName: 'PashuMitra Risk Engine', userRole: 'SYSTEM', previousStatus: 'SUBMITTED', newStatus: 'AI Screening Completed', notes: 'Risk Score 82/100 (HIGH RISK)', createdAt: '2026-09-09T11:05:00Z'),
                CaseEvent(id: '3', caseId: caseId, userName: 'Dr. Anita Sharma', userRole: 'VETERINARIAN', previousStatus: 'AI_SCREENED', newStatus: 'Veterinarian Assigned', notes: 'Assigned to Anand block surveillance team', createdAt: '2026-09-09T12:15:00Z'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
          Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
        ],
      ),
    );
  }
}
