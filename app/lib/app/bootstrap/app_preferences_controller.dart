import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pakhlai_mobile/core/config/app_config.dart';
import 'package:pakhlai_mobile/core/storage/preferences_service.dart';

final themeModeProvider = NotifierProvider<ThemeModeController, ThemeMode>(
  ThemeModeController.new,
);

class ThemeModeController extends Notifier<ThemeMode> {
  @override
  ThemeMode build() => ThemeMode.light;

  void restore(String? value) {
    // Pakhlai intentionally uses one consistent light appearance, regardless
    // of a previously saved preference or the device's system theme.
    state = ThemeMode.light;
  }

  Future<void> setMode(ThemeMode mode) async {
    state = ThemeMode.light;
    final preferences = await PreferencesService.create();
    await preferences.saveThemeMode(ThemeMode.light.name);
  }
}

final localeProvider = NotifierProvider<LocaleController, Locale>(
  LocaleController.new,
);

class LocaleController extends Notifier<Locale> {
  @override
  Locale build() => const Locale(AppConfig.defaultLocale);

  void restore(String? code) {
    state = Locale(code ?? AppConfig.defaultLocale);
  }

  Future<void> setLocale(Locale locale) async {
    state = locale;
    final preferences = await PreferencesService.create();
    await preferences.saveLocale(locale.languageCode);
  }
}
