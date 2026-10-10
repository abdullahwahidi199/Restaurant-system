import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pakhlai_mobile/core/config/app_config.dart';
import 'package:pakhlai_mobile/core/constants/app_constants.dart';
import 'package:pakhlai_mobile/core/api/api_endpoints.dart';
import 'package:pakhlai_mobile/core/auth/session_events.dart';
import 'package:pakhlai_mobile/core/storage/secure_storage_service.dart';
import 'package:pakhlai_mobile/core/utils/json_parsing.dart';

final dioProvider = Provider<Dio>((ref) {
  final secureStorage = ref.watch(secureStorageProvider);
  return ApiClient(
    secureStorage,
    onSessionExpired: () => ref.read(sessionExpiryProvider.notifier).expire(),
  ).dio;
});

class ApiClient {
  ApiClient(
    SecureStorageService storage, {
    required void Function() onSessionExpired,
  }) {
    dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
        connectTimeout: AppConstants.networkTimeout,
        receiveTimeout: AppConstants.networkTimeout,
        sendTimeout: AppConstants.networkTimeout,
        headers: const {'Accept': 'application/json'},
      ),
    );
    dio.interceptors.add(
      _AuthenticationInterceptor(
        dio,
        storage,
        onSessionExpired: onSessionExpired,
      ),
    );
    if (AppConfig.isDevelopment) {
      dio.interceptors.add(
        LogInterceptor(
          requestBody: false,
          responseBody: false,
          requestHeader: false,
          responseHeader: false,
          error: false,
        ),
      );
    }
  }

  late final Dio dio;
}

class _AuthenticationInterceptor extends Interceptor {
  _AuthenticationInterceptor(
    this._dio,
    this._secureStorage, {
    required this.onSessionExpired,
  });

  static const _retriedKey = 'pakhlai_auth_retried';
  final Dio _dio;
  final SecureStorageService _secureStorage;
  final void Function() onSessionExpired;
  Future<String?>? _refreshing;

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _secureStorage.readAccessToken();
    if (options.path == ApiEndpoints.customerLogin ||
        options.path == ApiEndpoints.customerSignup) {
      options.headers.remove('Authorization');
    } else if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException error, ErrorInterceptorHandler handler) async {
    final options = error.requestOptions;
    final isUnauthorized = error.response?.statusCode == 401;
    final isAuthRequest =
        options.path.contains(ApiEndpoints.customerLogin) ||
        options.path.contains(ApiEndpoints.customerTokenRefresh);
    final wasRetried = options.extra[_retriedKey] == true;
    if (!isUnauthorized || isAuthRequest) {
      handler.next(error);
      return;
    }
    if (wasRetried) {
      await _secureStorage.clearSession();
      onSessionExpired();
      handler.next(error);
      return;
    }
    String? accessToken;
    try {
      accessToken = await _refreshAccessTokenOnce();
    } on DioException catch (refreshError) {
      // A network failure must not erase a recoverable session.
      handler.next(refreshError);
      return;
    }
    if (accessToken == null) {
      await _secureStorage.clearSession();
      onSessionExpired();
      handler.next(error);
      return;
    }

    try {
      options
        ..headers['Authorization'] = 'Bearer $accessToken'
        ..extra[_retriedKey] = true;
      handler.resolve(await _dio.fetch<Object?>(options));
    } on DioException catch (retryError) {
      handler.next(retryError);
    }
  }

  Future<String?> _refreshAccessTokenOnce() {
    final active = _refreshing;
    if (active != null) return active;
    final refresh = _refreshAccessToken();
    _refreshing = refresh;
    return refresh.whenComplete(() => _refreshing = null);
  }

  Future<String?> _refreshAccessToken() async {
    final refreshToken = await _secureStorage.readRefreshToken();
    if (refreshToken == null || refreshToken.isEmpty) return null;
    final refreshClient = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
        connectTimeout: AppConstants.networkTimeout,
        receiveTimeout: AppConstants.networkTimeout,
        sendTimeout: AppConstants.networkTimeout,
        headers: const {'Accept': 'application/json'},
      ),
    );
    try {
      final response = await refreshClient.post<Object?>(
        ApiEndpoints.customerTokenRefresh,
        data: {'refresh': refreshToken},
      );
      final body = jsonMap(response.data);
      final access = jsonString(body['access']);
      if (access == null) return null;
      await _secureStorage.saveTokens(
        accessToken: access,
        refreshToken: jsonString(body['refresh']) ?? refreshToken,
      );
      return access;
    } on DioException catch (error) {
      if (error.response?.statusCode == 401 ||
          error.response?.statusCode == 400) {
        return null;
      }
      rethrow;
    } finally {
      refreshClient.close();
    }
  }
}
