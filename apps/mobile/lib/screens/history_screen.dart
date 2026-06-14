import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  late Future<Map<String, dynamic>> _historyFuture;

  @override
  void initState() {
    super.initState();
    _historyFuture = ApiService.getUserHistory();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? Colors.white : Colors.black;
    final mutedTextColor = isDark ? Colors.white54 : Colors.black54;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text('Activity History', style: TextStyle(fontWeight: FontWeight.bold, color: textColor)),
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        elevation: 0,
        automaticallyImplyLeading: false,
      ),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _historyFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: AppTheme.primaryRed));
          } else if (snapshot.hasError) {
            return Center(child: Text('Error loading history: ${snapshot.error}', style: TextStyle(color: textColor)));
          } else if (!snapshot.hasData || (snapshot.data!['donations']?.isEmpty == true && snapshot.data!['requests']?.isEmpty == true)) {
            return Center(child: Text('No history found', style: TextStyle(color: textColor)));
          }

          final data = snapshot.data!;
          final List<dynamic> requests = data['requests'] ?? [];
          final List<dynamic> donations = data['donations'] ?? [];

          return DefaultTabController(
            length: 2,
            child: Column(
              children: [
                TabBar(
                  indicatorColor: AppTheme.primaryRed,
                  labelColor: AppTheme.primaryRed,
                  unselectedLabelColor: mutedTextColor,
                  tabs: const [
                    Tab(text: 'Donations'),
                    Tab(text: 'Requests'),
                  ],
                ),
                Expanded(
                  child: TabBarView(
                    children: [
                      // Donations Tab
                      donations.isEmpty 
                        ? Center(child: Text('No past donations', style: TextStyle(color: mutedTextColor)))
                        : ListView.separated(
                            padding: const EdgeInsets.all(24),
                            itemCount: donations.length,
                            separatorBuilder: (context, index) => const SizedBox(height: 16),
                            itemBuilder: (context, index) {
                              final d = donations[index];
                              return _buildHistoryCard(
                                context,
                                icon: Icons.water_drop,
                                title: 'Donated ${d['blood_group']}',
                                subtitle: '${d['target_hospital_name'] ?? 'Hospital'} • ${d['updated_at']?.toString().split('T')[0] ?? 'Unknown'}',
                                status: d['status']?.toString().toUpperCase() ?? 'COMPLETED',
                                statusColor: Colors.green,
                                showCertificate: true,
                              );
                            },
                          ),
                      
                      // Requests Tab
                      requests.isEmpty 
                        ? Center(child: Text('No past requests', style: TextStyle(color: mutedTextColor)))
                        : ListView.separated(
                            padding: const EdgeInsets.all(24),
                            itemCount: requests.length,
                            separatorBuilder: (context, index) => const SizedBox(height: 16),
                            itemBuilder: (context, index) {
                              final r = requests[index];
                              final status = r['status']?.toString().toUpperCase() ?? 'PENDING';
                              Color statusColor = Colors.orange;
                              if (status == 'FULFILLED') statusColor = Colors.green;
                              if (status == 'CANCELLED') statusColor = Colors.grey;

                              return _buildHistoryCard(
                                context,
                                icon: Icons.emergency,
                                title: 'Emergency: ${r['blood_group']} Needed',
                                subtitle: '${r['units_required']} Units • ${r['target_hospital_name'] ?? 'Hospital'}',
                                status: status,
                                statusColor: statusColor,
                              );
                            },
                          ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildHistoryCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required String status,
    required Color statusColor,
    bool showCertificate = false,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? Colors.white : Colors.black;
    final bgColor = isDark ? Colors.white.withOpacity(0.05) : Colors.black.withOpacity(0.05);
    final borderColor = isDark ? Colors.white.withOpacity(0.08) : Colors.black.withOpacity(0.08);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppTheme.primaryRed.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: AppTheme.primaryRed, size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: textColor,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: TextStyle(
                    color: isDark ? AppTheme.textSecondary : Colors.black54,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: statusColor.withOpacity(0.2)),
                ),
                child: Text(
                  status,
                  style: TextStyle(
                    color: statusColor,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1,
                  ),
                ),
              ),
              if (showCertificate) ...[
                const SizedBox(height: 8),
                TextButton.icon(
                  onPressed: () {
                    // TODO: Implement certificate download
                  },
                  icon: const Icon(Icons.download, size: 16),
                  label: const Text('CERT'),
                  style: TextButton.styleFrom(
                    foregroundColor: AppTheme.primaryRed,
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 0),
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                ),
              ]
            ],
          ),
        ],
      ),
    );
  }
}
