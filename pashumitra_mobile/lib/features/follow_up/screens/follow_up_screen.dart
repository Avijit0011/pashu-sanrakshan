import 'package:flutter/material.dart';

class FollowUpScreen extends StatefulWidget {
  final String caseId;
  final VoidCallback? onFollowUpScheduled;

  const FollowUpScreen({
    Key? key,
    required this.caseId,
    this.onFollowUpScheduled,
  }) : super(key: key);

  @override
  State<FollowUpScreen> createState() => _FollowUpScreenState();
}

class _FollowUpScreenState extends State<FollowUpScreen> {
  DateTime _date = DateTime.now().add(const Duration(days: 3));
  String _condition = 'Improving';
  final _responseController = TextEditingController(text: 'Submandibular edema significantly reduced. Temperature 101.8°F.');
  final _notesController = TextEditingController(text: 'Continue supportive care and vitamins for 2 more days.');

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 4,
      child: Scaffold(
        appBar: AppBar(
          title: Text('FOLLOW-UP & RE-INSPECTION #${widget.caseId}'),
          bottom: const TabBar(
            isScrollable: true,
            tabs: [
              Tab(text: 'Today (2)'),
              Tab(text: 'Tomorrow (3)'),
              Tab(text: 'This Week (8)'),
              Tab(text: 'Overdue (1)'),
            ],
          ),
        ),
        body: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('SCHEDULE NEW FOLLOW-UP INSPECTION', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.1)),
                    const SizedBox(height: 8),

                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          children: [
                            ListTile(
                              title: const Text('Follow-Up Date', style: TextStyle(fontSize: 12, color: Colors.grey)),
                              subtitle: Text(
                                '${_date.day}/${_date.month}/${_date.year}',
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                              ),
                              trailing: const Icon(Icons.calendar_month, color: Colors.teal),
                              onTap: () async {
                                final d = await showDatePicker(
                                  context: context,
                                  initialDate: _date,
                                  firstDate: DateTime.now(),
                                  lastDate: DateTime.now().add(const Duration(days: 60)),
                                );
                                if (d != null) setState(() => _date = d);
                              },
                            ),
                            const Divider(),
                            DropdownButtonFormField<String>(
                              value: _condition,
                              decoration: const InputDecoration(labelText: 'Animal Condition Response'),
                              items: ['Significantly Improved', 'Improving', 'Unchanged', 'Deteriorated']
                                  .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                                  .toList(),
                              onChanged: (v) => setState(() => _condition = v!),
                            ),
                            const SizedBox(height: 12),
                            TextFormField(
                              controller: _responseController,
                              decoration: const InputDecoration(labelText: 'Treatment Response Observations'),
                            ),
                            const SizedBox(height: 12),
                            TextFormField(
                              controller: _notesController,
                              maxLines: 2,
                              decoration: const InputDecoration(labelText: 'Follow-up Instructions for Farmer'),
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
                            const SnackBar(content: Text('Follow-up inspection scheduled successfully! Notification set.')),
                          );
                          widget.onFollowUpScheduled?.call();
                        },
                        icon: const Icon(Icons.event_available),
                        label: const Text('SCHEDULE FOLLOW-UP & NOTIFY FARMER'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
