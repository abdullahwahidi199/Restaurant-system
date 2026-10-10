import 'package:pakhlai_mobile/core/utils/json_parsing.dart';

enum MarketplaceItemType { menuItem, platter }

class MarketplaceItem {
  const MarketplaceItem({
    required this.id,
    required this.type,
    required this.name,
    required this.price,
    required this.restaurantId,
    required this.restaurantName,
    required this.restaurantSlug,
    required this.isAvailable,
    this.description,
    this.imageUrl,
    this.categoryId,
    this.categoryName,
    this.branchId,
    this.displayOrder = 0,
  });

  final int id;
  final MarketplaceItemType type;
  final String name;
  final String? description;
  final double price;
  final String? imageUrl;
  final int? categoryId;
  final String? categoryName;
  final int restaurantId;
  final String restaurantName;
  final String restaurantSlug;
  final int? branchId;
  final bool isAvailable;
  final int displayOrder;

  String get cartKey => '${type.name}:$id';

  factory MarketplaceItem.fromDiscovery(
    Map<String, dynamic> json, {
    required String? Function(Object?) resolveImage,
  }) {
    return MarketplaceItem(
      id: jsonInt(json['id']) ?? 0,
      type: json['type'] == 'platter'
          ? MarketplaceItemType.platter
          : MarketplaceItemType.menuItem,
      name: jsonString(json['name']) ?? '',
      description: jsonString(json['description']),
      price: jsonDouble(json['price']) ?? 0,
      imageUrl: resolveImage(json['image']),
      categoryName: jsonString(json['category']),
      restaurantId: jsonInt(json['restaurant_id']) ?? 0,
      restaurantName: jsonString(json['restaurant_name']) ?? '',
      restaurantSlug: jsonString(json['restaurant_slug']) ?? '',
      branchId: jsonInt(json['branch_id']),
      isAvailable: jsonBool(json['is_available']) ?? false,
    );
  }

  factory MarketplaceItem.fromMenu(
    Map<String, dynamic> json, {
    required MarketplaceItemType type,
    required int restaurantId,
    required String restaurantName,
    required String restaurantSlug,
    required String? Function(Object?) resolveImage,
  }) {
    return MarketplaceItem(
      id: jsonInt(json['id']) ?? 0,
      type: type,
      name: jsonString(json['name']) ?? '',
      description: jsonString(json['description']),
      price: jsonDouble(json['price']) ?? 0,
      imageUrl: resolveImage(json['image']),
      categoryId: jsonInt(json['category']),
      categoryName: jsonString(json['category_name']),
      restaurantId: restaurantId,
      restaurantName: restaurantName,
      restaurantSlug: restaurantSlug,
      branchId: jsonInt(json['branch']),
      isAvailable:
          jsonBool(json['final_availability']) ??
          jsonBool(json['is_available']) ??
          false,
      displayOrder: jsonInt(json['display_order']) ?? 0,
    );
  }
}

class MenuCategory {
  const MenuCategory({
    required this.id,
    required this.name,
    required this.items,
    this.description,
    this.imageUrl,
    this.rank,
  });

  final int id;
  final String name;
  final String? description;
  final String? imageUrl;
  final int? rank;
  final List<MarketplaceItem> items;
}

class RestaurantMenu {
  const RestaurantMenu({required this.categories});

  final List<MenuCategory> categories;

  List<MarketplaceItem> get items => [
    for (final category in categories) ...category.items,
  ];
}
