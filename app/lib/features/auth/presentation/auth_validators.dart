import 'package:pakhlai_mobile/l10n/app_localizations.dart';

abstract final class AuthValidators {
  static String? required(String? value, AppLocalizations strings) {
    if (value == null || value.trim().isEmpty) return strings.requiredField;
    return null;
  }

  static String? email(String? value, AppLocalizations strings) {
    final requiredError = required(value, strings);
    if (requiredError != null) return requiredError;
    final normalized = value!.trim();
    final isValid = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(normalized);
    return isValid ? null : strings.invalidEmail;
  }

  static String? optionalEmail(String? value, AppLocalizations strings) {
    if (value == null || value.trim().isEmpty) return null;
    final normalized = value.trim();
    final isValid = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(normalized);
    return isValid ? null : strings.invalidEmail;
  }

  static String? password(String? value, AppLocalizations strings) {
    final requiredError = required(value, strings);
    if (requiredError != null) return requiredError;
    return value!.length >= 8 ? null : strings.passwordLength;
  }
}
