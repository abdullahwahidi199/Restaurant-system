import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pakhlai_mobile/core/api/api_client.dart';
import 'package:pakhlai_mobile/core/api/api_endpoints.dart';
import 'package:pakhlai_mobile/core/api/api_error_mapper.dart';
import 'package:pakhlai_mobile/core/utils/json_parsing.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/discovery_data.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/menu_models.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/restaurant_models.dart';

final marketplaceRepositoryProvider = Provider<MarketplaceRepository>((ref) {
  return DioMarketplaceRepository(ref.watch(dioProvider));
});

abstract interface class MarketplaceRepository {
  Future<DiscoveryData> discover({String query = '', int limit = 30});

  Future<Restaurant> getRestaurant(String slug);

  Future<RestaurantMenu> getMenu({
    required Restaurant restaurant,
    required RestaurantBranch branch,
  });
}

class DioMarketplaceRepository implements MarketplaceRepository {
  DioMarketplaceRepository(this._dio);

  final Dio _dio;

  @override
  Future<DiscoveryData> discover({String query = '', int limit = 30}) async {
    try {
      final response = await _dio.get<Object?>(
        ApiEndpoints.discovery,
        queryParameters: {
          'limit': limit,
          if (query.trim().isNotEmpty) 'q': query.trim(),
        },
      );
      final body = jsonMap(response.data);
      return DiscoveryData(
        restaurants: jsonMapList(body['restaurants'])
            .map(
              (json) => Restaurant.fromDiscovery(
                json,
                resolveImage: _resolveMediaUrl,
              ),
            )
            .toList(),
        cuisines: jsonMapList(body['cuisines'])
            .map(
              (json) => Cuisine.fromJson(json, resolveImage: _resolveMediaUrl),
            )
            .where((cuisine) => cuisine.name.isNotEmpty)
            .toList(),
        dishes: jsonMapList(body['dishes'])
            .map(
              (json) => MarketplaceItem.fromDiscovery(
                json,
                resolveImage: _resolveMediaUrl,
              ),
            )
            .where((dish) => dish.name.isNotEmpty)
            .toList(),
      );
    } on DioException catch (error) {
      throw ApiErrorMapper.fromDio(
        error,
        fallback: 'Unable to load marketplace data.',
      );
    }
  }

  @override
  Future<Restaurant> getRestaurant(String slug) async {
    final normalizedSlug = slug.trim().toLowerCase();
    try {
      final response = await _dio.get<Object?>(
        ApiEndpoints.publicRestaurant(normalizedSlug),
      );
      final body = jsonMap(response.data);
      final restaurantJson = jsonMap(body['restaurant']);
      final branches = jsonMapList(body['branches']);
      final normalized = <String, dynamic>{
        ...restaurantJson,
        'rating': null,
        'review_count': 0,
        'is_open': branches.any((branch) => branch['is_open'] == true)
            ? true
            : branches.isNotEmpty &&
                  branches.every((branch) => branch['is_open'] == false)
            ? false
            : null,
        'branches': [
          for (var index = 0; index < branches.length; index++)
            {
              ...branches[index],
              'delivery_available':
                  branches[index]['effective_delivery_available'],
              'min_order_amount': branches[index]['effective_min_order_amount'],
            },
        ],
        'cuisine_details': const <Object>[],
        'dishes': const <Object>[],
      };
      return Restaurant.fromDiscovery(
        normalized,
        resolveImage: _resolveMediaUrl,
      );
    } on DioException catch (error) {
      throw ApiErrorMapper.fromDio(
        error,
        fallback: 'Unable to load this restaurant.',
      );
    }
  }

  @override
  Future<RestaurantMenu> getMenu({
    required Restaurant restaurant,
    required RestaurantBranch branch,
  }) async {
    final prefix = ApiEndpoints.publicMenuPrefix(restaurant.slug, branch.slug);
    try {
      final responses = await Future.wait([
        _dio.get<Object?>(
          '$prefix/categories/',
          queryParameters: {'summary': 1},
        ),
        _dio.get<Object?>('$prefix/menu-items/'),
        _dio.get<Object?>('$prefix/platters/'),
      ]);
      final categoryJson = jsonMapList(responses[0].data);
      final menuItems = jsonMapList(responses[1].data)
          .map(
            (json) => MarketplaceItem.fromMenu(
              json,
              type: MarketplaceItemType.menuItem,
              restaurantId: restaurant.id,
              restaurantName: restaurant.name,
              restaurantSlug: restaurant.slug,
              resolveImage: _resolveMediaUrl,
            ),
          )
          .toList();
      final platters = jsonMapList(responses[2].data)
          .map(
            (json) => MarketplaceItem.fromMenu(
              json,
              type: MarketplaceItemType.platter,
              restaurantId: restaurant.id,
              restaurantName: restaurant.name,
              restaurantSlug: restaurant.slug,
              resolveImage: _resolveMediaUrl,
            ),
          )
          .toList();
      final allItems = [...menuItems, ...platters];
      final categories =
          <MenuCategory>[
            for (final json in categoryJson)
              MenuCategory(
                id: jsonInt(json['id']) ?? 0,
                name: jsonString(json['name']) ?? '',
                description: jsonString(json['description']),
                imageUrl: _resolveMediaUrl(json['image']),
                rank: jsonInt(json['rank']),
                items:
                    allItems
                        .where((item) => item.categoryId == jsonInt(json['id']))
                        .toList()
                      ..sort(_compareItems),
              ),
          ]..removeWhere(
            (category) => category.name.isEmpty || category.items.isEmpty,
          );
      final uncategorized =
          allItems.where((item) => item.categoryId == null).toList()
            ..sort(_compareItems);
      if (uncategorized.isNotEmpty) {
        categories.add(
          MenuCategory(id: -1, name: 'Other', items: uncategorized),
        );
      }
      return RestaurantMenu(categories: categories);
    } on DioException catch (error) {
      throw ApiErrorMapper.fromDio(
        error,
        fallback: 'Unable to load this menu.',
      );
    }
  }

  int _compareItems(MarketplaceItem left, MarketplaceItem right) {
    final order = left.displayOrder.compareTo(right.displayOrder);
    return order != 0 ? order : left.name.compareTo(right.name);
  }

  String? _resolveMediaUrl(Object? value) {
    final raw = jsonString(value);
    if (raw == null) return null;
    final uri = Uri.tryParse(raw);
    if (uri != null && uri.hasScheme) return raw;
    return Uri.parse(_dio.options.baseUrl).resolve(raw).toString();
  }
}
