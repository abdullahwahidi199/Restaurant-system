import 'package:pakhlai_mobile/core/errors/app_exception.dart';

class ApiException extends AppException {
  const ApiException(super.message, {super.code, super.cause, super.details});
}
