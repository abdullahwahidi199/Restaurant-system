import 'package:pakhlai_mobile/core/utils/json_parsing.dart';

class CustomerProfile {
  const CustomerProfile({
    required this.id,
    required this.username,
    required this.ordersCount,
    this.email,
    this.phone,
    this.address,
    this.dateOfBirth,
    this.joinedAt,
  });

  final int id;
  final String username;
  final String? email;
  final String? phone;
  final String? address;
  final DateTime? dateOfBirth;
  final DateTime? joinedAt;
  final int ordersCount;

  factory CustomerProfile.fromJson(Map<String, dynamic> json) {
    return CustomerProfile(
      id: jsonInt(json['id']) ?? 0,
      username: jsonString(json['username']) ?? '',
      email: jsonString(json['email']),
      phone: jsonString(json['phone']),
      address: jsonString(json['address']),
      dateOfBirth: DateTime.tryParse(jsonString(json['date_of_birth']) ?? ''),
      joinedAt: DateTime.tryParse(jsonString(json['joined_at']) ?? ''),
      ordersCount: jsonInt(json['orders_count']) ?? 0,
    );
  }
}
