import 'package:flutter/foundation.dart';

enum AppEnvironment { development, staging, production }

abstract final class AppConfig {
  static const appName = 'Pakhlai';
  static const environmentName = String.fromEnvironment(
    'APP_ENV',
    defaultValue: kReleaseMode ? 'production' : 'development',
  );
  static const _apiBaseUrlOverride = String.fromEnvironment('API_BASE_URL');
  static const _webSocketBaseUrlOverride = String.fromEnvironment(
    'WS_BASE_URL',
  );
  static const defaultLocale = 'en';
  static const currencyCode = 'AFN';

  static String get apiBaseUrl {
    if (_apiBaseUrlOverride.trim().isNotEmpty) {
      return _withTrailingSlash(_apiBaseUrlOverride.trim());
    }
    if (isProduction) return 'https://pakhlai.com/api/';
    return 'http://$_developmentHost:8001/api/';
  }

  static String get webSocketBaseUrl {
    if (_webSocketBaseUrlOverride.trim().isNotEmpty) {
      return _withTrailingSlash(_webSocketBaseUrlOverride.trim());
    }
    if (isProduction) return 'wss://pakhlai.com/ws/';
    return 'ws://$_developmentHost:8001/ws/';
  }

  static AppEnvironment get environment => switch (environmentName) {
    'production' => AppEnvironment.production,
    'staging' => AppEnvironment.staging,
    _ => AppEnvironment.development,
  };

  static bool get isProduction => environment == AppEnvironment.production;
  static bool get isDevelopment => environment == AppEnvironment.development;

  static String get _developmentHost {
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      return '10.0.2.2';
    }

    if (kIsWeb) {
      final browserHost = Uri.base.host;
      if (browserHost.isNotEmpty && browserHost != '0.0.0.0') {
        return browserHost;
      }
    }

    return '127.0.0.1';
  }

  static String _withTrailingSlash(String value) {
    return value.endsWith('/') ? value : '$value/';
  }
}
