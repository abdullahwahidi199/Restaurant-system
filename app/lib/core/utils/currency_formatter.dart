import 'package:intl/intl.dart';
import 'package:pakhlai_mobile/core/config/app_config.dart';

abstract final class CurrencyFormatter {
  static final _formatter = NumberFormat.currency(
    locale: 'en',
    name: AppConfig.currencyCode,
    symbol: 'AFN ',
    decimalDigits: 0,
  );

  static String format(num value) => _formatter.format(value);
}
