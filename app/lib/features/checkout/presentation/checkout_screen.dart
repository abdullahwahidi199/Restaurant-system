import 'package:pakhlai_mobile/features/checkout/presentation/checkout_address_card.dart';
import 'package:pakhlai_mobile/features/customers/domain/customer_models.dart';
import 'package:pakhlai_mobile/core/errors/customer_error_message.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pakhlai_mobile/app/router/app_routes.dart';
import 'package:pakhlai_mobile/core/errors/app_exception.dart';
import 'package:pakhlai_mobile/core/widgets/app_buttons.dart';
import 'package:pakhlai_mobile/core/widgets/app_text_field.dart';
import 'package:pakhlai_mobile/core/widgets/divider_row.dart';
import 'package:pakhlai_mobile/core/widgets/price_text.dart';
import 'package:pakhlai_mobile/core/widgets/state_views.dart';
import 'package:pakhlai_mobile/features/addresses/application/customer_addresses_controller.dart';
import 'package:pakhlai_mobile/features/addresses/domain/customer_address.dart';
import 'package:pakhlai_mobile/features/addresses/presentation/addresses_screen.dart';
import 'package:pakhlai_mobile/features/cart/application/cart_controller.dart';
import 'package:pakhlai_mobile/features/cart/domain/cart_models.dart';
import 'package:pakhlai_mobile/features/customers/application/customer_providers.dart';
import 'package:pakhlai_mobile/features/orders/application/order_providers.dart';
import 'package:pakhlai_mobile/features/orders/data/order_repository.dart';
import 'package:pakhlai_mobile/features/orders/data/pending_order_store.dart';
import 'package:pakhlai_mobile/features/orders/domain/order_models.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});
  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phone = TextEditingController();
  final _instructions = TextEditingController();
  var _orderType = CustomerOrderType.delivery;
  CustomerProfile? _profile;
  int? _addressId;
  int? _customerId;
  bool _loading = true;
  bool _busy = false;
  String? _error;
  String? _notice;
  CheckoutQuote? _quote;
  Map<String, dynamic>? _pending;
  bool _submissionResolved = false;
  String? _reviewedCart;

  @override
  void initState() {
    super.initState();
    _phone.addListener(_invalidateQuote);
    _instructions.addListener(_invalidateQuote);
    Future.microtask(_load);
  }

  @override
  void dispose() {
    _phone.dispose();
    _instructions.dispose();
    super.dispose();
  }

  void _invalidateQuote() {
    if (_quote != null && mounted) setState(() => _quote = null);
  }

  Future<void> _load() async {
    if (mounted) {
      setState(() {
        _loading = true;
        _error = null;
      });
    }
    try {
      final profile = await ref.read(customerProfileProvider.future);
      if (!mounted) return;
      _profile = profile;
      _customerId = profile.id;
      if (_phone.text.isEmpty) _phone.text = profile.phone ?? '';
      final pending = await ref
          .read(pendingOrderStoreProvider)
          .read(profile.id);
      if (!mounted) return;
      _pending = pending;
      _submissionResolved = true;
      final addresses = await ref.read(customerAddressesProvider.future);
      if (!mounted) return;
      final selected =
          addresses.where((a) => a.isDefault).firstOrNull ??
          addresses.firstOrNull;
      _addressId = selected?.id;
      if (_instructions.text.isEmpty) {
        _instructions.text = selected?.instructions ?? '';
      }
      if (pending == null) {
        try {
          final review = await ref
              .read(cartControllerProvider.notifier)
              .revalidate();
          if (!mounted) return;
          if (review.changed) {
            _notice = review.removedNames.isNotEmpty
                ? '${AppLocalizations.of(context).cartUnavailableRemoved} ${review.removedNames.join(', ')}'
                : AppLocalizations.of(context).reviewPrices;
          }
        } catch (error) {
          if (mounted) {
            _error = customerErrorMessage(error, AppLocalizations.of(context));
          }
        }
      }
    } catch (error) {
      if (mounted) {
        _error = customerErrorMessage(error, AppLocalizations.of(context));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _selectAddress(CustomerAddress address) {
    setState(() {
      _addressId = address.id;
      _instructions.text = address.instructions ?? '';
      _quote = null;
      _error = null;
    });
  }

  Future<void> _editAddress({
    CustomerAddress? address,
    bool current = false,
    bool map = false,
  }) async {
    final saved = await showAddressEditor(
      context,
      ref,
      address: address,
      prefillAddress: address == null ? _profile?.address : null,
      useCurrentLocation: current,
      openMapOnStart: map,
      requirePin: true,
      saveAndUse: true,
    );
    if (saved != null && mounted) {
      _selectAddress(saved);
      HapticFeedback.selectionClick();
    }
  }

  Future<void> _chooseSavedAddress() async {
    final id = await showSavedAddressPicker(context, selectedId: _addressId);
    if (id == null || !mounted) return;
    final address = ref
        .read(customerAddressesProvider)
        .value
        ?.where((a) => a.id == id)
        .firstOrNull;
    if (address != null) _selectAddress(address);
  }

  CheckoutRequest _request(Cart cart, {String? key, String? quoteToken}) =>
      CheckoutRequest(
        cart: cart,
        orderType: _orderType,
        addressId: _addressId,
        contactPhone: _phone.text,
        deliveryInstructions: _orderType == CustomerOrderType.delivery
            ? _instructions.text
            : '',
        idempotencyKey: key,
        quoteToken: quoteToken,
      );

  Future<void> _review(Cart cart) async {
    if (_busy) return;
    final s = AppLocalizations.of(context);
    // ListView may not have built an off-screen field. Validate the controller
    // as well so the fixed review button cannot skip contact validation.
    if (!_validPhone(_phone.text)) {
      _formKey.currentState?.validate();
      setState(() => _error = s.invalidPhone);
      return;
    }
    if (!(_formKey.currentState?.validate() ?? false)) return;
    if (_orderType == CustomerOrderType.delivery && _addressId == null) {
      setState(() => _error = s.chooseAddress);
      return;
    }
    if (_orderType == CustomerOrderType.delivery) {
      final selected = ref
          .read(customerAddressesProvider)
          .value
          ?.where((a) => a.id == _addressId)
          .firstOrNull;
      if (selected?.hasLocation != true) {
        setState(() => _error = s.pinMissing);
        return;
      }
    }
    setState(() {
      _busy = true;
      _error = null;
      _quote = null;
    });
    try {
      final quote = await ref
          .read(orderRepositoryProvider)
          .validateCheckout(_request(cart));
      final pricesChanged = quote.items.any(
        (line) => cart.items.any(
          (item) =>
              item.key == line.cartKey &&
              (item.unitPrice - line.unitPrice).abs() >= .005,
        ),
      );
      await ref
          .read(cartControllerProvider.notifier)
          .applyAuthoritativePricing(
            unitPrices: {
              for (final item in quote.items) item.cartKey: item.unitPrice,
            },
            deliveryFee: quote.deliveryFee,
            discount: quote.discount,
          );
      if (!mounted) return;
      setState(() {
        _quote = quote;
        _reviewedCart = ref.read(cartControllerProvider).value?.encode();
        if (pricesChanged) _notice = s.reviewPrices;
      });
    } catch (error) {
      await _handleError(error);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _place(Cart cart) async {
    if (_busy || _customerId == null) return;
    if (_quote == null || _reviewedCart != cart.encode()) {
      await _review(cart);
      return;
    }
    final request = _request(
      cart,
      key: PendingOrderStore.createKey(),
      quoteToken: _quote!.quoteToken,
    ).toJson();
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await ref.read(pendingOrderStoreProvider).save(_customerId!, request);
      _pending = request;
      final order = await ref.read(orderRepositoryProvider).retryOrder(request);
      await _completed(order);
    } catch (error) {
      await _handleError(error, submitted: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _retryPending() async {
    if (_busy || _pending == null) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final order = await ref
          .read(orderRepositoryProvider)
          .retryOrder(_pending!);
      await _completed(order);
    } catch (error) {
      await _handleError(error, submitted: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _completed(CustomerOrder order) async {
    await ref.read(cartControllerProvider.notifier).clear();
    await ref.read(pendingOrderStoreProvider).clear(_customerId!);
    ref.invalidate(customerOrdersProvider);
    ref.invalidate(customerProfileProvider);
    if (!mounted) return;
    HapticFeedback.lightImpact();
    context.go(AppRoutes.orderSuccessPath(order.id), extra: order);
  }

  Future<void> _handleError(Object error, {bool submitted = false}) async {
    if (!mounted) return;
    final s = AppLocalizations.of(context);
    if (error is AppException) {
      final code = error.code;
      final definitiveRejection = const {
        '400',
        '403',
        '404',
        '409',
        'item_unavailable',
        'item_quantity_unavailable',
        'quote_expired',
        'price_changed',
        'minimum_order',
        'delivery_unavailable',
        'address_location_required',
        'delivery_location_unavailable',
        'outside_delivery_area',
      }.contains(code);
      if (submitted && definitiveRejection) {
        await ref.read(pendingOrderStoreProvider).clear(_customerId!);
        _pending = null;
      }
      final unavailable = error.details?['items'];
      if ((code == 'item_unavailable' || code == 'item_quantity_unavailable') &&
          unavailable is List) {
        for (final line in unavailable.whereType<Map>()) {
          final type = line['item_type'] == 'platter' ? 'platter' : 'menuItem';
          final key = '$type:${line['item_id']}';
          final quantity = line['available_quantity'];
          if (quantity is int && quantity > 0) {
            await ref
                .read(cartControllerProvider.notifier)
                .setQuantity(key, quantity);
          } else {
            await ref.read(cartControllerProvider.notifier).removeItem(key);
          }
        }
        _notice = s.cartUnavailableRemoved;
      }
    }
    if (mounted) {
      setState(() {
        _quote = null;
        _error = customerErrorMessage(error, s);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = AppLocalizations.of(context);
    final cart = ref.watch(cartControllerProvider).value ?? Cart.empty();
    final addresses =
        ref.watch(customerAddressesProvider).value ?? const <CustomerAddress>[];
    final selectedAddress = addresses
        .where((a) => a.id == _addressId)
        .firstOrNull;
    return PopScope(
      canPop: !_busy,
      child: Scaffold(
        appBar: AppBar(title: Text(s.checkout)),
        bottomNavigationBar:
            !_loading &&
                _submissionResolved &&
                _pending == null &&
                cart.isNotEmpty
            ? _checkoutFooter(context, cart)
            : null,
        body: _loading
            ? const LoadingState()
            : !_submissionResolved
            ? ErrorState(
                title: s.somethingWentWrong,
                description: _error ?? s.actionFailed,
                retryLabel: s.retry,
                onRetry: _load,
              )
            : _pending != null
            ? Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.receipt_long_outlined, size: 48),
                      const SizedBox(height: 16),
                      Text(
                        s.orderSubmissionUnknown,
                        textAlign: TextAlign.center,
                      ),
                      if (_error != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 12),
                          child: Text(_error!, textAlign: TextAlign.center),
                        ),
                      const SizedBox(height: 24),
                      PrimaryButton(
                        label: s.resumeOrder,
                        loading: _busy,
                        onPressed: _retryPending,
                      ),
                    ],
                  ),
                ),
              )
            : cart.isEmpty
            ? EmptyState(
                icon: Icons.shopping_bag_outlined,
                title: s.emptyCart,
                description: s.emptyCartDescription,
              )
            : AbsorbPointer(
                absorbing: _busy,
                child: Form(
                  key: _formKey,
                  child: ListView(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
                    children: [
                      Text(
                        cart.restaurantName ?? '',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      Text(
                        cart.branchName ?? '',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        s.checkoutIntro,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      const SizedBox(height: 24),
                      _section(
                        context,
                        s.orderType,
                        SegmentedButton<CustomerOrderType>(
                          segments: [
                            ButtonSegment(
                              value: CustomerOrderType.delivery,
                              label: Text(s.delivery),
                              icon: const Icon(Icons.delivery_dining_rounded),
                            ),
                            ButtonSegment(
                              value: CustomerOrderType.takeaway,
                              label: Text(s.takeaway),
                              icon: const Icon(Icons.shopping_bag_outlined),
                            ),
                          ],
                          selected: {_orderType},
                          onSelectionChanged: (value) => setState(() {
                            _orderType = value.single;
                            _quote = null;
                          }),
                        ),
                      ),
                      if (_orderType == CustomerOrderType.delivery)
                        _section(
                          context,
                          s.deliveryAddress,
                          CheckoutAddressCard(
                            address: selectedAddress,
                            onChange: _chooseSavedAddress,
                            onCurrentLocation: () =>
                                _editAddress(current: true),
                            onMap: () => _editAddress(map: true),
                            onEdit: () =>
                                _editAddress(address: selectedAddress),
                          ),
                        ),
                      _section(
                        context,
                        s.contactDetails,
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            if (_profile != null) ...[
                              Card(
                                child: ListTile(
                                  leading: const Icon(
                                    Icons.person_outline_rounded,
                                  ),
                                  title: Text(_profile!.username),
                                  subtitle: Text(
                                    [
                                      ?_profile!.email,
                                      s.accountPrefilled,
                                    ].join(' · '),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 12),
                            ],
                            AppTextField(
                              controller: _phone,
                              label: s.phone,
                              prefixIcon: Icons.phone_outlined,
                              keyboardType: TextInputType.phone,
                              autofillHints: const [
                                AutofillHints.telephoneNumber,
                              ],
                              validator: (value) {
                                return _validPhone(value ?? '')
                                    ? null
                                    : s.invalidPhone;
                              },
                            ),
                          ],
                        ),
                      ),
                      if (_orderType == CustomerOrderType.delivery)
                        _section(
                          context,
                          s.deliveryInstructions,
                          AppTextField(
                            controller: _instructions,
                            hint: s.addInstructions,
                            maxLines: 2,
                          ),
                        ),
                      _section(
                        context,
                        s.paymentMethod,
                        Card(
                          child: ListTile(
                            leading: const Icon(Icons.payments_outlined),
                            title: Text(
                              _orderType == CustomerOrderType.delivery
                                  ? s.cashOnDelivery
                                  : s.cashOnPickup,
                            ),
                            subtitle: Text(s.cashPaymentHelp),
                          ),
                        ),
                      ),
                      _section(
                        context,
                        s.itemsSummary,
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: Column(
                              children: [
                                for (final item in cart.items)
                                  DividerRow(
                                    label: '${item.quantity} × ${item.name}',
                                    value: PriceText(item.subtotal),
                                  ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Column(
                            children: [
                              DividerRow(
                                label: s.subtotal,
                                value: PriceText(
                                  _quote?.subtotal ?? cart.subtotal,
                                ),
                              ),
                              if (_quote != null &&
                                  _orderType == CustomerOrderType.delivery)
                                DividerRow(
                                  label: s.deliveryFee,
                                  value: PriceText(_quote!.deliveryFee),
                                ),
                              if ((_quote?.discount ?? 0) > 0)
                                DividerRow(
                                  label: s.discount,
                                  value: PriceText(-_quote!.discount),
                                ),
                              const Divider(height: 1),
                              DividerRow(
                                label: s.total,
                                value: PriceText(
                                  _quote?.total ?? cart.subtotal,
                                ),
                                emphasized: true,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
      ),
    );
  }

  static bool _validPhone(String value) {
    final phone = value.trim();
    final digits = phone.replaceAll(RegExp(r'[^0-9]'), '');
    return digits.length >= 7 &&
        digits.length <= 15 &&
        phone.length <= 15 &&
        RegExp(r'^\+?[0-9][0-9\s()-]*[0-9]$').hasMatch(phone);
  }

  Widget _checkoutFooter(BuildContext context, Cart cart) {
    final s = AppLocalizations.of(context);
    final theme = Theme.of(context);
    return Material(
      color: theme.colorScheme.surface,
      elevation: 6,
      child: SafeArea(
        top: false,
        child: ConstrainedBox(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.sizeOf(context).height * .4,
          ),
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(20, 14, 20, 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (_error != null) ...[
                  Semantics(
                    liveRegion: true,
                    child: Text(
                      _error!,
                      style: TextStyle(color: theme.colorScheme.error),
                    ),
                  ),
                  const SizedBox(height: 10),
                ],
                if (_notice != null) ...[
                  Text(_notice!, style: theme.textTheme.bodySmall),
                  const SizedBox(height: 10),
                ],
                Row(
                  children: [
                    Expanded(
                      child: Text(s.total, style: theme.textTheme.titleSmall),
                    ),
                    Flexible(
                      child: PriceText(
                        _quote?.total ?? cart.subtotal,
                        style: theme.textTheme.titleLarge,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  _quote == null ? s.checkoutPending : s.checkoutReviewed,
                  style: theme.textTheme.bodySmall,
                ),
                const SizedBox(height: 12),
                PrimaryButton(
                  label: _quote == null ? s.reviewTotal : s.placeOrder,
                  icon: Icons.arrow_forward_rounded,
                  loading: _busy,
                  onPressed: _quote == null
                      ? () => _review(cart)
                      : () => _place(cart),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _section(BuildContext context, String title, Widget child) => Padding(
    padding: const EdgeInsets.only(bottom: 24),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(title, style: Theme.of(context).textTheme.titleSmall),
        const SizedBox(height: 10),
        child,
      ],
    ),
  );
}
