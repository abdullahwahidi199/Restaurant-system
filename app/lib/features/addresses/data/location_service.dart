import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:pakhlai_mobile/core/errors/app_exception.dart';
import 'package:pakhlai_mobile/features/addresses/domain/delivery_point.dart';

final locationServiceProvider = Provider<LocationService>(
  (ref) => const DeviceLocationService(),
);

abstract interface class LocationService {
  Future<DeliveryPoint> currentLocation();
}

class DeviceLocationService implements LocationService {
  const DeviceLocationService();

  @override
  Future<DeliveryPoint> currentLocation() async {
    try {
      if (kIsWeb &&
          Uri.base.scheme != 'https' &&
          !const {'localhost', '127.0.0.1', '::1'}.contains(Uri.base.host)) {
        throw const AppException(
          'Use a secure connection or choose a point on the map.',
          code: 'location_insecure',
        );
      }
      if (!await Geolocator.isLocationServiceEnabled()) {
        throw const AppException(
          'Turn on location services or choose a point on the map.',
          code: 'location_disabled',
        );
      }
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        throw const AppException(
          'Location access is disabled. Allow it in settings or choose a point on the map.',
          code: 'location_permission',
        );
      }
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 18),
        ),
      );
      final point = DeliveryPoint(
        position.latitude,
        position.longitude,
        accuracyMeters: position.accuracy,
      );
      if (!point.isValid) {
        throw const AppException(
          'Your location is unavailable. Choose a point on the map.',
          code: 'location_unavailable',
        );
      }
      return point;
    } on AppException {
      rethrow;
    } on TimeoutException {
      throw const AppException(
        'Finding your location took too long. Try again or use the map.',
        code: 'location_timeout',
      );
    } on PermissionDeniedException {
      throw const AppException(
        'Allow location access or choose a point on the map.',
        code: 'location_permission',
      );
    } on LocationServiceDisabledException {
      throw const AppException(
        'Turn on location services or use the map.',
        code: 'location_disabled',
      );
    } catch (_) {
      throw const AppException(
        'Your location is unavailable. Try again or choose a point on the map.',
        code: 'location_unavailable',
      );
    }
  }
}
