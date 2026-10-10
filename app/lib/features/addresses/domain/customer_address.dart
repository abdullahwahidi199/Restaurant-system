import 'package:pakhlai_mobile/core/utils/json_parsing.dart';

class CustomerAddress {
  const CustomerAddress({
    required this.id,
    required this.label,
    required this.addressLine,
    required this.isDefault,
    this.area,
    this.city,
    this.instructions,
    this.latitude,
    this.longitude,
  });

  final int id;
  final String label;
  final String addressLine;
  final String? area;
  final String? city;
  final String? instructions;
  final double? latitude;
  final double? longitude;
  final bool isDefault;

  bool get hasLocation =>
      latitude != null &&
      longitude != null &&
      latitude!.isFinite &&
      longitude!.isFinite &&
      latitude! >= -90 &&
      latitude! <= 90 &&
      longitude! >= -180 &&
      longitude! <= 180;
  CustomerAddress copyWith({bool? isDefault}) => CustomerAddress(
    id: id,
    label: label,
    addressLine: addressLine,
    isDefault: isDefault ?? this.isDefault,
    area: area,
    city: city,
    instructions: instructions,
    latitude: latitude,
    longitude: longitude,
  );
  String get formattedAddress => [
    addressLine,
    ?area,
    ?city,
  ].where((value) => value.trim().isNotEmpty).join(', ');

  factory CustomerAddress.fromJson(Map<String, dynamic> json) {
    return CustomerAddress(
      id: jsonInt(json['id']) ?? 0,
      label: jsonString(json['label']) ?? 'Address',
      addressLine: jsonString(json['address_line']) ?? '',
      area: jsonString(json['area']),
      city: jsonString(json['city']),
      instructions: jsonString(json['instructions']),
      latitude: jsonDouble(json['latitude']),
      longitude: jsonDouble(json['longitude']),
      isDefault: jsonBool(json['is_default']) ?? false,
    );
  }
}

class CustomerAddressDraft {
  const CustomerAddressDraft({
    required this.label,
    required this.addressLine,
    this.area = '',
    this.city = '',
    this.instructions = '',
    this.latitude,
    this.longitude,
    this.isDefault = false,
  });

  final String label;
  final String addressLine;
  final String area;
  final String city;
  final String instructions;
  final double? latitude;
  final double? longitude;
  final bool isDefault;

  Map<String, Object?> toJson() => {
    'label': label.trim(),
    'address_line': addressLine.trim(),
    'area': area.trim(),
    'city': city.trim(),
    'instructions': instructions.trim(),
    'latitude': latitude,
    'longitude': longitude,
    'is_default': isDefault,
  };
}
