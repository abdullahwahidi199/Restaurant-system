import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pakhlai_mobile/features/marketplace/data/marketplace_repository.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/discovery_data.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/menu_models.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/restaurant_models.dart';

final homeDiscoveryProvider = FutureProvider<DiscoveryData>((ref) {
  return ref.watch(marketplaceRepositoryProvider).discover();
});

final searchDiscoveryProvider = FutureProvider.autoDispose
    .family<DiscoveryData, String>((ref, query) {
      return ref.watch(marketplaceRepositoryProvider).discover(query: query);
    });

final restaurantProvider = FutureProvider.family<Restaurant, String>((
  ref,
  restaurantSlug,
) {
  return ref.watch(marketplaceRepositoryProvider).getRestaurant(restaurantSlug);
});

typedef MenuRequest = ({Restaurant restaurant, RestaurantBranch branch});

final restaurantMenuProvider =
    FutureProvider.family<RestaurantMenu, MenuRequest>((ref, request) {
      return ref
          .watch(marketplaceRepositoryProvider)
          .getMenu(restaurant: request.restaurant, branch: request.branch);
    });
