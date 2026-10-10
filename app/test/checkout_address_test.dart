import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:pakhlai_mobile/core/errors/app_exception.dart';
import 'package:pakhlai_mobile/core/theme/app_theme.dart';
import 'package:pakhlai_mobile/core/widgets/app_buttons.dart';
import 'package:pakhlai_mobile/features/addresses/application/customer_addresses_controller.dart';
import 'package:pakhlai_mobile/features/addresses/data/address_repository.dart';
import 'package:pakhlai_mobile/features/addresses/data/location_service.dart';
import 'package:pakhlai_mobile/features/addresses/domain/customer_address.dart';
import 'package:pakhlai_mobile/features/addresses/domain/delivery_point.dart';
import 'package:pakhlai_mobile/features/addresses/presentation/delivery_map.dart';
import 'package:pakhlai_mobile/features/auth/application/auth_controller.dart';
import 'package:pakhlai_mobile/features/cart/data/cart_repository.dart';
import 'package:pakhlai_mobile/features/cart/domain/cart_models.dart';
import 'package:pakhlai_mobile/features/checkout/presentation/checkout_screen.dart';
import 'package:pakhlai_mobile/features/customers/data/customer_repository.dart';
import 'package:pakhlai_mobile/features/customers/domain/customer_models.dart';
import 'package:pakhlai_mobile/features/marketplace/data/marketplace_repository.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/discovery_data.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/menu_models.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/restaurant_models.dart';
import 'package:pakhlai_mobile/features/orders/data/order_repository.dart';
import 'package:pakhlai_mobile/features/orders/domain/order_models.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  setUp(() {
    SharedPreferences.setMockInitialValues({});
    FlutterSecureStorage.setMockInitialValues({});
  });

  test('accepts full map links and coordinate pairs; rejects invalid pins', () {
    final point = DeliveryPoint.parse(
      'https://www.google.com/maps/@34.525,69.178,17z',
    );
    expect(point?.latitude, 34.525);
    expect(point?.longitude, 69.178);
    expect(DeliveryPoint.parse('34.525%2C69.178')?.isValid, isTrue);
    expect(DeliveryPoint.parse('91, 69'), isNull);
    expect(DeliveryPoint.parse('34, 181'), isNull);
    expect(DeliveryPoint.parse('https://maps.app.goo.gl/short'), isNull);
    expect(DeliveryPoint.parse('%broken'), isNull);
    expect(const DeliveryPoint(double.nan, 69).isValid, isFalse);
  });

  test(
    'saved addresses reload after guest mode and a new app container',
    () async {
      final repository = _Addresses();
      final container = ProviderContainer(
        overrides: [addressRepositoryProvider.overrideWithValue(repository)],
      );
      container.read(authControllerProvider.notifier).markAuthenticated();
      await container.read(customerAddressesProvider.future);
      final saved = await container
          .read(customerAddressesProvider.notifier)
          .create(
            const CustomerAddressDraft(
              label: 'Work',
              addressLine: 'Office 2',
              latitude: 34.526,
              longitude: 69.18,
              isDefault: true,
            ),
          );
      expect(
        container
            .read(customerAddressesProvider)
            .value!
            .where((a) => a.isDefault)
            .single
            .id,
        saved.id,
      );
      container.read(authControllerProvider.notifier).continueAsGuest();
      expect(await container.read(customerAddressesProvider.future), isEmpty);
      expect(repository.values, hasLength(2));
      container.dispose();
      final reopened = ProviderContainer(
        overrides: [addressRepositoryProvider.overrideWithValue(repository)],
      );
      addTearDown(reopened.dispose);
      reopened.read(authControllerProvider.notifier).markAuthenticated();
      final addresses = await reopened.read(customerAddressesProvider.future);
      expect(
        addresses.any((a) => a.id == saved.id && a.hasLocation && a.isDefault),
        isTrue,
      );
    },
  );

  testWidgets(
    'permission denied does not prevent choosing an explicit map pin',
    (tester) async {
      DeliveryPoint? chosen;
      final container = _container(location: const _Location(denied: true));
      addTearDown(container.dispose);
      await tester.pumpWidget(
        _app(
          container,
          Builder(
            builder: (context) => Scaffold(
              body: TextButton(
                onPressed: () async {
                  chosen = await showDeliveryMap(context);
                },
                child: const Text('Open map'),
              ),
            ),
          ),
        ),
      );
      await tester.tap(find.text('Open map'));
      await tester.pumpAndSettle();
      expect(
        tester.widget<PrimaryButton>(find.byType(PrimaryButton)).onPressed,
        isNull,
      );
      await tester.tap(find.byTooltip('Use current location'));
      await tester.pumpAndSettle();
      expect(find.textContaining('Allow location access'), findsOneWidget);
      await tester.tap(find.byType(FlutterMap));
      await tester.pump(const Duration(milliseconds: 350));
      await tester.pumpAndSettle();
      expect(
        tester.widget<PrimaryButton>(find.byType(PrimaryButton)).onPressed,
        isNotNull,
      );
      await tester.tap(find.text('Confirm this location'));
      await tester.pumpAndSettle();
      expect(chosen?.isValid, isTrue);
    },
  );

  testWidgets('approximate GPS requires an explicit delivery pin', (
    tester,
  ) async {
    final container = _container(location: const _Location(accuracy: 800));
    addTearDown(container.dispose);
    await tester.pumpWidget(
      _app(container, const DeliveryMapScreen(locateOnOpen: true)),
    );
    await tester.pumpAndSettle();
    expect(find.textContaining('This location is approximate'), findsOneWidget);
    expect(
      tester.widget<PrimaryButton>(find.byType(PrimaryButton)).onPressed,
      isNull,
    );
    await tester.tap(find.byType(FlutterMap));
    await tester.pump(const Duration(milliseconds: 350));
    await tester.pumpAndSettle();
    expect(
      tester.widget<PrimaryButton>(find.byType(PrimaryButton)).onPressed,
      isNotNull,
    );
    expect(find.textContaining('This location is approximate'), findsNothing);
  });

  test(
    'an address write finishing after logout does not expose saved data',
    () async {
      final repository = _DelayedAddresses();
      final container = _container(addresses: repository);
      addTearDown(container.dispose);
      container.read(authControllerProvider.notifier).markAuthenticated();
      await container.read(customerAddressesProvider.future);
      final saving = container
          .read(customerAddressesProvider.notifier)
          .create(
            const CustomerAddressDraft(
              label: 'Work',
              addressLine: 'Private office',
              latitude: 34.526,
              longitude: 69.18,
            ),
          );
      await repository.started.future;
      container.read(authControllerProvider.notifier).continueAsGuest();
      expect(await container.read(customerAddressesProvider.future), isEmpty);
      repository.release.complete();
      await saving;
      expect(container.read(customerAddressesProvider).value, isEmpty);
    },
  );

  testWidgets(
    'checkout prefills account details and selects a newly mapped address, not the old default',
    (tester) async {
      final addresses = _Addresses();
      final orders = _Orders();
      final container = _container(addresses: addresses, orders: orders);
      addTearDown(container.dispose);
      container.read(authControllerProvider.notifier).markAuthenticated();
      await tester.pumpWidget(_app(container, const CheckoutScreen()));
      await tester.pumpAndSettle();
      final checkoutScroll = find
          .descendant(
            of: find.byType(ListView).first,
            matching: find.byType(Scrollable),
          )
          .first;
      await tester.scrollUntilVisible(
        find.text('Phone number'),
        160,
        scrollable: checkoutScroll,
      );
      await tester.pumpAndSettle();
      expect(find.text('Customer One'), findsOneWidget);
      expect(
        find.text('customer@example.com · From your Pakhlai account'),
        findsOneWidget,
      );
      final phone = tester.widget<TextFormField>(
        find.widgetWithText(TextFormField, 'Phone number'),
      );
      expect(phone.controller?.text, '0700123456');
      await tester.scrollUntilVisible(
        find.text('Use current location'),
        -160,
        scrollable: checkoutScroll,
      );
      await tester.pumpAndSettle();
      expect(find.text('Street 1, Kabul'), findsOneWidget);
      await tester.tap(find.text('Use current location'));
      await tester.pumpAndSettle();
      expect(find.text('Delivery pin selected'), findsOneWidget);
      await tester.tap(find.text('Confirm this location'));
      await tester.pumpAndSettle();
      final streetField = find.widgetWithText(
        TextFormField,
        'Street and building',
      );
      await tester.scrollUntilVisible(
        streetField,
        140,
        scrollable: find
            .descendant(
              of: find.byType(ListView).last,
              matching: find.byType(Scrollable),
            )
            .first,
      );
      await tester.pumpAndSettle();
      await tester.enterText(streetField, 'New building, street 2');
      final save = find.text('Save and use address');
      await tester.scrollUntilVisible(
        save,
        180,
        scrollable: find
            .descendant(
              of: find.byType(ListView).last,
              matching: find.byType(Scrollable),
            )
            .first,
      );
      await tester.pumpAndSettle();
      await tester.tap(save);
      await tester.pumpAndSettle();
      expect(addresses.values, hasLength(2));
      expect(find.text('New building, street 2'), findsOneWidget);
      final review = find.text('Review total');
      expect(review.hitTestable(), findsOneWidget);
      await tester.pumpAndSettle();
      await tester.tap(review);
      await tester.pumpAndSettle();
      expect(orders.reviewed?.addressId, addresses.values.last.id);
      expect(orders.reviewed?.addressId, isNot(addresses.values.first.id));
      expect(orders.reviewed?.contactPhone, '0700123456');
      expect(find.text('Total confirmed by the restaurant'), findsOneWidget);
      expect(addresses.values.first.isDefault, isTrue);
    },
  );

  testWidgets(
    'address card remains usable in RTL with larger text on a narrow screen',
    (tester) async {
      tester.view.physicalSize = const Size(320, 760);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      final container = _container();
      addTearDown(container.dispose);
      container.read(authControllerProvider.notifier).markAuthenticated();
      await tester.pumpWidget(
        _app(container, const CheckoutScreen(), rtl: true),
      );
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      final saved = find.text('Saved addresses');
      await tester.ensureVisible(saved);
      await tester.pumpAndSettle();
      await tester.tap(saved);
      await tester.pumpAndSettle();
      expect(
        find.text(
          'Your addresses stay saved when you sign out or restart the app.',
        ),
        findsOneWidget,
      );
      expect(tester.takeException(), isNull);
    },
  );
}

