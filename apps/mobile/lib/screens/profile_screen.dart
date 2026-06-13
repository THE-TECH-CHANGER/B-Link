import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('My Profile', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: AppTheme.background,
        elevation: 0,
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {},
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // Avatar & Name
            Center(
              child: Column(
                children: [
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: AppTheme.primaryRed, width: 3),
                      image: const DecorationImage(
                        image: NetworkImage('https://ui-avatars.com/api/?name=John+Doe&background=DC2626&color=fff&size=200'),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'John Doe',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    '+91 98765 43210',
                    style: TextStyle(
                      fontSize: 16,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 32),

            // Blood Group & Role Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withOpacity(0.08)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildStatColumn('Blood Group', 'O+'),
                  Container(width: 1, height: 40, color: Colors.white24),
                  _buildStatColumn('Role', 'Donor'),
                  Container(width: 1, height: 40, color: Colors.white24),
                  _buildStatColumn('Donations', '2'),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // Settings Options
            _buildProfileOption(Icons.person_outline, 'Edit Profile'),
            _buildProfileOption(Icons.notifications_outlined, 'Notification Preferences'),
            _buildProfileOption(Icons.health_and_safety_outlined, 'Medical History'),
            _buildProfileOption(Icons.location_on_outlined, 'Saved Locations'),
            
            const SizedBox(height: 24),
            
            // Logout Button
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () {
                  Navigator.pushReplacementNamed(context, '/login');
                },
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppTheme.primaryRed),
                  foregroundColor: AppTheme.primaryRed,
                ),
                child: const Text('Log Out'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatColumn(String label, String value) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(
            color: AppTheme.textSecondary,
            fontSize: 12,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            color: AppTheme.primaryRed,
            fontSize: 24,
            fontWeight: FontWeight.w900,
          ),
        ),
      ],
    );
  }

  Widget _buildProfileOption(IconData icon, String title) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: Colors.white, size: 20),
      ),
      title: Text(
        title,
        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500),
      ),
      trailing: const Icon(Icons.chevron_right, color: Colors.white54),
      onTap: () {},
    );
  }
}
