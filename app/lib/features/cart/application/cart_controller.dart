import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pakhlai_mobile/features/cart/data/cart_repository.dart';
import 'package:pakhlai_mobile/features/marketplace/data/marketplace_repository.dart';
import 'package:pakhlai_mobile/core/errors/app_exception.dart';
import 'package:pakhlai_mobile/features/cart/domain/cart_models.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/menu_models.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/restaurant_models.dart';

final cartControllerProvider = AsyncNotifierProvider<CartController, Cart>(
  CartController.new,
);

class CartController extends AsyncNotifier<Cart> {
  CartRepository get _repository => ref.read(cartRepositoryProvider);
  Future<CartReview>? _reviewing;

  @override
  Future<Cart> build() async {
    return ref.watch(cartRepositoryProvider).restore();
  }

  Future<void> addItem({
    required MarketplaceItem item,
    required Restaurant restaurant,
    required RestaurantBranch branch,
    int quantity = 1,
    String? note,
    bool replaceIncompatible = false,
  }) async {
    if (quantity <= 0 || quantity > 99 || !item.isAvailable || !branch.canOrder) {
      return;
    }
    if (item.branchId != null && item.branchId != branch.id) return;
    final current = state.value ?? Cart.empty();
    if (!current.isCompatible(restaurant, branch)) {
      if (!replaceIncompatible) return;
      final replacement = Cart.withItem(
        item: item,
        restaurant: restaurant,
        branch: branch,
        quantity: quantity,
        note: note,
      );
      await _setCart(replacement);
      return;
    }
    if (current.isEmpty) {
      await _setCart(
        Cart.withItem(
          item: item,
          restaurant: restaurant,
          branch: branch,
          quantity: quantity,
          note: note,
        ),
      );
      return;
    }

    final items = [...current.items];
    final index = items.indexWhere((entry) => entry.key == item.cartKey);
    if (index == -1) {
      items.add(
        CartItem(
          itemId: item.id,
          itemType: item.type,
          name: item.name,
          unitPrice: item.price,
          quantity: quantity,
          imageUrl: item.imageUrl,
          note: note?.trim().isEmpty ?? true ? null : note!.trim(),
        ),
      );
    } else {
      final existing = items[index];
      items[index] = existing.copyWith(
        quantity: (existing.quantity + quantity).clamp(1, 99),
        note: note?.trim().isEmpty ?? true ? null : note!.trim(),
      );
    }
    await _setCart(current.copyWith(items: items));
  }

  Future<void> setQuantity(String itemKey, int quantity) async {
    if (quantity > 99) return;
    final current = state.value ?? Cart.empty();
    if (quantity <= 0) {
      await removeItem(itemKey);
      return;
    }
    final items = [
      for (final item in current.items)
        if (item.key == itemKey) item.copyWith(quantity: quantity) else item,
    ];
    await _setCart(current.copyWith(items: items));
  }

  Future<void> updateItemNote(String itemKey, String? note) async {
    final current = state.value ?? Cart.empty();
    final normalized = note?.trim();
    final items = [
      for (final item in current.items)
        if (item.key == itemKey)
          item.copyWith(
            note: normalized,
            clearNote: normalized == null || normalized.isEmpty,
          )
        else
          item,
    ];
    await _setCart(current.copyWith(items: items));
  }

  Future<void> removeItem(String itemKey) async {
    final current = state.value ?? Cart.empty();
    final items = current.items.where((item) => item.key != itemKey).toList();
    if (items.isEmpty) {
      await clear();
    } else {
      await _setCart(current.copyWith(items: items));
    }
  }

  Future<void> updateOrderNote(String? note) async {
    final current = state.value ?? Cart.empty();
    final normalized = note?.trim();
    await _setCart(
      current.copyWith(
        orderNote: normalized,
        clearOrderNote: normalized == null || normalized.isEmpty,
      ),
    );
  }

  Future<void> applyAuthoritativePricing({
    required Map<String, double> unitPrices,
    required double deliveryFee,
    required double discount,
  }) async {
    final current = state.value ?? Cart.empty();
    final items = [
      for (final item in current.items)
        item.copyWith(unitPrice: unitPrices[item.key] ?? item.unitPrice),
    ];
    await _setCart(
      current.copyWith(
        items: items,
        deliveryFee: deliveryFee,
        discount: discount,
      ),
    );
  }

  Future<void> clear() async {
    state = AsyncData(Cart.empty());
    await _repository.clear();
  }

  Future<void> _setCart(Cart cart) async {
    state = AsyncData(cart);
    await _repository.save(cart);
  }

  Future<CartReview> revalidate() {
    return _reviewing ??= _revalidate().whenComplete(() => _reviewing = null);
  }

  Future<CartReview> _revalidate() async {
    final current = await future;
    if (current.isEmpty) return const CartReview();
    final marketplace = ref.read(marketplaceRepositoryProvider);
    final restaurant = await marketplace.getRestaurant(current.restaurantSlug!);
    final matches = restaurant.branches.where(
      (branch) =>
          branch.id == current.branchId && branch.slug == current.branchSlug,
    );
    if (matches.isEmpty || !matches.first.canOrder) {
      throw const AppException(
        'This branch is currently unavailable. Please choose another restaurant or branch.',
      );
    }
    final branch = matches.first;
    final menu = await marketplace.getMenu(
      restaurant: restaurant,
      branch: branch,
    );
    final available = {for (final item in menu.items) item.cartKey: item};
    var changedPrices = false;
    final removedNames = <String>[];
    final items = <CartItem>[];
    for (final item in current.items) {
      final latest = available[item.key];
      if (latest == null || !latest.isAvailable) {
        removedNames.add(item.name);
        continue;
      }
      if ((latest.price - item.unitPrice).abs() >= .005) changedPrices = true;
      items.add(item.copyWith(unitPrice: latest.price));
    }
    // Avoid overwriting edits made while a request was in flight.
    if (state.value?.encode() != current.encode()) return const CartReview();
    if (items.isEmpty) {
      await clear();
    } else {
      await _setCart(
        current.copyWith(
          items: items,
          deliveryFee: branch.delivery.baseFee,
          discount: 0,
        ),
      );
    }
    return CartReview(pricesChanged: changedPrices, removedNames: removedNames);
  }
}

class CartReview {
  const CartReview({this.pricesChanged = false, this.removedNames = const []});
  final bool pricesChanged;
  final List<String> removedNames;
  bool get changed => pricesChanged || removedNames.isNotEmpty;
}
