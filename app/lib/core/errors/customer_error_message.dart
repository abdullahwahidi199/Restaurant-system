import 'package:pakhlai_mobile/core/errors/app_exception.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';

String customerErrorMessage(Object error, AppLocalizations s) {
  if (error is! AppException) return s.actionFailed;
  if (error.code == '401') return s.sessionExpired;
  return error.message;
}
