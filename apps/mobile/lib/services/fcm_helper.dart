import 'package:firebase_messaging/firebase_messaging.dart';
import 'api_service.dart';

class FCMHelper {
  static Future<void> initFCM() async {
    FirebaseMessaging messaging = FirebaseMessaging.instance;
    
    NotificationSettings settings = await messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      String? token = await messaging.getToken();
      if (token != null) {
        print('FCM Token: $token');
        try {
          await ApiService.updateFCMToken(token);
        } catch (e) {
          print('Failed to update FCM token on server: $e');
        }
      }

      FirebaseMessaging.instance.onTokenRefresh.listen((newToken) {
        try {
          ApiService.updateFCMToken(newToken);
        } catch (e) {
          print('Failed to update refreshed FCM token: $e');
        }
      });
      
      // Handle foreground messages
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        print('Got a message whilst in the foreground!');
        print('Message data: ${message.data}');

        if (message.notification != null) {
          print('Message also contained a notification: ${message.notification}');
        }
      });
    }
  }
}
