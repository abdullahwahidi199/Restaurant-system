import 'package:shared_preferences/shared_preferences.dart';
import 'package:pakhlai_mobile/core/constants/app_constants.dart';

class PreferencesService {
  const PreferencesService(this._preferences);

  final SharedPreferences _preferences;

  static Future<PreferencesService> create() async =>
      PreferencesService(await SharedPreferences.getInstance());

  String? get localeCode => _preferences.getString(AppConstants.localeKey);
  String? get themeMode => _preferences.getString(AppConstants.themeModeKey);
  String? get cartJson => _preferences.getString(AppConstants.cartKey);
  List<String> get recentSearches =>
      _preferences.getStringList(AppConstants.recentSearchesKey) ?? const [];

  Future<bool> saveLocale(String code) =>
      _preferences.setString(AppConstants.localeKey, code);

  Future<bool> saveThemeMode(String mode) =>
      _preferences.setString(AppConstants.themeModeKey, mode);

  Future<bool> saveCart(String json) =>
      _preferences.setString(AppConstants.cartKey, json);

  Future<bool> clearCart() => _preferences.remove(AppConstants.cartKey);

  Future<bool> saveRecentSearches(List<String> searches) =>
      _preferences.setStringList(AppConstants.recentSearchesKey, searches);
}
