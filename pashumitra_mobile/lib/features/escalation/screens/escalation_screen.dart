import 'package:flutter/material.dart';

class EscalationScreen extends StatefulWidget {
  final String caseId;
  final VoidCallback? onEscalated;

  const EscalationScreen({
    Key? key,
    required this.caseId,
    this.onEscalated,
  }) : super(key: key);

  @override
  State<EscalationScreen> createState() => _EscalationScreenState();
}

class _EscalationScreenState extends State<EscalationScreen> {
  final _reasonController = TextEditingController(text: 'High mortality rate & rapid spatial spread observed in Anand North Corridor.');
  final _actionController = TextEditingController(text: 'Quarantine established, ring vaccination deployed, transport movement restricted.');
  final _alertNotesController = TextEditingController(text: 'Urgent intervention requested: Additional vaccine stock and mobile vet squad required.');
  String _severity = 'CRITICAL';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('ESCALATE CASE #${widget.caseId}'),
        backgroundColor: Colors.red.shade50,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.red.shade200),
              ),
              child: const Row(
                children: [
                  Icon(Icons.warning_amber_rounded, color: Colors.red, size: 28),
                  SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('DISTRICT AUTHORITY ESCALATION', style: TextStyle(fontSize: 13, fontWeight: FontWeight.black, color: Colors.red)),
                        Text('Escalating this case triggers immediate alert to Chief District Veterinary Officer.', style: TextStyle(fontSize: 11, color: Color(0xFF0F172A))),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    DropdownButtonFormField<String>(
                      value: _severity,
                      decoration: const InputDecoration(labelText: 'Escalation Severity Level'),
                      items: ['CRITICAL', 'HIGH', 'EMERGENCY']
                          .map((e) => DropdownMenuItem(value: e, child: Text(e, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.red))))
                          .toList(),
                      onChanged: (v) => setState(() => _severity = v!),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _reasonController,
                      maxLines: 2,
                      decoration: const InputDecoration(labelText: 'Primary Reason for Escalation *'),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _actionController,
                      maxLines: 2,
                      decoration: const InputDecoration(labelText: 'Immediate Containment Action Taken'),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _alertNotesController,
                      maxLines: 2,
                      decoration: const InputDecoration(labelText: 'Notes & Assistance Requested from Authorities'),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red.shade700),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('CASE ESCALATED! High-priority alert sent to Chief District Veterinary Officer.')),
                  );
                  widget.onEscalated?.call();
                },
                icon: const Icon(Icons.campaign),
                label: const Text('SUBMIT OFFICIAL ESCALATION & ALERT AUTHORITY'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
