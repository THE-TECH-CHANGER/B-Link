import 'package:flutter/material.dart';

class LandingScreen extends StatelessWidget {
  const LandingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              // Header
              Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: const BoxDecoration(
                      color: Color(0xFF991B1B), // darkRed
                      shape: BoxShape.circle,
                    ),
                    child: const Center(
                      child: Text('🩸', style: TextStyle(fontSize: 20)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    'BloodLink',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      letterSpacing: -0.5,
                    ),
                  ),
                ],
              ),
              
              const Spacer(),
              
              // Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0x1AEF4444),
                  border: Border.all(color: const Color(0x4DEF4444)),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: Color(0xFFEF4444),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'Live Emergency Network',
                      style: TextStyle(
                        color: Color(0xFFF87171),
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              
              // Title
              RichText(
                text: const TextSpan(
                  style: TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    height: 1.2,
                  ),
                  children: [
                    TextSpan(text: "Don't lose time finding\n"),
                    TextSpan(
                      text: "blood in an emergency.",
                      style: TextStyle(color: Color(0xFFEF4444)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              
              // Subtitle
              const Text(
                'Connecting hospitals, blood banks, and nearby donors instantly.',
                style: TextStyle(
                  fontSize: 18,
                  color: Color(0xFFA3A3A3),
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 48),
              
              // Action Buttons
              ElevatedButton(
                onPressed: () {
                  Navigator.pushNamed(context, '/request');
                },
                child: const Text('Request Blood Now'),
              ),
              const SizedBox(height: 16),
              OutlinedButton(
                onPressed: () {
                  Navigator.pushNamed(context, '/login');
                },
                child: const Text('Login / Register'),
              ),
              
              const Spacer(),
              
              // Footer
              const Center(
                child: Padding(
                  padding: EdgeInsets.only(bottom: 24.0),
                  child: Text(
                    'Synchronized with Web Platform',
                    style: TextStyle(
                      color: Color(0xFF525252),
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
