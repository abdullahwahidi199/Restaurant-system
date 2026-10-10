import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pakhlai_mobile/core/storage/preferences_service.dart';
import 'package:pakhlai_mobile/core/storage/secure_storage_service.dart';
import 'package:pakhlai_mobile/features/cart/domain/cart_models.dart';

final cartRepositoryProvider = Provider<CartRepository>(
  (ref) => SecureCartRepository(ref.watch(secureStorageProvider)),
);

abstract interface class CartRepository {
  Future<Cart> restore();
  Future<void> save(Cart cart);
  Future<void> clear();
}

class SecureCartRepository implements CartRepository {
  SecureCartRepository(this._storage);
  final SecureStorageService _storage;
  static const _key = 'pakhlai_private_cart';

  @override
  Future<Cart> restore() async {
    // Migrate existing carts without leaving notes in plaintext preferences.
    final legacy = await PreferencesService.create();
    final stored = await _storage.readPrivateValue(_key) ?? legacy.cartJson;
    if (stored == null) return Cart.empty();
    try {
      final cart = Cart.decode(stored);
      await save(cart);
      await legacy.clearCart();
      return cart;
    } on FormatException {
      await clear();
      await legacy.clearCart();
      return Cart.empty();
    }
  }

  @override
  Future<void> save(Cart cart) =>
      _storage.writePrivateValue(_key, cart.encode());
  @override
  Future<void> clear() => _storage.deletePrivateValue(_key);
}
