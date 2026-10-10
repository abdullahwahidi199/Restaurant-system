import 'package:pakhlai_mobile/core/errors/customer_error_message.dart';

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:pakhlai_mobile/core/widgets/app_buttons.dart';
import 'package:pakhlai_mobile/core/widgets/divider_row.dart';
import 'package:pakhlai_mobile/core/widgets/price_text.dart';
import 'package:pakhlai_mobile/core/widgets/state_views.dart';
import 'package:pakhlai_mobile/features/orders/application/order_providers.dart';
import 'package:pakhlai_mobile/features/orders/data/order_repository.dart';
import 'package:pakhlai_mobile/features/orders/domain/order_models.dart';
import 'package:pakhlai_mobile/features/orders/presentation/orders_screen.dart';
import 'package:pakhlai_mobile/features/orders/presentation/order_status_label.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';

enum _LiveState { connecting, connected, disconnected, reconnecting, finished }

class OrderDetailScreen extends ConsumerStatefulWidget {
  const OrderDetailScreen({required this.orderId, super.key});
  final int orderId;
  @override
  ConsumerState<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends ConsumerState<OrderDetailScreen>
    with WidgetsBindingObserver {
  StreamSubscription<OrderLiveEvent>? _subscription;
  Timer? _poll;
  Timer? _reconnect;
  var _connection = _LiveState.connecting;
  bool _foreground = true,
      _visible = true,
      _final = false,
      _refreshing = false,
      _cancelling = false;
  int _attempts = 0;
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _visible = TickerMode.valuesOf(context).enabled;
    if (_visible && _foreground) {
      _start();
    } else {
      _stop();
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    _foreground = state == AppLifecycleState.resumed;
    if (_foreground && _visible) {
      _refresh();
      _start();
    } else {
      _stop();
    }
  }

  @override
  void dispose() {
    _stop();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  void _stop() {
    _poll?.cancel();
    _poll = null;
    _reconnect?.cancel();
    _reconnect = null;
    _subscription?.cancel();
    _subscription = null;
  }

  void _start() {
    if (_final || !mounted || !_foreground || !_visible) return;
    _poll ??= Timer.periodic(const Duration(seconds: 20), (_) => _refresh());
    if (_subscription == null && _reconnect == null) _connect();
  }

  void _connect() {
    if (!mounted || _final || !_foreground || !_visible) return;
    _connection = _attempts == 0
        ? _LiveState.connecting
        : _LiveState.reconnecting;
    _subscription = ref
        .read(orderRepositoryProvider)
        .watchOrder(widget.orderId)
        .listen(
          (event) {
            if (!mounted) return;
            setState(() {
              _connection = _LiveState.connected;
              _attempts = 0;
            });
            // Refresh on connection as well to recover missed events.
            _refresh();
          },
          onError: (Object _) => _disconnected(),
          onDone: _disconnected,
          cancelOnError: true,
        );
  }

  void _disconnected() {
    _subscription = null;
    if (!mounted || _final || !_foreground || !_visible || _reconnect != null) {
      return;
    }
    setState(() => _connection = _LiveState.disconnected);
    final seconds = [2, 5, 10, 20, 30][_attempts.clamp(0, 4)];
    _attempts++;
    _reconnect = Timer(Duration(seconds: seconds), () {
      _reconnect = null;
      if (mounted) {
        setState(() => _connection = _LiveState.reconnecting);
        _connect();
      }
    });
  }

  Future<void> _refresh() async {
    if (_refreshing || !mounted || !_foreground || !_visible) return;
    _refreshing = true;
    try {
      final refreshed = await ref.refresh(
        customerOrderProvider(widget.orderId).future,
      );
      _final = refreshed.isFinal;
      ref.invalidate(customerOrdersProvider);
    } catch (_) {
      /* Retry is available without exposing socket errors. */
    } finally {
      _refreshing = false;
    }
  }

  Future<void> _cancel() async {
    final s = AppLocalizations.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(s.cancelOrder),
        content: Text(s.cancelOrderPrompt),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(s.cancel),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(s.cancelOrder),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    setState(() => _cancelling = true);
    try {
      await ref.read(orderRepositoryProvider).cancelOrder(widget.orderId);
      await _refresh();
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(customerErrorMessage(error, s))));
      }
    } finally {
      if (mounted) setState(() => _cancelling = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = AppLocalizations.of(context);
    ref.listen(customerOrderProvider(widget.orderId), (_, next) {
      if (next.value?.isFinal == true && !_final) {
        _final = true;
        _connection = _LiveState.finished;
        _stop();
      }
    });
    return Scaffold(
      appBar: AppBar(title: Text(s.orderDetails)),
      body: ref
          .watch(customerOrderProvider(widget.orderId))
          .when(
            loading: () => const OrderSkeleton(),
            error: (error, _) => ErrorState(
              title: s.somethingWentWrong,
              description: customerErrorMessage(error, s),
              retryLabel: s.retry,
              onRetry: _refresh,
            ),
            data: (order) => RefreshIndicator(
              onRefresh: _refresh,
              child: ListView(
                padding: const EdgeInsets.all(20),
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  Text(
                    s.orderNumber(order.orderNumber),
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    [
                      order.restaurantName,
                      order.branchName,
                    ].whereType<String>().join(' · '),
                  ),
                  const SizedBox(height: 16),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            orderStatusLabel(order, s),
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          if (!order.isFinal) ...[
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Icon(
                                  _connection == _LiveState.connected
                                      ? Icons.wifi_rounded
                                      : Icons.sync_rounded,
                                  size: 16,
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    _connection == _LiveState.connected
                                        ? s.liveUpdates
                                        : s.refreshingUpdates,
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodySmall,
                                  ),
                                ),
                              ],
                            ),
                          ],
                          if (order.preparationTime != null && order.isActive)
                            Padding(
                              padding: const EdgeInsets.only(top: 8),
                              child: Text(
                                '${order.preparationTime} ${s.minutesShort}',
                              ),
                            ),
                          const SizedBox(height: 20),
                          _Timeline(order: order),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    s.itemsSummary,
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 8),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          for (final item in order.items)
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text('${item.quantity} × ${item.name}'),
                                        if (item.status == 'cancelled')
                                          Text(
                                            s.orderCancelled,
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodySmall,
                                          ),
                                        if (item.note?.isNotEmpty == true)
                                          Text(
                                            item.note!,
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodySmall,
                                          ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  PriceText(item.subtotal),
                                ],
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          DividerRow(
                            label: s.subtotal,
                            value: PriceText(order.subtotal),
                          ),
                          DividerRow(
                            label: s.deliveryFee,
                            value: PriceText(order.deliveryFee),
                          ),
                          if (order.discount > 0)
                            DividerRow(
                              label: s.discount,
                              value: PriceText(-order.discount),
                            ),
                          const Divider(),
                          DividerRow(
                            label: s.total,
                            value: PriceText(order.total),
                            emphasized: true,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            s.paymentMethod,
                            style: Theme.of(context).textTheme.titleSmall,
                          ),
                          Text(
                            order.orderType == CustomerOrderType.delivery
                                ? s.cashOnDelivery
                                : s.cashOnPickup,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            s.orderType,
                            style: Theme.of(context).textTheme.titleSmall,
                          ),
                          Text(
                            order.orderType == CustomerOrderType.delivery
                                ? s.delivery
                                : s.takeaway,
                          ),
                          if (order.address?.isNotEmpty == true) ...[
                            const SizedBox(height: 16),
                            Text(
                              s.address,
                              style: Theme.of(context).textTheme.titleSmall,
                            ),
                            Text(order.address!),
                          ],
                          if (order.phone?.isNotEmpty == true) ...[
                            const SizedBox(height: 16),
                            Text(
                              s.phone,
                              style: Theme.of(context).textTheme.titleSmall,
                            ),
                            Text(order.phone!),
                          ],
                          if (order.note?.isNotEmpty == true) ...[
                            const SizedBox(height: 16),
                            Text(
                              s.orderNote,
                              style: Theme.of(context).textTheme.titleSmall,
                            ),
                            Text(order.note!),
                          ],
                          for (final entry in [
                            (s.placedOn, order.createdAt),
                            (s.lastUpdated, order.updatedAt),
                          ])
                            if (entry.$2 != null) ...[
                              const SizedBox(height: 16),
                              Text(
                                entry.$1,
                                style: Theme.of(context).textTheme.titleSmall,
                              ),
                              Text(
                                DateFormat.yMMMd().add_jm().format(
                                  entry.$2!.toLocal(),
                                ),
                              ),
                            ],
                        ],
                      ),
                    ),
                  ),
                  if (order.status == 'pending' &&
                      order.createdAt != null &&
                      DateTime.now().difference(order.createdAt!) <
                          const Duration(minutes: 2)) ...[
                    const SizedBox(height: 16),
                    PrimaryButton(
                      label: s.cancelOrder,
                      loading: _cancelling,
                      onPressed: _cancel,
                    ),
                  ],
                ],
              ),
            ),
          ),
    );
  }
}

