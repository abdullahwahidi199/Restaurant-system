import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pakhlai_mobile/app/bootstrap/app_preferences_controller.dart';
import 'package:pakhlai_mobile/app/router/app_router.dart';
import 'package:pakhlai_mobile/core/config/app_config.dart';
import 'package:pakhlai_mobile/core/theme/app_theme.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';

class PakhlaiApp extends ConsumerWidget {
  const PakhlaiApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    final locale = ref.watch(localeProvider);
    return MaterialApp.router(
      title: AppConfig.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      themeMode: ThemeMode.light,
      locale: locale,
      supportedLocales: AppLocalizations.supportedLocales,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      routerConfig: router,
    );
  }
}
