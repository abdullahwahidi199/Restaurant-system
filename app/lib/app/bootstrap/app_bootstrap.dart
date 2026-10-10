import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pakhlai_mobile/app/bootstrap/app_preferences_controller.dart';
import 'package:pakhlai_mobile/core/storage/preferences_service.dart';
import 'package:pakhlai_mobile/core/storage/secure_storage_service.dart';
import 'package:pakhlai_mobile/features/auth/application/auth_controller.dart';
import 'package:pakhlai_mobile/features/customers/data/customer_repository.dart';
import 'package:pakhlai_mobile/core/errors/app_exception.dart';

final appBootstrapProvider = FutureProvider<void>((ref) async {
  final results = await Future.wait([
    PreferencesService.create(),
    ref.read(secureStorageProvider).readAccessToken(),
  ]);
  final preferences = results[0] as PreferencesService;
  final accessToken = results[1] as String?;

  ref.read(themeModeProvider.notifier).restore(preferences.themeMode);
  ref.read(localeProvider.notifier).restore(preferences.localeCode);
  ref
      .read(authControllerProvider.notifier)
      .restore(hasSession: accessToken?.isNotEmpty ?? false);
  if (accessToken?.isNotEmpty ?? false) {
    try {
      await ref.read(customerRepositoryProvider).getProfile();
    } on AppException catch (error) {
      if (error.code == '401' || error.code == '403') {
        await ref.read(authControllerProvider.notifier).signOut();
      }
      // Offline customers can still browse and keep their cart.
    }
  }
});
