import 'dart:convert';
import 'dart:math';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pakhlai_mobile/core/storage/secure_storage_service.dart';
import 'package:pakhlai_mobile/core/utils/json_parsing.dart';

final pendingOrderStoreProvider = Provider<PendingOrderStore>(
  (ref) => PendingOrderStore(ref.watch(secureStorageProvider)),
);

class PendingOrderStore {
  PendingOrderStore(this._storage);
  final SecureStorageService _storage;
  static const _key = 'pakhlai_pending_order';

  Future<Map<String, dynamic>?> read(int customerId) async {
    final stored = await _storage.readPrivateValue('${_key}_$customerId');
    if (stored == null) return null;
    try {
      final record = jsonMap(jsonDecode(stored));
      return record['customer_id'] == customerId
          ? jsonMap(record['request'])
          : null;
    } on FormatException {
      return null;
    }
  }

  Future<void> save(int customerId, Map<String, Object?> request) =>
      _storage.writePrivateValue(
        '${_key}_$customerId',
        jsonEncode({'customer_id': customerId, 'request': request}),
      );

  Future<void> clear(int customerId) =>
      _storage.deletePrivateValue('${_key}_$customerId');

  static String createKey() {
    final random = Random.secure();
    return List.generate(
      32,
      (_) => random.nextInt(16).toRadixString(16),
    ).join();
  }
}
