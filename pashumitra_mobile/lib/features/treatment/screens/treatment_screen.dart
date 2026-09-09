import 'package:flutter/material.dart';
import '../../../core/constants/app_enums.dart';

class TreatmentScreen extends StatefulWidget {
  final String caseId;
  final VoidCallback? onTreatmentSaved;

  const TreatmentScreen({
    Key? key,
    required this.caseId,
    this.onTreatmentSaved,
  }) : super(key: key);

  @override
  State<TreatmentScreen> createState() => _TreatmentScreenState();
}

class _TreatmentScreenState extends State<TreatmentScreen> {
  final _formKey = GlobalKey<FormState>();
  final _medicineController = TextEditingController(text: 'Oxytetracycline Injection (100mg/ml)');
  final _dosageController = TextEditingController(text: '10 mg/kg IV');
  final _frequencyController = TextEditingController(text: 'Once Daily');
  final _durationController = TextEditingController(text: '5 Days');
  String _method = 'Intravenous (IV)';
  TreatmentStatus _status = TreatmentStatus.started;
  final _notesController = TextEditingController(text: 'Administered under strict aseptic conditions. Advised isolation of affected cow.');

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('RECORD TREATMENT #${widget.caseId}'),
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('PRESCRIBED MEDICATION & DOSAGE', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.1)),
              const SizedBox(height: 8),

              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      TextFormField(
                        controller: _medicineController,
                        decoration: const InputDecoration(labelText: 'Medicine Name & Strength *'),
                        validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              controller: _dosageController,
                              decoration: const InputDecoration(labelText: 'Dosage Rate *'),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: TextFormField(
                              controller: _frequencyController,
                              decoration: const InputDecoration(labelText: 'Frequency'),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              controller: _durationController,
                              decoration: const InputDecoration(labelText: 'Duration'),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              value: _method,
                              decoration: const InputDecoration(labelText: 'Method'),
                              items: ['Intravenous (IV)', 'Intramuscular (IM)', 'Subcutaneous (SC)', 'Oral', 'Topical']
                                  .map((e) => DropdownMenuItem(value: e, child: Text(e, style: const TextStyle(fontSize: 11))))
                                  .toList(),
                              onChanged: (v) => setState(() => _method = v!),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<TreatmentStatus>(
                        value: _status,
                        decoration: const InputDecoration(labelText: 'Treatment Status'),
                        items: TreatmentStatus.values
                            .map((e) => DropdownMenuItem(value: e, child: Text(e.name.toUpperCase())))
                            .toList(),
                        onChanged: (v) => setState(() => _status = v!),
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _notesController,
                        maxLines: 2,
                        decoration: const InputDecoration(labelText: 'Veterinarian Prescription Notes'),
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
                    if (_formKey.currentState?.validate() ?? false) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Treatment record saved & status updated to TREATMENT STARTED!')),
                      );
                      widget.onTreatmentSaved?.call();
                    }
                  },
                  icon: const Icon(Icons.medication),
                  label: const Text('SAVE TREATMENT RECORD'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