ProviderContainer _container({
  _Addresses? addresses,
  _Orders? orders,
  LocationService? location,
}) => ProviderContainer(
  overrides: [
    addressRepositoryProvider.overrideWithValue(addresses ?? _Addresses()),
    customerRepositoryProvider.overrideWithValue(const _Customer()),
    cartRepositoryProvider.overrideWithValue(_Cart()),
    marketplaceRepositoryProvider.overrideWithValue(const _Marketplace()),
    orderRepositoryProvider.overrideWithValue(orders ?? _Orders()),
    locationServiceProvider.overrideWithValue(location ?? const _Location()),
    mapTileProviderFactoryProvider.overrideWithValue(() => _BlankTiles()),
  ],
);

Widget _app(ProviderContainer container, Widget child, {bool rtl = false}) =>
    UncontrolledProviderScope(
      container: container,
      child: MaterialApp(
        theme: AppTheme.light,
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        builder: (context, content) => MediaQuery(
          data: MediaQuery.of(context)
              .copyWith(textScaler: TextScaler.linear(rtl ? 1.4 : 1)),
          child: Directionality(
            textDirection: rtl ? TextDirection.rtl : TextDirection.ltr,
            child: content!,
          ),
        ),
        home: child,
      ),
    );

class _BlankTiles extends TileProvider {
  @override
  ImageProvider getImage(TileCoordinates coordinates, TileLayer options) =>
      MemoryImage(
        base64Decode(
          'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        ),
      );
}

class _Location implements LocationService {
  const _Location({this.denied = false, this.accuracy = 20});
  final bool denied;
  final double accuracy;
  @override
  Future<DeliveryPoint> currentLocation() async {
    if (denied) {
      throw const AppException(
        'Permission denied',
        code: 'location_permission',
      );
    }
    return DeliveryPoint(34.526, 69.18, accuracyMeters: accuracy);
  }
}

class _Addresses implements AddressRepository {
  final values = <CustomerAddress>[
    const CustomerAddress(
      id: 1,
      label: 'Home',
      addressLine: 'Street 1',
      city: 'Kabul',
      latitude: 34.525,
      longitude: 69.178,
      isDefault: true,
    ),
  ];
  @override
  Future<List<CustomerAddress>> getAddresses() async => List.of(values);
  @override
  Future<CustomerAddress> createAddress(CustomerAddressDraft draft) async {
    final address = CustomerAddress(
      id: values.length + 1,
      label: draft.label,
      addressLine: draft.addressLine,
      area: draft.area,
      city: draft.city,
      instructions: draft.instructions,
      latitude: draft.latitude,
      longitude: draft.longitude,
      isDefault: draft.isDefault,
    );
    if (address.isDefault) {
      for (var i = 0; i < values.length; i++) {
        values[i] = values[i].copyWith(isDefault: false);
      }
    }
    values.add(address);
    return address;
  }

