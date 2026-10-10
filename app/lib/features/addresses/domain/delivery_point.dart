/// A customer-confirmed delivery pin, independent of the map provider.
class DeliveryPoint {
  const DeliveryPoint(this.latitude, this.longitude, {this.accuracyMeters});

  final double latitude;
  final double longitude;
  final double? accuracyMeters;

  bool get isValid =>
      latitude.isFinite &&
      longitude.isFinite &&
      latitude.abs() <= 90 &&
      longitude.abs() <= 180;

  static DeliveryPoint? parse(String input) {
    String decoded;
    try {
      decoded = Uri.decodeComponent(input.trim());
    } on FormatException {
      return null;
    } on ArgumentError {
      return null;
    }
    final coordinatePair = RegExp(r'(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)');
    final match = coordinatePair.firstMatch(decoded);
    if (match == null) return null;
    final point = DeliveryPoint(
      double.parse(match[1]!),
      double.parse(match[2]!),
    );
    return point.isValid ? point : null;
  }
}
