import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pakhlai_mobile/core/api/api_client.dart';
import 'package:pakhlai_mobile/core/api/api_endpoints.dart';
import 'package:pakhlai_mobile/core/api/api_error_mapper.dart';
import 'package:pakhlai_mobile/core/errors/app_exception.dart';
import 'package:pakhlai_mobile/core/storage/secure_storage_service.dart';
import 'package:pakhlai_mobile/core/utils/json_parsing.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return DioAuthRepository(
    ref.watch(dioProvider),
    ref.watch(secureStorageProvider),
  );
});

abstract interface class AuthRepository {
  Future<void> login({required String username, required String password});

  Future<void> register({
    required String username,
    required String password,
    required String phone,
    required String address,
    required String dateOfBirth,
    String email = '',
  });

  Future<void> signOut();
}

class DioAuthRepository implements AuthRepository {
  DioAuthRepository(this._dio, this._secureStorage);

  final Dio _dio;
  final SecureStorageService _secureStorage;

  @override
  Future<void> login({
    required String username,
    required String password,
  }) async {
    try {
      final response = await _dio.post<Object?>(
        ApiEndpoints.customerLogin,
        data: {'username': username.trim(), 'password': password},
      );
      final body = jsonMap(response.data);
      final access = jsonString(body['access']);
      final refresh = jsonString(body['refresh']);
      if (access == null) {
        throw const AppException(
          'We could not complete sign-in. Please try again.',
        );
      }
      await _secureStorage.saveTokens(
        accessToken: access,
        refreshToken: refresh,
      );
    } on DioException catch (error) {
      throw ApiErrorMapper.fromDio(error, fallback: 'Unable to sign in.');
    }
  }

  @override
  Future<void> register({
    required String username,
    required String password,
    required String phone,
    required String address,
    required String dateOfBirth,
    String email = '',
  }) async {
    try {
      await _dio.post<Object?>(
        ApiEndpoints.customerSignup,
        data: {
          'username': username.trim(),
          'password': password,
          'email': email.trim(),
          'phone': phone.trim(),
          'address': address.trim(),
          'date_of_birth': dateOfBirth,
        },
      );
    } on DioException catch (error) {
      throw ApiErrorMapper.fromDio(
        error,
        fallback: 'Unable to create the account.',
      );
    }
  }

  @override
  Future<void> signOut() => _secureStorage.clearSession();
}
