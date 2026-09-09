import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class InvestigationScreen extends StatefulWidget {
  final String caseId;
  final VoidCallback? onSubmitSuccess;

  const InvestigationScreen({
    Key? key,
    required this.caseId,
    this.onSubmitSuccess,
  }) : super(key: key);

  @override
  State<InvestigationScreen> createState() => _InvestigationScreenState();
}

class _InvestigationScreenState extends State<InvestigationScreen> {
  final _formKey = GlobalKey<FormState>();

  // Clinical Exam
  double _bodyTemp = 103.5;
  int _respRate = 36;
  int _heartRate = 72;
  String _appetite = 'Reduced';
  String _activity = 'Lethargic';
  String _hydration = 'Mildly Dehydrated';
  final _clinicalNotesController = TextEditingController(text: 'Submandibular swelling, bilateral mucopurulent nasal discharge observed.');

  // Assessment
  final _suspectedDiseaseController = TextEditingController(text: 'Haemorrhagic Septicaemia');
  final _diffDiagnosisController = TextEditingController(text: 'Blackquarter / Anthrax');
  String _severity = 'Severe';
  int _affectedCount = 5;
  int _deathCount = 1;

  // Decision
  String _decision = 'Request Laboratory Test';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('CLINICAL INVESTIGATION #${widget.caseId}'),
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Clinical Examination Section
              const Text('1. CLINICAL EXAMINATION', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.1)),
              const SizedBox(height: 8),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              initialValue: _bodyTemp.toString(),
                              decoration: const InputDecoration(labelText: 'Body Temp (°F)', suffixText: '°F'),
                              keyboardType: TextInputType.number,
                              onSaved: (v) => _bodyTemp = double.tryParse(v ?? '') ?? 102.0,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: TextFormField(
                              initialValue: _respRate.toString(),
                              decoration: const InputDecoration(labelText: 'Resp Rate (/min)'),
                              keyboardType: TextInputType.number,
                              onSaved: (v) => _respRate = int.tryParse(v ?? '') ?? 30,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              value: _appetite,
                              decoration: const InputDecoration(labelText: 'Appetite'),
                              items: ['Normal', 'Reduced', 'Anorexic']
                                  .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                                  .toList(),
                              onChanged: (v) => setState(() => _appetite = v!),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              value: _activity,
                              decoration: const InputDecoration(labelText: 'Activity Level'),
                              items: ['Normal', 'Lethargic', 'Recumbent']
                                  .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                                  .toList(),
                              onChanged: (v) => setState(() => _activity = v!),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _clinicalNotesController,
                        maxLines: 2,
                        decoration: const InputDecoration(labelText: 'Clinical Examination Notes'),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Disease Assessment Section
              const Text('2. DISEASE ASSESSMENT & DIAGNOSIS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.1)),
              const SizedBox(height: 8),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      TextFormField(
                        controller: _suspectedDiseaseController,
                        decoration: const InputDecoration(labelText: 'Suspected Primary Disease *'),
                        validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _diffDiagnosisController,
                        decoration: const InputDecoration(labelText: 'Differential Diagnosis'),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Veterinary Decision Section
              const Text('3. VETERINARY DECISION CONTROL', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.1)),
              const SizedBox(height: 8),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      DropdownButtonFormField<String>(
                        value: _decision,
                        decoration: const InputDecoration(labelText: 'Action Decision'),
                        items: [
                          'Monitor',
                          'Treat Locally',
                          'Request Laboratory Test',
                          'Isolate Animal',
                          'Escalate Case',
                          'Close Case'
                        ].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
                        onChanged: (v) => setState(() => _decision = v!),
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
                      _formKey.currentState?.save();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Investigation submitted successfully! Status updated.')),
                      );
                      widget.onSubmitSuccess?.call();
                    }
                  },
                  icon: const Icon(Icons.check_circle),
                  label: const Text('SUBMIT CLINICAL INVESTIGATION'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
