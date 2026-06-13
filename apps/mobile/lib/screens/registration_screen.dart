import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';

class RegistrationScreen extends StatefulWidget {
  final String firebaseIdToken;
  final String mobileNumber;

  const RegistrationScreen({
    super.key,
    required this.firebaseIdToken,
    required this.mobileNumber,
  });

  @override
  State<RegistrationScreen> createState() => _RegistrationScreenState();
}

class _RegistrationScreenState extends State<RegistrationScreen> {
  final TextEditingController _nameController = TextEditingController();
  String _selectedRole = 'donor';
  String _selectedBloodGroup = 'O+';
  bool _isLoading = false;

  final List<String> _bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  final List<String> _roles = ['donor', 'hospital'];

  Future<Position?> _determinePosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return Future.error('Location services are disabled.');
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return Future.error('Location permissions are denied');
      }
    }
    
    if (permission == LocationPermission.deniedForever) {
      return Future.error('Location permissions are permanently denied, we cannot request permissions.');
    } 

    return await Geolocator.getCurrentPosition();
  }

  Future<void> _completeRegistration() async {
    final name = _nameController.text.trim();
    if (name.isEmpty) return;

    setState(() => _isLoading = true);

    try {
      // 1. Get Location
      Position? position;
      try {
        position = await _determinePosition();
      } catch (e) {
        // Fallback mock location if permission denied on emulator
        position = Position(
          longitude: 77.5946,
          latitude: 12.9716, // Bangalore coordinates
          timestamp: DateTime.now(),
          accuracy: 0.0,
          altitude: 0.0,
          altitudeAccuracy: 0.0,
          heading: 0.0,
          headingAccuracy: 0.0,
          speed: 0.0,
          speedAccuracy: 0.0,
        );
      }

      // 2. Register via API
      await ApiService.registerUser(
        firebaseIdToken: widget.firebaseIdToken,
        name: name,
        mobileNumber: widget.mobileNumber,
        role: _selectedRole,
        bloodGroup: _selectedRole == 'donor' ? _selectedBloodGroup : '',
        latitude: position!.latitude,
        longitude: position!.longitude,
      );

      // 3. Navigate to Dashboard
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/dashboard');
      }
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Registration Failed: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Complete Profile')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Almost there!',
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 8),
            const Text(
              'We need a few details to set up your account.',
              style: TextStyle(fontSize: 16, color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 32),
            
            TextField(
              controller: _nameController,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                hintText: 'Full Name / Hospital Name',
                prefixIcon: Icon(Icons.person, color: Colors.white54),
              ),
            ),
            const SizedBox(height: 24),
            
            DropdownButtonFormField<String>(
              value: _selectedRole,
              dropdownColor: AppTheme.background,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.badge, color: Colors.white54),
              ),
              items: _roles.map((String role) {
                return DropdownMenuItem<String>(
                  value: role,
                  child: Text(role.toUpperCase()),
                );
              }).toList(),
              onChanged: (String? newValue) {
                setState(() {
                  _selectedRole = newValue!;
                });
              },
            ),
            const SizedBox(height: 24),
            
            if (_selectedRole == 'donor')
              DropdownButtonFormField<String>(
                value: _selectedBloodGroup,
                dropdownColor: AppTheme.background,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(
                  prefixIcon: Icon(Icons.water_drop, color: AppTheme.primaryRed),
                ),
                items: _bloodGroups.map((String bg) {
                  return DropdownMenuItem<String>(
                    value: bg,
                    child: Text(bg),
                  );
                }).toList(),
                onChanged: (String? newValue) {
                  setState(() {
                    _selectedBloodGroup = newValue!;
                  });
                },
              ),
              
            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _completeRegistration,
                child: _isLoading 
                    ? const CircularProgressIndicator(color: Colors.black) 
                    : const Text('Complete Registration & Get Location'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
