import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pakhlai_mobile/core/storage/preferences_service.dart';

final recentSearchesProvider =
    AsyncNotifierProvider<RecentSearchesController, List<String>>(
      RecentSearchesController.new,
    );

class RecentSearchesController extends AsyncNotifier<List<String>> {
  late final PreferencesService _preferences;

  @override
  Future<List<String>> build() async {
    _preferences = await PreferencesService.create();
    return _preferences.recentSearches;
  }

  Future<void> add(String query) async {
    final normalized = query.trim();
    if (normalized.isEmpty) return;
    final current = state.value ?? const <String>[];
    final updated = [
      normalized,
      ...current.where(
        (item) => item.toLowerCase() != normalized.toLowerCase(),
      ),
    ].take(6).toList();
    state = AsyncData(updated);
    await _preferences.saveRecentSearches(updated);
  }

  Future<void> clear() async {
    state = const AsyncData([]);
    await _preferences.saveRecentSearches(const []);
  }
}
