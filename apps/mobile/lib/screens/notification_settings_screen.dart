import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';

class NotificationSettingsScreen extends StatefulWidget {
  final Map<String, dynamic> initialProfile;

  const NotificationSettingsScreen({super.key, required this.initialProfile});

  @override
  State<NotificationSettingsScreen> createState() => _NotificationSettingsScreenState();
}

class _NotificationSettingsScreenState extends State<NotificationSettingsScreen> {
  late bool _notificationsEnabled;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _notificationsEnabled = widget.initialProfile['is_available'] ?? true;
  }

  Future<void> _saveChanges() async {
    setState(() => _isLoading = true);
    try {
      await ApiService.updateUserProfile({
        'is_available': _notificationsEnabled,
      });
      if (mounted) {
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save: $e'), backgroundColor: AppTheme.primaryRed),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notification Preferences'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: Theme.of(context).inputDecorationTheme.fillColor,
                borderRadius: BorderRadius.circular(16),
              ),
              child: SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Emergency Notifications', style: TextStyle(fontWeight: FontWeight.w500)),
                subtitle: const Text('Receive alerts for nearby blood matches', style: TextStyle(fontSize: 12)),
                secondary: Icon(
                  _notificationsEnabled ? Icons.notifications_active : Icons.notifications_off,
                  color: _notificationsEnabled ? AppTheme.primaryRed : Colors.grey,
                ),
                value: _notificationsEnabled,
                activeColor: AppTheme.primaryRed,
                onChanged: (val) => setState(() => _notificationsEnabled = val),
              ),
            ),
            const Spacer(),
            _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryRed))
                : ElevatedButton(
                    onPressed: _saveChanges,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryRed,
                      foregroundColor: Colors.white,
                    ),
                    child: const Text('Save Changes'),
                  ),
          ],
        ),
      ),
    );
  }
}
