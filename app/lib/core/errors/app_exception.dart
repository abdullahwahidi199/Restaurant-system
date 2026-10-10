class AppException implements Exception {
  const AppException(this.message, {this.code, this.cause, this.details});

  final String message;
  final String? code;
  final Object? cause;
  final Map<String, dynamic>? details;

  @override
  String toString() => message;
}