class _Timeline extends StatelessWidget {
  const _Timeline({required this.order});
  final CustomerOrder order;
  @override
  Widget build(BuildContext context) {
    final s = AppLocalizations.of(context);
    if (order.phase == OrderPhase.cancelled) {
      return Row(
        children: [
          Icon(
            Icons.cancel_outlined,
            color: Theme.of(context).colorScheme.error,
          ),
          const SizedBox(width: 12),
          Expanded(child: Text(s.orderCancelled)),
        ],
      );
    }
    final delivery = order.orderType == CustomerOrderType.delivery;
    // Existing Order has no confirmed milestone; do not invent one.
    final stages = <(OrderPhase, String)>[
      (OrderPhase.received, s.orderReceived),
      (OrderPhase.preparing, s.preparingFood),
      (OrderPhase.ready, s.orderReady),
      if (delivery) (OrderPhase.outForDelivery, s.outForDelivery),
      (OrderPhase.finished, delivery ? s.orderDelivered : s.orderPickedUp),
    ];
    final current = stages.indexWhere((stage) => stage.$1 == order.phase);
    return Semantics(
      label: '${s.orderProgress}: ${orderStatusLabel(order, s)}',
      child: Column(
        children: [
          for (var i = 0; i < stages.length; i++)
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Column(
                  children: [
                    Icon(
                      i < current
                          ? Icons.check_circle_rounded
                          : i == current
                          ? Icons.radio_button_checked_rounded
                          : Icons.radio_button_unchecked_rounded,
                      size: 20,
                      color: i <= current
                          ? Theme.of(context).colorScheme.primary
                          : Theme.of(context).colorScheme.outline,
                    ),
                    if (i < stages.length - 1)
                      Container(
                        width: 2,
                        height: 24,
                        color: Theme.of(context).colorScheme.outlineVariant,
                      ),
                  ],
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 20),
                    child: Text(
                      stages[i].$2,
                      style: i == current
                          ? Theme.of(context).textTheme.titleSmall
                          : Theme.of(context).textTheme.bodyMedium,
                    ),
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }
}
