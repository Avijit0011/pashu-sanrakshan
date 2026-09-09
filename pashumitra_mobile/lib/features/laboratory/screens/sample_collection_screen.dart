import 'package:flutter/material.dart';
import '../../../core/constants/app_enums.dart';

class SampleCollectionScreen extends StatefulWidget {
  final String caseId;
  final VoidCallback? onSampleRegistered;

  const SampleCollectionScreen({
    Key? key,
    required this.caseId,
    this.onSampleRegistered,
  }) : super(key: key);

  @override
  State<SampleCollectionScreen> createState() => _SampleCollectionScreenState();
}

class _SampleCollectionScreenState extends State<SampleCollectionScreen> {
  final String _sampleId = 'LAB-2026-00128';
  SampleType _type = SampleType.swab;
  String _priority = 'HIGH';
  final _notesController = TextEditingController(text: 'Nasal swab collected in VTM transport medium.');

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('REGISTER SAMPLE COLLECTION'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.teal.shade50,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.teal.shade200),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Generated Sample Barcode:', style: TextStyle(fontSize: 12, color: Colors.grey)),
                  Text(
                    _sampleId,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.black, fontFamily: 'monospace', color: Colors.teal),
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
                    DropdownButtonFormField<SampleType>(
                      value: _type,
                      decoration: const InputDecoration(labelText: 'Sample Specimen Type *'),
                      items: SampleType.values
                          .map((e) => DropdownMenuItem(
                                value: e,
                                child: Text(e.name.toUpperCase()),
                              ))
                          .toList(),
                      onChanged: (v) => setState(() => _type = v!),
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      value: _priority,
                      decoration: const InputDecoration(labelText: 'Lab Priority'),
                      items: ['CRITICAL', 'HIGH', 'MEDIUM', 'NORMAL']
                          .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                          .toList(),
                      onChanged: (v) => setState(() => _priority = v!),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _notesController,
                      maxLines: 2,
                      decoration: const InputDecoration(labelText: 'Collection & Storage Notes'),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Sample $_sampleId registered & barcode created!')),
                  );
                  widget.onSampleRegistered?.call();
                },
                icon: const Icon(Icons.qr_code_2),
                label: const Text('SAVE & PROCEED TO LAB REFERRAL'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
