import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // Use 10.0.2.2 to connect to localhost from an Android Emulator
  // 192.168.1.7 is your PC's IP address on the local WiFi/Ethernet
  static const String baseUrl = 'http://192.168.1.7:5000/api';
  
  static String? _authToken;

  static int? userId; // Store internal user ID after login/registration

  static String getFullImageUrl(String path) {
    if (path.startsWith('http')) return path;
    return 'http://192.168.1.7:5000$path';
  }

  static void setAuthToken(String token) {
    _authToken = token;
  }

  static void setUserId(int id) {
    userId = id;
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
      final data = jsonDecode(response.body);
      if (data['user'] != null && data['user']['id'] != null) {
        setUserId(data['user']['id']);
      }
      return data;
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
      final data = jsonDecode(response.body);
      if (data['user'] != null && data['user']['id'] != null) {
        setUserId(data['user']['id']);
      }
      return data;
    } else {
      throw Exception('Failed to register: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> getUserProfile() async {
    final response = await http.get(
      Uri.parse('$baseUrl/users/profile'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_authToken',
      },
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to fetch profile: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> getUserHistory() async {
    final response = await http.get(
      Uri.parse('$baseUrl/users/history'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_authToken',
      },
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to fetch history: ${response.body}');
    }
  }

  static Future<void> updateUserProfile(Map<String, dynamic> data) async {
    final response = await http.put(
      Uri.parse('$baseUrl/users/profile'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_authToken',
      },
      body: jsonEncode(data),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to update profile: ${response.body}');
    }
  }

  static Future<void> updateFCMToken(String fcmToken) async {
    await http.post(
      Uri.parse('$baseUrl/users/fcm-token'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_authToken',
      },
      body: jsonEncode({'fcm_token': fcmToken}),
    );
  }

  static Future<String> uploadProfilePicture(String imagePath) async {
    var request = http.MultipartRequest('POST', Uri.parse('$baseUrl/users/profile-picture'));
    request.headers['Authorization'] = 'Bearer $_authToken';
    request.files.add(await http.MultipartFile.fromPath('profile_picture', imagePath));
    
    var streamedResponse = await request.send();
    var response = await http.Response.fromStream(streamedResponse);
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['profile_picture'];
    } else {
      throw Exception('Failed to upload image: ${response.body}');
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
        'requester_id': userId ?? 1, // Use actual userId or fallback to 1
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
