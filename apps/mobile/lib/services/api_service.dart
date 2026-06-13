import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // Use 10.0.2.2 to connect to localhost from an Android Emulator
  // 192.168.1.7 is your PC's IP address on the local WiFi/Ethernet
  static const String baseUrl = 'http://192.168.1.7:5000/api';
  
  static String? _authToken;

  static void setAuthToken(String token) {
    _authToken = token;
  }

  static Future<Map<String, dynamic>> loginUser(String firebaseIdToken, String mobileNumber) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $firebaseIdToken',
      },
      body: jsonEncode({'mobile_number': mobileNumber}),
    );

    if (response.statusCode == 200) {
      setAuthToken(firebaseIdToken);
      return jsonDecode(response.body);
    } else if (response.statusCode == 404) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to login: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> registerUser({
    required String firebaseIdToken,
    required String name,
    required String mobileNumber,
    required String role,
    required String bloodGroup,
    required double latitude,
    required double longitude,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $firebaseIdToken',
      },
      body: jsonEncode({
        'name': name,
        'mobile_number': mobileNumber,
        'role': role,
        'blood_group': bloodGroup,
        'latitude': latitude,
        'longitude': longitude,
      }),
    );

    if (response.statusCode == 201) {
      setAuthToken(firebaseIdToken);
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to register: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> broadcastEmergency({
    required String bloodGroup,
    required int unitsRequired,
    required String urgencyLevel,
    required int targetHospitalId,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/requests'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_authToken',
      },
      body: jsonEncode({
        'requester_id': 1, // Hardcoded for demo, normally comes from logged in user
        'blood_group': bloodGroup,
        'units_required': unitsRequired,
        'urgency_level': urgencyLevel,
        'target_hospital_id': targetHospitalId,
      }),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to broadcast: ${response.body}');
    }
  }
}
