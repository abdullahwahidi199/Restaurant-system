import 'package:pakhlai_mobile/features/marketplace/domain/menu_models.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/restaurant_models.dart';

class DiscoveryData {
  const DiscoveryData({
    required this.restaurants,
    required this.cuisines,
    required this.dishes,
  });

  final List<Restaurant> restaurants;
  final List<Cuisine> cuisines;
  final List<MarketplaceItem> dishes;
}
