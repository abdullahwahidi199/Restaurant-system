import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:pakhlai_mobile/app/router/app_router.dart';
import 'package:pakhlai_mobile/app/router/app_routes.dart';
import 'package:pakhlai_mobile/core/theme/app_theme.dart';
import 'package:pakhlai_mobile/core/utils/currency_formatter.dart';
import 'package:pakhlai_mobile/core/widgets/brand_mark.dart';
import 'package:pakhlai_mobile/core/widgets/network_image_view.dart';
import 'package:pakhlai_mobile/features/cart/domain/cart_models.dart';
import 'package:pakhlai_mobile/features/cart/application/cart_controller.dart';
import 'package:pakhlai_mobile/features/home/presentation/home_screen.dart';
import 'package:pakhlai_mobile/features/marketplace/data/marketplace_repository.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/discovery_data.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/menu_models.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/restaurant_models.dart';
import 'package:pakhlai_mobile/features/marketplace/presentation/widgets/menu_item_card.dart';
import 'package:pakhlai_mobile/features/orders/application/order_providers.dart';
import 'package:pakhlai_mobile/features/orders/data/order_repository.dart';
import 'package:pakhlai_mobile/features/orders/domain/order_models.dart';
import 'package:pakhlai_mobile/features/orders/presentation/order_detail_screen.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  setUp(() {
    SharedPreferences.setMockInitialValues({});
    FlutterSecureStorage.setMockInitialValues({});
  });
  testWidgets('renders the Pakhlai brand component', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light,
        home: const Scaffold(body: Center(child: BrandMark())),
      ),
    );

    expect(find.text('Pakhlai'), findsOneWidget);
    final logo = tester.widget<Image>(find.byType(Image));
    expect((logo.image as AssetImage).assetName, BrandMark.logoAsset);
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
  });

  testWidgets(
    'compact brand uses the same logo on a light or colored surface',
    (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.light,
          home: const Scaffold(body: BrandMark(compact: true, light: true)),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('Pakhlai'), findsNothing);
      final logo = tester.widget<Image>(find.byType(Image));
      expect((logo.image as AssetImage).assetName, BrandMark.logoAsset);
      expect(tester.takeException(), isNull);
    },
  );

  test('formats customer prices in Afghan afghani', () {
    final result = CurrencyFormatter.format(1250);

    expect(result, contains('AFN'));
    expect(result, contains('1,250'));
  });

  test('parses the real Django discovery field shape', () {
    final restaurant = Restaurant.fromDiscovery({
      'id': 8,
      'name': 'afiat',
      'slug': 'afiat',
      'cover_image': null,
      'logo': '/media/restaurant_logos/chen_erd.png',
      'base_delivery_fee': '50.00',
      'min_order_amount': '499.99',
      'is_open': null,
      'rating': null,
      'review_count': 0,
      'branches': [
        {
          'id': 1,
          'name': 'Main Branch',
          'slug': 'main-branch',
          'is_main_branch': true,
          'delivery_available': true,
          'base_delivery_fee': 50.0,
          'min_order_amount': 499.99,
          'is_open': null,
        },
      ],
      'cuisine_details': [
        {'id': 14, 'name': 'Meat', 'image': null},
      ],
      'dishes': const [],
    }, resolveImage: (value) => value?.toString());

    expect(restaurant.name, 'afiat');
    expect(restaurant.delivery.baseFee, 50);
    expect(restaurant.defaultBranch?.slug, 'main-branch');
    expect(restaurant.cuisines.single.name, 'Meat');
  });

  test('round-trips a persisted branch-compatible cart', () {
    final restaurant = Restaurant(
      id: 8,
      name: 'afiat',
      slug: 'afiat',
      status: RestaurantStatus.unknown,
      delivery: const DeliveryInfo(baseFee: 50),
      rating: const RatingInfo(),
      branches: const [],
      cuisines: const [],
      dishes: const [],
    );
    const branch = RestaurantBranch(
      id: 1,
      name: 'Main Branch',
      slug: 'main-branch',
      status: RestaurantStatus.unknown,
      delivery: DeliveryInfo(available: true, baseFee: 50),
    );
    const item = MarketplaceItem(
      id: 21,
      type: MarketplaceItemType.menuItem,
      name: 'Usbeki-palaw',
      price: 299,
      restaurantId: 8,
      restaurantName: 'afiat',
      restaurantSlug: 'afiat',
      isAvailable: true,
    );
    final restored = Cart.decode(
      Cart.withItem(
        item: item,
        restaurant: restaurant,
        branch: branch,
        quantity: 2,
      ).encode(),
    );

    expect(restored.itemCount, 2);
    expect(restored.displayTotal, 648);
    expect(restored.branchSlug, 'main-branch');
  });

  testWidgets('auth and main navigation routes render', (tester) async {
    tester.view.physicalSize = const Size(320, 640);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    final container = ProviderContainer(
      overrides: [
        marketplaceRepositoryProvider.overrideWithValue(
          const _TestMarketplaceRepository(),
        ),
      ],
    );
    addTearDown(container.dispose);
    final router = container.read(appRouterProvider);
    addTearDown(router.dispose);
    router.go(AppRoutes.login);

    await tester.pumpWidget(
      UncontrolledProviderScope(
        container: container,
        child: MaterialApp.router(
          theme: AppTheme.light,
          routerConfig: router,
          supportedLocales: AppLocalizations.supportedLocales,
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Welcome back'), findsOneWidget);
    await tester.tap(find.text('Forgot password?'));
    await tester.pumpAndSettle();
    expect(find.text('Reset your password'), findsOneWidget);

    router.go(AppRoutes.home);
    await tester.pump();
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Orders'), findsOneWidget);
    expect(find.text('Profile'), findsOneWidget);
  });

  testWidgets('customer can change branch, add an item, and edit the cart', (
    tester,
  ) async {
    SharedPreferences.setMockInitialValues({});
    tester.view.physicalSize = const Size(320, 640);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    final container = ProviderContainer(
      overrides: [
        marketplaceRepositoryProvider.overrideWithValue(
          const _FlowMarketplaceRepository(),
        ),
      ],
    );
    addTearDown(container.dispose);
    final router = container.read(appRouterProvider);
    addTearDown(router.dispose);
    router.go(AppRoutes.home);

    await tester.pumpWidget(
      UncontrolledProviderScope(
        container: container,
        child: MaterialApp.router(
          theme: AppTheme.light,
          routerConfig: router,
          supportedLocales: AppLocalizations.supportedLocales,
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
        ),
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.text('afiat').first);
    await tester.pumpAndSettle();
    await tester.tap(find.textContaining('Main Branch'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Karte-3').last);
    await tester.pumpAndSettle();

    await tester.ensureVisible(find.byTooltip('Card view'));
    await tester.tap(find.byTooltip('Card view'));
    await tester.pumpAndSettle();
    expect(
      tester.widget<MenuItemCard>(find.byType(MenuItemCard).first).layout,
      MenuItemCardLayout.grid,
    );

    await tester.tap(find.byTooltip('List view'));
    await tester.pumpAndSettle();
    expect(
      tester.widget<MenuItemCard>(find.byType(MenuItemCard).first).layout,
      MenuItemCardLayout.list,
    );

    await tester.tap(find.text('Usbeki-palaw').first);
    await tester.pumpAndSettle();
    await tester.tap(find.textContaining('Add to cart').last);
    await tester.pumpAndSettle();

    expect(find.text('View cart'), findsOneWidget);
    await tester.tap(find.text('View cart'));
    await tester.pumpAndSettle();
    expect(find.text('Cart'), findsOneWidget);
    expect(find.text('Karte-3'), findsOneWidget);

    await tester.tap(find.byIcon(Icons.add_rounded).last);
    await tester.pumpAndSettle();
    expect(container.read(cartControllerProvider).value?.itemCount, 2);
  });

  testWidgets('home images stay mounted while switching navigation tabs', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    final container = ProviderContainer(
      overrides: [
        marketplaceRepositoryProvider.overrideWithValue(
          const _FlowMarketplaceRepository(),
        ),
      ],
    );
    addTearDown(container.dispose);
    final router = container.read(appRouterProvider);
    addTearDown(router.dispose);
    router.go(AppRoutes.home);

    await tester.pumpWidget(
      UncontrolledProviderScope(
        container: container,
        child: MaterialApp.router(
          theme: AppTheme.light,
          routerConfig: router,
          supportedLocales: AppLocalizations.supportedLocales,
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
        ),
      ),
    );
    await tester.pumpAndSettle();

    final originalHome = tester.element(find.byType(HomeScreen));
    final originalImage = tester.element(find.byType(NetworkImageView).first);

    await tester.tap(find.text('Search').last);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Home').last);
    await tester.pumpAndSettle();

    expect(tester.element(find.byType(HomeScreen)), same(originalHome));
    expect(
      tester.element(find.byType(NetworkImageView).first),
      same(originalImage),
    );
    expect(tester.takeException(), isNull);
  });

  testWidgets('premium order tracking stays responsive on a narrow screen', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(320, 640);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    final order = CustomerOrder(
      id: 91,
      orderNumber: 2048,
      orderType: CustomerOrderType.delivery,
      status: 'preparing',
      subtotal: 580,
      deliveryFee: 50,
      discount: 30,
      total: 600,
      restaurantName: 'Afiat Restaurant',
      branchName: 'Main Branch',
      address: 'Karte-3, Kabul',
      phone: '+93 700 000 000',
      preparationTime: 25,
      createdAt: DateTime.now().subtract(const Duration(minutes: 5)),
      updatedAt: DateTime.now(),
      isFinal: false,
      items: const [
        CustomerOrderItem(
          id: 1,
          itemId: 21,
          type: MarketplaceItemType.menuItem,
          name: 'Usbeki-palaw',
          quantity: 2,
          unitPrice: 290,
          subtotal: 580,
          status: 'preparing',
          note: 'Less spicy',
        ),
      ],
    );
    final repository = _TrackingOrderRepository(order);

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          orderRepositoryProvider.overrideWithValue(repository),
          customerOrderProvider.overrideWith((ref, id) async => order),
        ],
        child: MaterialApp(
          theme: AppTheme.light,
          supportedLocales: AppLocalizations.supportedLocales,
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          home: const OrderDetailScreen(orderId: 91),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Preparing your food'), findsWidgets);
    expect(find.text('25 min'), findsOneWidget);
    expect(tester.takeException(), isNull);

    await tester.drag(find.byType(ListView), const Offset(0, -700));
    await tester.pump();
    expect(find.text('2×'), findsOneWidget);
    expect(find.text('Cash on delivery'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}

class _TestMarketplaceRepository implements MarketplaceRepository {
  const _TestMarketplaceRepository();

  @override
  Future<DiscoveryData> discover({String query = '', int limit = 30}) async {
    return const DiscoveryData(restaurants: [], cuisines: [], dishes: []);
  }

  @override
  Future<RestaurantMenu> getMenu({
    required Restaurant restaurant,
    required RestaurantBranch branch,
  }) async {
    return const RestaurantMenu(categories: []);
  }

  @override
  Future<Restaurant> getRestaurant(String slug) {
    return Future.error(StateError('Not needed by this test.'));
  }
}

class _FlowMarketplaceRepository implements MarketplaceRepository {
  const _FlowMarketplaceRepository();

  static const branches = [
    RestaurantBranch(
      id: 1,
      name: 'Main Branch',
      slug: 'main-branch',
      address: 'Kabul-Afghanistan',
      isMain: true,
      status: RestaurantStatus.open,
      delivery: DeliveryInfo(available: true, baseFee: 50),
    ),
    RestaurantBranch(
      id: 5,
      name: 'Karte-3',
      slug: 'karte-3',
      address: 'Karte-3',
      status: RestaurantStatus.open,
      delivery: DeliveryInfo(available: true, baseFee: 50),
    ),
  ];

  static const item = MarketplaceItem(
    id: 21,
    type: MarketplaceItemType.menuItem,
    name: 'Usbeki-palaw',
    price: 299,
    categoryId: 14,
    categoryName: 'Meat',
    restaurantId: 8,
    restaurantName: 'afiat',
    restaurantSlug: 'afiat',
    branchId: 5,
    isAvailable: true,
  );

  static const restaurant = Restaurant(
    id: 8,
    name: 'afiat',
    slug: 'afiat',
    slogan: 'Fine dining',
    address: 'Kabul-Afghanistan',
    status: RestaurantStatus.open,
    delivery: DeliveryInfo(available: true, baseFee: 50),
    rating: RatingInfo(),
    branches: branches,
    cuisines: [Cuisine(id: 14, name: 'Meat')],
    dishes: [item],
  );

  @override
  Future<DiscoveryData> discover({String query = '', int limit = 30}) async {
    return const DiscoveryData(
      restaurants: [restaurant],
      cuisines: [Cuisine(id: 14, name: 'Meat')],
      dishes: [item],
    );
  }

  @override
  Future<RestaurantMenu> getMenu({
    required Restaurant restaurant,
    required RestaurantBranch branch,
  }) async {
    return const RestaurantMenu(
      categories: [
        MenuCategory(id: 14, name: 'Meat', items: [item]),
      ],
    );
  }

  @override
  Future<Restaurant> getRestaurant(String slug) async => restaurant;
}

class _TrackingOrderRepository implements OrderRepository {
  const _TrackingOrderRepository(this.order);

  final CustomerOrder order;

  @override
  Future<CustomerOrder> cancelOrder(int id) async => order;

  @override
  Future<CustomerOrder> createOrder(CheckoutRequest request) async => order;

  @override
  Future<CustomerOrder> getOrder(int id) async => order;

  @override
  Future<CustomerOrderPage> getOrders({int page = 1}) async =>
      CustomerOrderPage(items: [order], hasNext: false);

  @override
  Future<CustomerOrder> retryOrder(Map<String, dynamic> request) async => order;

  @override
  Future<CheckoutQuote> validateCheckout(CheckoutRequest request) =>
      Future.error(UnimplementedError());

  @override
  Stream<OrderLiveEvent> watchOrder(int id) => const Stream.empty();
}
