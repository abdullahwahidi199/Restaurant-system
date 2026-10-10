import 'package:pakhlai_mobile/core/utils/json_parsing.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/menu_models.dart';

enum RestaurantStatus { open, closed, busy, temporarilyUnavailable, unknown }

class DeliveryInfo {
  const DeliveryInfo({
    this.available = false,
    this.baseFee = 0,
    this.pricePerKm = 0,
    this.radiusKm,
    this.minimumOrder = 0,
    this.estimatedMinutes,
    this.distanceKm,
    this.deliversToLocation,
  });

  final bool available;
  final double baseFee;
  final double pricePerKm;
  final double? radiusKm;
  final double minimumOrder;
  final int? estimatedMinutes;
  final double? distanceKm;
  final bool? deliversToLocation;
}

class RatingInfo {
  const RatingInfo({this.average, this.count = 0});

  final double? average;
  final int count;
}

class Cuisine {
  const Cuisine({
    required this.id,
    required this.name,
    this.imageUrl,
    this.restaurantCount = 0,
  });

  final int id;
  final String name;
  final String? imageUrl;
  final int restaurantCount;

  factory Cuisine.fromJson(
    Map<String, dynamic> json, {
    required String? Function(Object?) resolveImage,
  }) {
    return Cuisine(
      id: jsonInt(json['id']) ?? 0,
      name: jsonString(json['name']) ?? '',
      imageUrl: resolveImage(json['image']),
      restaurantCount: jsonInt(json['restaurant_count']) ?? 0,
    );
  }
}

class RestaurantBranch {
  const RestaurantBranch({
    required this.id,
    required this.name,
    required this.slug,
    required this.status,
    required this.delivery,
    this.address,
    this.phone,
    this.logoUrl,
    this.isMain = false,
    this.latitude,
    this.longitude,
    this.openingHours,
  });

  final int id;
  final String name;
  final String slug;
  final String? address;
  final String? phone;
  final String? logoUrl;
  final bool isMain;
  final double? latitude;
  final double? longitude;
  final String? openingHours;
  final RestaurantStatus status;
  final DeliveryInfo delivery;

  bool get canOrder =>
      status != RestaurantStatus.closed &&
      status != RestaurantStatus.temporarilyUnavailable;

  factory RestaurantBranch.fromDiscovery(
    Map<String, dynamic> json, {
    required String? Function(Object?) resolveImage,
  }) {
    final isOpen = jsonBool(json['is_open']);
    return RestaurantBranch(
      id: jsonInt(json['id']) ?? 0,
      name: jsonString(json['name']) ?? '',
      slug: jsonString(json['slug']) ?? '',
      address: jsonString(json['address']),
      phone: jsonString(json['phone']),
      logoUrl: resolveImage(json['logo']),
      isMain: jsonBool(json['is_main_branch']) ?? false,
      latitude: jsonDouble(json['latitude']),
      longitude: jsonDouble(json['longitude']),
      openingHours: jsonString(json['opening_hours']),
      status: isOpen == true
          ? RestaurantStatus.open
          : isOpen == false
          ? RestaurantStatus.closed
          : RestaurantStatus.unknown,
      delivery: DeliveryInfo(
        available: jsonBool(json['delivery_available']) ?? false,
        baseFee: jsonDouble(json['base_delivery_fee']) ?? 0,
        pricePerKm: jsonDouble(json['price_per_km']) ?? 0,
        radiusKm: jsonDouble(json['delivery_radius_km']),
        minimumOrder: jsonDouble(json['min_order_amount']) ?? 0,
        distanceKm: jsonDouble(json['distance_km']),
        deliversToLocation: jsonBool(json['delivers_to_location']),
      ),
    );
  }
}

class Restaurant {
  const Restaurant({
    required this.id,
    required this.name,
    required this.slug,
    required this.status,
    required this.delivery,
    required this.rating,
    required this.branches,
    required this.cuisines,
    required this.dishes,
    this.slogan,
    this.address,
    this.phone,
    this.logoUrl,
    this.coverImageUrl,
    this.openingHours,
  });

  final int id;
  final String name;
  final String slug;
  final String? slogan;
  final String? address;
  final String? phone;
  final String? logoUrl;
  final String? coverImageUrl;
  final String? openingHours;
  final RestaurantStatus status;
  final DeliveryInfo delivery;
  final RatingInfo rating;
  final List<RestaurantBranch> branches;
  final List<Cuisine> cuisines;
  final List<MarketplaceItem> dishes;

  RestaurantBranch? get defaultBranch {
    if (branches.isEmpty) return null;
    return branches.where((branch) => branch.isMain).firstOrNull ??
        branches.first;
  }

  bool get canOrder => branches.any((branch) => branch.canOrder);

  factory Restaurant.fromDiscovery(
    Map<String, dynamic> json, {
    required String? Function(Object?) resolveImage,
  }) {
    final isOpen = jsonBool(json['is_open']);
    return Restaurant(
      id: jsonInt(json['id']) ?? 0,
      name: jsonString(json['name']) ?? '',
      slug: jsonString(json['slug']) ?? '',
      slogan: jsonString(json['slogan']),
      address: jsonString(json['address']),
      phone: jsonString(json['phone']),
      logoUrl: resolveImage(json['logo']),
      coverImageUrl: resolveImage(json['cover_image']),
      openingHours: jsonString(json['opening_hours']),
      status: isOpen == true
          ? RestaurantStatus.open
          : isOpen == false
          ? RestaurantStatus.closed
          : RestaurantStatus.unknown,
      delivery: DeliveryInfo(
        available: jsonBool(json['delivery_available']) ?? false,
        baseFee: jsonDouble(json['base_delivery_fee']) ?? 0,
        pricePerKm: jsonDouble(json['price_per_km']) ?? 0,
        radiusKm: jsonDouble(json['delivery_radius_km']),
        minimumOrder: jsonDouble(json['min_order_amount']) ?? 0,
        distanceKm: jsonDouble(json['distance_km']),
        deliversToLocation: jsonBool(json['delivers_to_location']),
      ),
      rating: RatingInfo(
        average: jsonDouble(json['rating']),
        count: jsonInt(json['review_count']) ?? 0,
      ),
      branches: jsonMapList(json['branches'])
          .map(
            (branch) => RestaurantBranch.fromDiscovery(
              branch,
              resolveImage: resolveImage,
            ),
          )
          .toList(),
      cuisines: jsonMapList(json['cuisine_details'])
          .map(
            (cuisine) => Cuisine.fromJson(cuisine, resolveImage: resolveImage),
          )
          .toList(),
      dishes: jsonMapList(json['dishes'])
          .map(
            (dish) =>
                MarketplaceItem.fromDiscovery(dish, resolveImage: resolveImage),
          )
          .toList(),
    );
  }
}

extension<T> on Iterable<T> {
  T? get firstOrNull {
    final iterator = this.iterator;
    return iterator.moveNext() ? iterator.current : null;
  }
}
