import 'package:dio/dio.dart';
import 'package:pakhlai_mobile/core/api/api_exception.dart';
import 'package:pakhlai_mobile/core/api/api_endpoints.dart';
import 'package:pakhlai_mobile/core/utils/json_parsing.dart';

abstract final class ApiErrorMapper {
  static ApiException fromDio(
    DioException error, {
    String fallback = 'Something went wrong. Please try again.',
  }) {
    final status = error.response?.statusCode;
    final body = jsonMap(error.response?.data);
    final serverMessage = _messageFrom(body);
    final message = switch (error.type) {
      DioExceptionType.connectionTimeout ||
      DioExceptionType.sendTimeout ||
      DioExceptionType.receiveTimeout =>
        'Pakhlai is taking too long to respond. Please try again.',
      DioExceptionType.connectionError => 'We could not connect to Pakhlai. Check your internet connection and try again.',
      DioExceptionType.cancel => 'The request was cancelled.',
      _
          when status == 401 &&
              error.requestOptions.path == ApiEndpoints.customerLogin =>
        'The username or password is incorrect.',
      _ when status == 401 => 'Your session expired. Please sign in again.',
      _ when status != null && status >= 500 =>
        'Pakhlai is temporarily unavailable. Please try again shortly.',
      _ => serverMessage ?? fallback,
    };
    return ApiException(
      message,
      code: jsonString(body['code']) ?? status?.toString(),
      cause: error,
      details: body,
    );
  }

  static String? _messageFrom(Map<String, dynamic> body) {
    for (final key in const ['detail', 'error', 'message']) {
      final value = body[key];
      if (value is String && _safe(value)) return value;
      if (value is List &&
          value.isNotEmpty &&
          value.first is String &&
          _safe(value.first as String)) {
        return value.first as String;
      }
    }
    for (final value in body.values) {
      if (value is List && value.isNotEmpty) {
        final first = value.first;
        if (first is Map) {
          final message = _messageFrom(Map<String, dynamic>.from(first));
          if (message != null) return message;
        }
        if (first is String && _safe(first)) return first;
      }
      if (value is Map) {
        final message = _messageFrom(Map<String, dynamic>.from(value));
        if (message != null) return message;
      }
    }
    return null;
  }

  static bool _safe(String value) =>
      value.trim().isNotEmpty &&
      value.length < 500 &&
      !RegExp(
        r'DioException|SocketException|Traceback|HTTP 5\d\d|<!doctype|<html',
        caseSensitive: false,
      ).hasMatch(value);
}
