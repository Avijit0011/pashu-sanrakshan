import 'package:flutter/material.dart';

class SampleTrackingScreen extends StatelessWidget {
  final String sampleId;
  const SampleTrackingScreen({Key? key, required this.sampleId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final steps = [
      _TrackStep(title: 'Sample Requested', time: '10:30 AM', person: 'Dr. Anita Sharma', done: true),
      _TrackStep(title: 'Sample Collected', time: '11:15 AM', person: 'Field Paravet Suresh', done: true),
      _TrackStep(title: 'Sent to Laboratory', time: '01:00 PM', person: 'Express Courier', done: true),
      _TrackStep(title: 'Received by Laboratory', time: '02:30 PM', person: 'Lab Tech Patel', done: true),
      _TrackStep(title: 'Testing (PCR Assay)', time: '03:15 PM', person: 'Molecular Bio Unit', done: true),
      _TrackStep(title: 'Result Available', time: '04:45 PM', person: 'Dr. V.K. Singh (Microbiologist)', done: true),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Text('SAMPLE TRACKING #$sampleId'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.green.shade50,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.green.shade200),
              ),
              child: const Row(
                children: [
                  Icon(Icons.check_circle, color: Colors.green, size: 24),
                  SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('LAB RESULT READY', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.green)),
                        Text('Diagnostic testing complete. Result ready for review.', style: TextStyle(fontSize: 11, color: Color(0xFF0F172A))),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: steps.length,
              itemBuilder: (context, index) {
                final item = steps[index];
                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Column(
                      children: [
                        CircleAvatar(
                          radius: 12,
                          backgroundColor: item.done ? Colors.teal : Colors.grey.shade300,
                          child: Icon(item.done ? Icons.check : Icons.circle, size: 12, color: Colors.white),
                        ),
                        if (index < steps.length - 1)
                          Container(width: 2, height: 45, color: item.done ? Colors.teal : Colors.grey.shade300),
                      ],
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item.title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                          Text('${item.time} • ${item.person}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                          const SizedBox(height: 20),
                        ],
                      ),
                    ),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _TrackStep {
  final String title;
  final String time;
  final String person;
  final bool done;
  _TrackStep({required this.title, required this.time, required this.person, required this.done});
}
