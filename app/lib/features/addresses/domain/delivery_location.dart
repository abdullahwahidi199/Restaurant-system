class DeliveryLocation {
  static const defaultLocation = DeliveryLocation(label: '');
  const DeliveryLocation({required this.label, this.latitude, this.longitude});

  final String label;
  final double? latitude;
  final double? longitude;
}
