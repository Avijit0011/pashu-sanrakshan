import 'package:flutter/material.dart';

class LabReferralScreen extends StatefulWidget {
  final String sampleId;
  final VoidCallback? onReferralSubmitted;

  const LabReferralScreen({
    Key? key,
    required this.sampleId,
    this.onReferralSubmitted,
  }) : super(key: key);

  @override
  State<LabReferralScreen> createState() => _LabReferralScreenState();
}

class _LabReferralScreenState extends State<LabReferralScreen> {
  String _selectedLab = 'District Veterinary Diagnostic Laboratory (Anand)';
  String _testRequired = 'PCR Assay (Pasteurella multocida / HS)';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('SUBMIT LABORATORY REFERRAL'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('SELECT REGIONAL VETERINARY LAB', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.1)),
            const SizedBox(height: 8),

            _buildLabCard(
              name: 'District Veterinary Diagnostic Laboratory (Anand)',
              distance: '18 km away',
              tests: 'PCR • Culture & Sensitivity • Serology',
              isSelected: _selectedLab.contains('Anand'),
              onTap: () => setState(() => _selectedLab = 'District Veterinary Diagnostic Laboratory (Anand)'),
            ),
            const SizedBox(height: 8),
            _buildLabCard(
              name: 'State Animal Health Research Institute',
              distance: '42 km away',
              tests: 'Real-Time RT-PCR • Genome Sequencing • Histopathology',
              isSelected: _selectedLab.contains('State'),
              onTap: () => setState(() => _selectedLab = 'State Animal Health Research Institute'),
            ),

            const SizedBox(height: 16),
            const Text('TEST REQUIRED', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.1)),
            const SizedBox(height: 8),

            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: DropdownButtonFormField<String>(
                  value: _testRequired,
                  decoration: const InputDecoration(labelText: 'Diagnostic Test Panel'),
                  items: [
                    'PCR Assay (Pasteurella multocida / HS)',
                    'Bacterial Culture & Antimicrobial Sensitivity',
                    'FMD Serology ELISA',
                    'Histopathology Examination',
                  ].map((e) => DropdownMenuItem(value: e, child: Text(e, style: const TextStyle(fontSize: 12)))).toList(),
                  onChanged: (v) => setState(() => _testRequired = v!),
                ),
              ),
            ),
            const SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Sample ${widget.sampleId} dispatched to $_selectedLab!')),
                  );
                  widget.onReferralSubmitted?.call();
                },
                icon: const Icon(Icons.send),
                label: const Text('SUBMIT LAB REFERRAL & DISPATCH'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLabCard({
    required String name,
    required String distance,
    required String tests,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return Card(
      color: isSelected ? Colors.teal.shade50 : Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: isSelected ? Colors.teal : Colors.grey.shade300, width: isSelected ? 2 : 1),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(14.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(child: Text(name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)))),
                  if (isSelected) const Icon(Icons.check_circle, color: Colors.teal, size: 20),
                ],
              ),
              const SizedBox(height: 4),
              Text('📍 Distance: $distance', style: const TextStyle(fontSize: 12, color: Colors.grey)),
              const SizedBox(height: 4),
              Text('Available Tests: $tests', style: const TextStyle(fontSize: 11, color: Colors.teal, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ),
    );
  }
}
