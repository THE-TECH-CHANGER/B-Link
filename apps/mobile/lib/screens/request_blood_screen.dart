import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';

class RequestBloodScreen extends StatefulWidget {
  const RequestBloodScreen({super.key});

  @override
  State<RequestBloodScreen> createState() => _RequestBloodScreenState();
}

class _RequestBloodScreenState extends State<RequestBloodScreen> {
  String? _selectedBloodGroup;
  final String _urgencyLevel = 'High';
  final TextEditingController _unitsController = TextEditingController();
  bool _isLoading = false;

  final List<String> _bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  Future<void> _submitRequest() async {
    if (_selectedBloodGroup == null || _unitsController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select blood group and units')));
      return;
    }

    setState(() => _isLoading = true);

    try {
      final response = await ApiService.broadcastEmergency(
        bloodGroup: _selectedBloodGroup!,
        unitsRequired: int.tryParse(_unitsController.text) ?? 1,
        urgencyLevel: _urgencyLevel,
        targetHospitalId: 1, // Hardcoded Apollo Hospital for demo
      );

      setState(() => _isLoading = false);

      final count = response['matched_donors_count'];
      final List donors = response['matched_donors'];

      if (!mounted) return;

      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          backgroundColor: AppTheme.background,
          title: Text('$count Nearby Donors Found!', style: const TextStyle(color: AppTheme.primaryRed)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('We instantly matched your request with nearby active donors using PostGIS geofencing:', style: TextStyle(color: Colors.white)),
              const SizedBox(height: 16),
              ...donors.take(3).map((d) => ListTile(
                leading: const Icon(Icons.person, color: Colors.white54),
                title: Text(d['name'], style: const TextStyle(color: Colors.white)),
                subtitle: Text('Distance: ${(d['distance_meters'] / 1000).toStringAsFixed(1)} km', style: const TextStyle(color: Colors.white70)),
              )),
              if (count > 3) Text('...and ${count - 3} more', style: const TextStyle(color: Colors.white54))
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryRed,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              onPressed: () {
                Navigator.pop(context); // Close dialog
                Navigator.pop(context); // Go back to dashboard
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Alerts sent to all matched donors!')),
                );
              },
              child: const Text('Send Alerts'),
            )
          ],
        ),
      );

    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Emergency Request'),
        backgroundColor: AppTheme.darkRed, // Distinct red app bar for emergencies
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Request Blood',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Fill out this form to broadcast an alert to nearby donors and blood banks.',
              style: TextStyle(fontSize: 16, color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 32),
            
            // Blood Group Selector
            const Text('Required Blood Group', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: _bloodGroups.map((bg) {
                final isSelected = _selectedBloodGroup == bg;
                return ChoiceChip(
                  label: Text(bg),
                  selected: isSelected,
                  onSelected: (selected) {
                    setState(() {
                      _selectedBloodGroup = selected ? bg : null;
                    });
                  },
                  selectedColor: AppTheme.primaryRed,
                  backgroundColor: Colors.white10,
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : Colors.white70,
                    fontWeight: FontWeight.bold,
                  ),
                );
              }).toList(),
            ),
            
            const SizedBox(height: 32),
            
            // Units Required
            const Text('Units Needed', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            TextField(
              controller: _unitsController,
              keyboardType: TextInputType.number,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(hintText: 'e.g., 2', hintStyle: TextStyle(color: Colors.white30)),
            ),
            
            const SizedBox(height: 32),
            
            // Target Hospital
            const Text('Target Hospital', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            const TextField(
              enabled: false,
              style: TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Apollo Hospital (Auto-detected)',
                hintStyle: TextStyle(color: Colors.white70),
                prefixIcon: Icon(Icons.local_hospital, color: Colors.white54),
              ),
            ),
            
            const SizedBox(height: 48),
            
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryRed,
                  foregroundColor: Colors.white,
                ),
                onPressed: _isLoading ? null : _submitRequest,
                child: _isLoading 
                    ? const CircularProgressIndicator(color: Colors.white) 
                    : const Text('Broadcast Emergency Alert'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
