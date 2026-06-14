import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../services/fcm_helper.dart';
import 'history_screen.dart';
import 'profile_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _alertsEnabled = true;
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    FCMHelper.initFCM();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    final List<Widget> _screens = [
      _buildHomeContent(),
      const HistoryScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: IndexedStack(
        index: _selectedIndex,
        children: _screens,
      ),
      // Floating Action Button for Emergencies
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.pushNamed(context, '/request');
        },
        backgroundColor: AppTheme.primaryRed,
        icon: const Icon(Icons.emergency, color: Colors.white),
        label: const Text('Request Blood', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      
      // Bottom Navigation
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          border: Border(
            top: BorderSide(color: isDark ? Colors.white.withOpacity(0.05) : Colors.black.withOpacity(0.05)),
          ),
        ),
        child: BottomNavigationBar(
          backgroundColor: isDark ? const Color(0xFF121212) : Colors.white,
          selectedItemColor: AppTheme.primaryRed,
          unselectedItemColor: isDark ? Colors.grey.shade600 : Colors.grey.shade400,
          currentIndex: _selectedIndex,
          onTap: (index) {
            setState(() {
              _selectedIndex = index;
            });
          },
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.history_outlined),
              activeIcon: Icon(Icons.history),
              label: 'History',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline),
              activeIcon: Icon(Icons.person),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHomeContent() {
    return FutureBuilder<List<Map<String, dynamic>>>(
      future: Future.wait([
        ApiService.getUserProfile(),
        ApiService.getUserHistory(),
      ]),
      builder: (context, snapshot) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        final textColor = isDark ? Colors.white : Colors.black;
        
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator(color: AppTheme.primaryRed));
        } else if (snapshot.hasError || !snapshot.hasData) {
          return Center(child: Text('Error loading dashboard: ${snapshot.error}', style: TextStyle(color: textColor)));
        }

        final profileData = snapshot.data![0];
        final historyData = snapshot.data![1];
        final name = profileData['name'] ?? 'Donor';
        final firstName = name.split(' ').first;
        final bloodGroup = profileData['blood_group'] ?? 'N/A';
        final donationsCount = profileData['donationsCount'] ?? 0;
        
        int daysSince = 92;
        if (profileData['last_donation_date'] != null) {
          try {
            final lastDate = DateTime.parse(profileData['last_donation_date']);
            daysSince = DateTime.now().difference(lastDate).inDays;
          } catch (e) {
            // keep default
          }
        }
        
        final List<dynamic> allDonations = historyData['donations'] ?? [];
        final recentActivity = allDonations.isNotEmpty ? allDonations.first : null;

        return SafeArea(
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 32, 24, 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Welcome back,',
                          style: TextStyle(
                            color: AppTheme.textSecondary,
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Text(
                              firstName,
                              style: TextStyle(
                                color: textColor,
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(width: 8),
                            const Icon(
                              Icons.verified,
                              color: AppTheme.primaryRed,
                              size: 20,
                            ),
                          ],
                        ),
                      ],
                    ),
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: AppTheme.primaryRed, width: 2),
                        color: Colors.grey[800],
                        image: profileData['profile_picture'] != null
                            ? DecorationImage(
                                image: NetworkImage(ApiService.getFullImageUrl(profileData['profile_picture'])),
                                fit: BoxFit.cover,
                              )
                            : DecorationImage(
                                image: NetworkImage('https://ui-avatars.com/api/?name=${Uri.encodeComponent(name)}&background=DC2626&color=fff'),
                                fit: BoxFit.cover,
                              ),
                      ),
                    ),
                  ],
                ),
              ),

              // Scrollable Content
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Eligibility Gauge Card (Glass Panel)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: isDark ? Colors.white.withOpacity(0.05) : Colors.black.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: isDark ? Colors.white.withOpacity(0.08) : Colors.black.withOpacity(0.08)),
                          boxShadow: [
                            BoxShadow(
                              color: isDark ? Colors.black.withOpacity(0.3) : Colors.black.withOpacity(0.05),
                              blurRadius: 32,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            // Top accent line equivalent
                            Container(
                              width: 60,
                              height: 4,
                              decoration: BoxDecoration(
                                color: AppTheme.primaryRed,
                                borderRadius: BorderRadius.circular(2),
                              ),
                              margin: const EdgeInsets.only(bottom: 20),
                            ),
                            Text(
                              'DONATION STATUS',
                              style: TextStyle(
                                color: isDark ? AppTheme.textSecondary : Colors.black54,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 2,
                              ),
                            ),
                            const SizedBox(height: 24),
                            
                            // Circular Progress Mockup
                            Container(
                              width: 120,
                              height: 120,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(color: AppTheme.primaryRed, width: 6),
                                boxShadow: [
                                  BoxShadow(
                                    color: AppTheme.primaryRed.withOpacity(0.3),
                                    blurRadius: 20,
                                    spreadRadius: 2,
                                  ),
                                ],
                              ),
                              child: Center(
                                child: Text(
                                  bloodGroup,
                                  style: TextStyle(
                                    color: textColor,
                                    fontSize: 36,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 24),
                            
                            const Text(
                              'ELIGIBLE TO DONATE',
                              style: TextStyle(
                                color: Color(0xFF28A745), // Green
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '$daysSince days since last donation',
                              style: TextStyle(
                                color: isDark ? AppTheme.textSecondary : Colors.black54,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      ),
                      
                      const SizedBox(height: 24),

                  // Emergency Toggle
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: isDark ? Colors.white.withOpacity(0.05) : Colors.black.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: isDark ? Colors.white.withOpacity(0.08) : Colors.black.withOpacity(0.08)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Emergency Alerts',
                                style: TextStyle(
                                  color: textColor,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 4),
                              const Text(
                                'Receive SMS/Push for nearby needs',
                                style: TextStyle(
                                  color: AppTheme.textSecondary,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Switch(
                          value: _alertsEnabled,
                          onChanged: (value) {
                            setState(() {
                              _alertsEnabled = value;
                            });
                          },
                          activeColor: Colors.white,
                          activeTrackColor: AppTheme.primaryRed,
                          inactiveThumbColor: Colors.white,
                          inactiveTrackColor: Colors.grey.shade800,
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Recent Activity
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: Text(
                      'RECENT ACTIVITY',
                      style: TextStyle(
                        color: isDark ? AppTheme.textSecondary : Colors.black54,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.5,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  // Activity Item
                  if (recentActivity == null)
                    Center(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Text('No recent activity', style: TextStyle(color: isDark ? Colors.white54 : Colors.black54)),
                      )
                    )
                  else
                    _buildActivityCard(recentActivity, isDark),
                ],
              ),
            ),
          ),
        ],
      ),
    );
      },
    );
  }    

  Widget _buildStatItem(String label, String value, bool isDark) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            color: AppTheme.primaryRed,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            color: isDark ? AppTheme.textSecondary : Colors.black54,
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildActivityCard(dynamic activity, bool isDark) {
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
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppTheme.primaryRed.withOpacity(0.2),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(
              Icons.water_drop,
              color: AppTheme.lightRed,
              size: 24,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Blood Donation',
                  style: TextStyle(
                    color: textColor,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Donated ${activity['blood_group']} blood',
                  style: TextStyle(
                    color: isDark ? AppTheme.textSecondary : Colors.black54,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: () {},
            style: TextButton.styleFrom(
              foregroundColor: AppTheme.primaryRed,
              textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
            ),
            child: const Text('CERT'),
          ),
        ],
      ),
    );
  }
}