  @override
  Future<CustomerAddress> updateAddress(int id, CustomerAddressDraft draft) =>
      throw UnimplementedError();
  @override
  Future<void> deleteAddress(int id) async {
    values.removeWhere((a) => a.id == id);
  }

  @override
  Future<CustomerAddress> setDefault(int id) async {
    for (var i = 0; i < values.length; i++) {
      values[i] = values[i].copyWith(isDefault: values[i].id == id);
    }
    return values.firstWhere((a) => a.id == id);
  }
}

class _DelayedAddresses extends _Addresses {
  final started = Completer<void>();
  final release = Completer<void>();
  @override
  Future<CustomerAddress> createAddress(CustomerAddressDraft draft) async {
    started.complete();
    await release.future;
    return super.createAddress(draft);
  }
}

class _Customer implements CustomerRepository {
  const _Customer();
  @override
  Future<CustomerProfile> getProfile() async => const CustomerProfile(
    id: 1,
    username: 'Customer One',
    email: 'customer@example.com',
    phone: '0700123456',
    address: 'Legacy address',
    ordersCount: 0,
  );
}

const _branch = RestaurantBranch(
  id: 1,
  name: 'Main Branch',
  slug: 'main',
  status: RestaurantStatus.open,
  delivery: DeliveryInfo(available: true, baseFee: 50),
);
const _item = MarketplaceItem(
  id: 1,
  type: MarketplaceItemType.menuItem,
  name: 'Palaw',
  price: 250,
  restaurantId: 1,
  restaurantSlug: 'kitchen',
  restaurantName: 'Kitchen',
  isAvailable: true,
  categoryId: 1,
);
const _restaurant = Restaurant(
  id: 1,
  name: 'Kitchen',
  slug: 'kitchen',
  status: RestaurantStatus.open,
  delivery: DeliveryInfo(available: true, baseFee: 50),
  rating: RatingInfo(),
  branches: [_branch],
  cuisines: [],
  dishes: [_item],
);

class _Cart implements CartRepository {
  Cart value = Cart.withItem(
    item: _item,
    restaurant: _restaurant,
    branch: _branch,
    quantity: 1,
  );
  @override
  Future<Cart> restore() async => value;
  @override
  Future<void> save(Cart cart) async {
    value = cart;
  }

