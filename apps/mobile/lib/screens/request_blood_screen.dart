import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
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

    if (FirebaseAuth.instance.currentUser == null) {
      _showGuestOtpDialog();
    } else {
      _executeApiRequest();
    }
  }

  Future<void> _executeApiRequest() async {
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
        builder: (context) {
          final isDark = Theme.of(context).brightness == Brightness.dark;
          final textColor = isDark ? Colors.white : Colors.black;
          final subtitleColor = isDark ? Colors.white70 : Colors.black87;

          return AlertDialog(
            backgroundColor: Theme.of(context).scaffoldBackgroundColor,
            title: Text('$count Nearby Donors Found!', style: const TextStyle(color: AppTheme.primaryRed)),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('We instantly matched your request with nearby active donors using PostGIS geofencing:', style: TextStyle(color: textColor)),
                const SizedBox(height: 16),
                ...donors.take(3).map((d) => ListTile(
                  leading: Icon(Icons.person, color: isDark ? Colors.white54 : Colors.black54),
                  title: Text(d['name'], style: TextStyle(color: textColor)),
                  subtitle: Text('Distance: ${(d['distance_meters'] / 1000).toStringAsFixed(1)} km', style: TextStyle(color: subtitleColor)),
                )),
                if (count > 3) Text('...and ${count - 3} more', style: TextStyle(color: isDark ? Colors.white54 : Colors.black54))
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: Text('Cancel', style: TextStyle(color: isDark ? Colors.white54 : Colors.black54)),
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
        );
        },
      );

    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  void _showGuestOtpDialog() {
    final phoneController = TextEditingController();
    final otpController = TextEditingController();
    String? verificationId;
    bool codeSent = false;
    bool verifying = false;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            final isDark = Theme.of(context).brightness == Brightness.dark;
            final textColor = isDark ? Colors.white : Colors.black;

            Future<void> sendOtp() async {
              final phone = phoneController.text.trim();
              if (phone.length < 10) return;
              setDialogState(() => verifying = true);
              
              await FirebaseAuth.instance.verifyPhoneNumber(
                phoneNumber: '+91$phone',
                verificationCompleted: (PhoneAuthCredential credential) {},
                verificationFailed: (FirebaseAuthException e) {
                  setDialogState(() => verifying = false);
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message ?? 'Verification failed')));
                },
                codeSent: (String vid, int? resendToken) {
                  setDialogState(() {
                    verificationId = vid;
                    codeSent = true;
                    verifying = false;
                  });
                },
                codeAutoRetrievalTimeout: (String vid) {},
              );
            }

            return AlertDialog(
              backgroundColor: Theme.of(context).scaffoldBackgroundColor,
              title: Text('Verify Phone Number', style: TextStyle(color: textColor, fontWeight: FontWeight.bold)),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('We need to verify your number to prevent fraudulent requests.', style: TextStyle(color: isDark ? Colors.white70 : Colors.black87)),
                  const SizedBox(height: 16),
                  if (!codeSent) ...[
                    TextField(
                      controller: phoneController,
                      decoration: const InputDecoration(labelText: 'Mobile Number', prefixText: '+91 '),
                      keyboardType: TextInputType.phone,
                      style: TextStyle(color: textColor),
                    ),
                  ] else ...[
                    TextField(
                      controller: otpController,
                      decoration: const InputDecoration(labelText: 'Enter 6-digit OTP'),
                      keyboardType: TextInputType.number,
                      style: TextStyle(color: textColor),
                    ),
                  ],
                ],
              ),
              actions: [
                if (codeSent)
                  TextButton(
                    onPressed: verifying ? null : sendOtp,
                    child: Text('Resend OTP', style: TextStyle(color: AppTheme.textSecondary)),
                  ),
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text('Cancel', style: TextStyle(color: AppTheme.textSecondary)),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryRed, foregroundColor: Colors.white),
                  onPressed: verifying ? null : () async {
                    if (!codeSent) {
                      await sendOtp();
                    } else {
                      final otp = otpController.text.trim();
                      if (otp.length < 6 || verificationId == null) return;
                      setDialogState(() => verifying = true);

                      try {
                        PhoneAuthCredential credential = PhoneAuthProvider.credential(
                          verificationId: verificationId!,
                          smsCode: otp,
                        );
                        final userCred = await FirebaseAuth.instance.signInWithCredential(credential);
                        final idToken = await userCred.user?.getIdToken();

                        if (idToken != null) {
                          final phone = phoneController.text.trim();
                          final loginRes = await ApiService.loginUser(idToken, phone);
                          
                          if (loginRes['requires_registration'] == true) {
                            // Quick guest registration
                            await ApiService.registerUser(
                              firebaseIdToken: idToken,
                              mobileNumber: phone,
                              name: 'Guest Requester',
                              role: 'patient',
                              bloodGroup: _selectedBloodGroup!,
                              latitude: 12.9716, // Default for MVP
                              longitude: 77.5946,
                            );
                          }
                          
                          if (context.mounted) Navigator.pop(context); // Close OTP Dialog
                          _executeApiRequest(); // Finally execute the request!
                        }
                      } catch (e) {
                        setDialogState(() => verifying = false);
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Invalid OTP or Error: $e')));
                      }
                    }
                  },
                  child: Text(verifying ? 'Please wait...' : (!codeSent ? 'Send OTP' : 'Verify & Broadcast')),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? Colors.white : Colors.black;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Emergency Request'),
        backgroundColor: AppTheme.primaryRed, // Distinct red app bar for emergencies
        foregroundColor: Colors.white,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Request Blood',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: textColor,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Fill out this form to broadcast an alert to nearby donors and blood banks.',
              style: TextStyle(fontSize: 16, color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 32),
            
            // Blood Group Selector
            Text('Required Blood Group', style: TextStyle(color: textColor, fontWeight: FontWeight.bold)),
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
                  backgroundColor: isDark ? Colors.white10 : Colors.black.withOpacity(0.05),
                  labelStyle: TextStyle(
                    color: isSelected 
                        ? Colors.white 
                        : (isDark ? Colors.white70 : Colors.black87),
                    fontWeight: FontWeight.bold,
                  ),
                );
              }).toList(),
            ),
            
            const SizedBox(height: 32),
            
            // Units Required
            Text('Units Needed', style: TextStyle(color: textColor, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            TextField(
              controller: _unitsController,
              keyboardType: TextInputType.number,
              style: TextStyle(color: textColor),
              decoration: InputDecoration(
                hintText: 'e.g., 2', 
                hintStyle: TextStyle(color: isDark ? Colors.white30 : Colors.black38)
              ),
            ),
            
            const SizedBox(height: 32),
            
            // Target Hospital
            Text('Target Hospital', style: TextStyle(color: textColor, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            TextField(
              enabled: false,
              style: TextStyle(color: textColor),
              decoration: InputDecoration(
                hintText: 'Apollo Hospital (Auto-detected)',
                hintStyle: TextStyle(color: isDark ? Colors.white70 : Colors.black54),
                prefixIcon: Icon(Icons.local_hospital, color: isDark ? Colors.white54 : Colors.black54),
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
