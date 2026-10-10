import 'dart:convert';

import 'package:pakhlai_mobile/core/utils/json_parsing.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/menu_models.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/restaurant_models.dart';

class CartItem {
  const CartItem({
    required this.itemId,
    required this.itemType,
    required this.name,
    required this.unitPrice,
    required this.quantity,
    this.imageUrl,
    this.note,
  });

  final int itemId;
  final MarketplaceItemType itemType;
  final String name;
  final double unitPrice;
  final int quantity;
  final String? imageUrl;
  final String? note;

  String get key => '${itemType.name}:$itemId';
  double get subtotal => unitPrice * quantity;

  CartItem copyWith({
    int? quantity,
    double? unitPrice,
    String? note,
    bool clearNote = false,
  }) {
    return CartItem(
      itemId: itemId,
      itemType: itemType,
      name: name,
      unitPrice: unitPrice ?? this.unitPrice,
      quantity: quantity ?? this.quantity,
      imageUrl: imageUrl,
      note: clearNote ? null : note ?? this.note,
    );
  }

  Map<String, Object?> toJson() => {
    'item_id': itemId,
    'item_type': itemType.name,
    'name': name,
    'unit_price': unitPrice,
    'quantity': quantity,
    'image_url': imageUrl,
    'note': note,
  };

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      itemId: jsonInt(json['item_id']) ?? 0,
      itemType: json['item_type'] == MarketplaceItemType.platter.name
          ? MarketplaceItemType.platter
          : MarketplaceItemType.menuItem,
      name: jsonString(json['name']) ?? '',
      unitPrice: jsonDouble(json['unit_price']) ?? 0,
      quantity: jsonInt(json['quantity']) ?? 1,
      imageUrl: jsonString(json['image_url']),
      note: jsonString(json['note']),
    );
  }
}

class Cart {
  const Cart({
    required this.items,
    this.restaurantId,
    this.restaurantName,
    this.restaurantSlug,
    this.branchId,
    this.branchName,
    this.branchSlug,
    this.deliveryFee = 0,
    this.discount = 0,
    this.orderNote,
  });

  factory Cart.empty() => const Cart(items: []);

  final int? restaurantId;
  final String? restaurantName;
  final String? restaurantSlug;
  final int? branchId;
  final String? branchName;
  final String? branchSlug;
  final double deliveryFee;
  final double discount;
  final String? orderNote;
  final List<CartItem> items;

  bool get isEmpty => items.isEmpty;
  bool get isNotEmpty => items.isNotEmpty;
  int get itemCount => items.fold(0, (total, item) => total + item.quantity);
  double get subtotal => items.fold(0, (total, item) => total + item.subtotal);
  double get displayTotal => subtotal + deliveryFee - discount;

  bool isCompatible(Restaurant restaurant, RestaurantBranch branch) {
    return isEmpty || (restaurantId == restaurant.id && branchId == branch.id);
  }

  Cart copyWith({
    List<CartItem>? items,
    double? deliveryFee,
    double? discount,
    String? orderNote,
    bool clearOrderNote = false,
  }) {
    return Cart(
      restaurantId: restaurantId,
      restaurantName: restaurantName,
      restaurantSlug: restaurantSlug,
      branchId: branchId,
      branchName: branchName,
      branchSlug: branchSlug,
      deliveryFee: deliveryFee ?? this.deliveryFee,
      discount: discount ?? this.discount,
      orderNote: clearOrderNote ? null : orderNote ?? this.orderNote,
      items: items ?? this.items,
    );
  }

  Map<String, Object?> toJson() => {
    'restaurant_id': restaurantId,
    'restaurant_name': restaurantName,
    'restaurant_slug': restaurantSlug,
    'branch_id': branchId,
    'branch_name': branchName,
    'branch_slug': branchSlug,
    'delivery_fee': deliveryFee,
    'discount': discount,
    'order_note': orderNote,
    'items': items.map((item) => item.toJson()).toList(),
  };

  String encode() => jsonEncode(toJson());

  factory Cart.decode(String source) {
    final json = jsonMap(jsonDecode(source));
    return Cart(
      restaurantId: jsonInt(json['restaurant_id']),
      restaurantName: jsonString(json['restaurant_name']),
      restaurantSlug: jsonString(json['restaurant_slug']),
      branchId: jsonInt(json['branch_id']),
      branchName: jsonString(json['branch_name']),
      branchSlug: jsonString(json['branch_slug']),
      deliveryFee: jsonDouble(json['delivery_fee']) ?? 0,
      discount: jsonDouble(json['discount']) ?? 0,
      orderNote: jsonString(json['order_note']),
      items: jsonMapList(json['items'])
          .map(CartItem.fromJson)
          .where((item) => item.itemId > 0 && item.quantity > 0)
          .toList(),
    );
  }

  factory Cart.withItem({
    required MarketplaceItem item,
    required Restaurant restaurant,
    required RestaurantBranch branch,
    required int quantity,
    String? note,
  }) {
    return Cart(
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantSlug: restaurant.slug,
      branchId: branch.id,
      branchName: branch.name,
      branchSlug: branch.slug,
      deliveryFee: branch.delivery.baseFee,
      items: [
        CartItem(
          itemId: item.id,
          itemType: item.type,
          name: item.name,
          unitPrice: item.price,
          quantity: quantity,
          imageUrl: item.imageUrl,
          note: jsonString(note),
        ),
      ],
    );
  }
}