  @override
  Future<void> clear() async {
    value = Cart.empty();
  }
}

class _Marketplace implements MarketplaceRepository {
  const _Marketplace();
  @override
  Future<Restaurant> getRestaurant(String slug) async => _restaurant;
  @override
  Future<RestaurantMenu> getMenu({
    required Restaurant restaurant,
    required RestaurantBranch branch,
  }) async => const RestaurantMenu(
    categories: [
      MenuCategory(id: 1, name: 'Main', items: [_item]),
    ],
  );
  @override
  Future<DiscoveryData> discover({String query = '', int limit = 30}) async =>
      const DiscoveryData(
        restaurants: [_restaurant],
        cuisines: [],
        dishes: [_item],
      );
}

class _Orders implements OrderRepository {
  CheckoutRequest? reviewed;
  @override
  Future<CheckoutQuote> validateCheckout(CheckoutRequest request) async {
    reviewed = request;
    return CheckoutQuote(
      orderType: request.orderType,
      paymentMethod: 'cash_on_delivery',
      subtotal: 250,
      deliveryFee: 50,
      discount: 0,
      total: 300,
      items: const [
        CheckoutLineQuote(
          itemId: 1,
          itemType: MarketplaceItemType.menuItem,
          name: 'Palaw',
          quantity: 1,
          unitPrice: 250,
          subtotal: 250,
        ),
      ],
      quoteToken: 'server-quote',
    );
  }

  @override
  Future<CustomerOrderPage> getOrders({int page = 1}) async =>
      const CustomerOrderPage(items: [], hasNext: false);
  @override
  Future<CustomerOrder> getOrder(int id) => throw UnimplementedError();
  @override
  Future<CustomerOrder> createOrder(CheckoutRequest request) =>
      throw UnimplementedError();
  @override
  Future<CustomerOrder> retryOrder(Map<String, dynamic> request) =>
      throw UnimplementedError();
  @override
  Future<CustomerOrder> cancelOrder(int id) => throw UnimplementedError();
  @override
  Stream<OrderLiveEvent> watchOrder(int id) => const Stream.empty();
}
