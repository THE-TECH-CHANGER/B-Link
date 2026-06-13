import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Activity History', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: AppTheme.background,
        elevation: 0,
        automaticallyImplyLeading: false, // Hidden because it's a tab
      ),
      body: DefaultTabController(
        length: 2,
        child: Column(
          children: [
            const TabBar(
              indicatorColor: AppTheme.primaryRed,
              labelColor: AppTheme.primaryRed,
              unselectedLabelColor: Colors.white54,
              tabs: [
                Tab(text: 'Donations'),
                Tab(text: 'Requests'),
              ],
            ),
            Expanded(
              child: TabBarView(
                children: [
                  // Donations Tab
                  ListView(
                    padding: const EdgeInsets.all(24),
                    children: [
                      _buildHistoryCard(
                        icon: Icons.water_drop,
                        title: 'Donated Whole Blood',
                        subtitle: 'Apollo Hospital • 12 Jan 2026',
                        status: 'COMPLETED',
                        statusColor: Colors.green,
                      ),
                      const SizedBox(height: 16),
                      _buildHistoryCard(
                        icon: Icons.water_drop,
                        title: 'Donated Plasma',
                        subtitle: 'City Blood Bank • 05 Sep 2025',
                        status: 'COMPLETED',
                        statusColor: Colors.green,
                      ),
                    ],
                  ),
                  
                  // Requests Tab
                  ListView(
                    padding: const EdgeInsets.all(24),
                    children: [
                      _buildHistoryCard(
                        icon: Icons.emergency,
                        title: 'Emergency: O+ Needed',
                        subtitle: '2 Units • Apollo Hospital',
                        status: 'FULFILLED',
                        statusColor: Colors.green,
                      ),
                      const SizedBox(height: 16),
                      _buildHistoryCard(
                        icon: Icons.emergency,
                        title: 'Emergency: A- Needed',
                        subtitle: '1 Unit • General Hospital',
                        status: 'CANCELLED',
                        statusColor: Colors.grey,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHistoryCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required String status,
    required Color statusColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
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
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: const TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
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
        ],
      ),
    );
  }
}
