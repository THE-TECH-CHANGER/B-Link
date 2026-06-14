import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../main.dart'; // To access themeNotifier

class EditProfileScreen extends StatefulWidget {
  final Map<String, dynamic> initialProfile;

  const EditProfileScreen({super.key, required this.initialProfile});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  late TextEditingController _nameController;
  late bool _notificationsEnabled;
  bool _isLoading = false;
  File? _selectedImage;
  String? _currentProfilePicPath;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.initialProfile['name'] ?? '');
    _notificationsEnabled = widget.initialProfile['is_available'] ?? true;
    _currentProfilePicPath = widget.initialProfile['profile_picture'];
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() {
        _selectedImage = File(pickedFile.path);
      });
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _saveChanges() async {
    setState(() => _isLoading = true);
    try {
      if (_selectedImage != null) {
        await ApiService.uploadProfilePicture(_selectedImage!.path);
      }
      
      await ApiService.updateUserProfile({
        'name': _nameController.text.trim(),
        'is_available': _notificationsEnabled,
      });
      if (mounted) {
        Navigator.pop(context, true); // Return true to indicate success
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
        title: const Text('Edit Profile'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Profile Picture
            Stack(
              children: [
                GestureDetector(
                  onTap: _pickImage,
                  child: Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: AppTheme.primaryRed, width: 3),
                      color: Colors.grey[800],
                      image: _selectedImage != null
                          ? DecorationImage(
                              image: FileImage(_selectedImage!),
                              fit: BoxFit.cover,
                            )
                          : _currentProfilePicPath != null
                              ? DecorationImage(
                                  image: NetworkImage(ApiService.getFullImageUrl(_currentProfilePicPath!)),
                                  fit: BoxFit.cover,
                                )
                              : DecorationImage(
                                  image: NetworkImage('https://ui-avatars.com/api/?name=${Uri.encodeComponent(_nameController.text.isNotEmpty ? _nameController.text : 'User')}&background=DC2626&color=fff&size=200'),
                                  fit: BoxFit.cover,
                                ),
                    ),
                  ),
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: GestureDetector(
                    onTap: _pickImage,
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: const BoxDecoration(
                        color: AppTheme.primaryRed,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.camera_alt, color: Colors.white, size: 20),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),
            
            // Name Field
            TextField(
              controller: _nameController,
              onChanged: (val) => setState(() {}), // To update avatar dynamically
              decoration: const InputDecoration(
                labelText: 'Full Name',
                prefixIcon: Icon(Icons.person_outline),
              ),
            ),

            const SizedBox(height: 48),
            
            // Save Button
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
