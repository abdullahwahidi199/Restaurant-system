import 'package:pakhlai_mobile/core/errors/customer_error_message.dart';

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:pakhlai_mobile/core/theme/app_colors.dart';
import 'package:pakhlai_mobile/core/theme/app_radius.dart';
import 'package:pakhlai_mobile/core/theme/app_spacing.dart';
import 'package:pakhlai_mobile/core/widgets/app_badge.dart';
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
                  _TrackingHero(order: order, connection: _connection),
                  const SizedBox(height: AppSpacing.lg),
                  _TrackingProgressCard(order: order),
                  const SizedBox(height: AppSpacing.xl),
                  Row(
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: AppColors.brandSoft,
                          borderRadius: BorderRadius.circular(AppRadius.sm),
                        ),
                        child: const Icon(
                          Icons.shopping_bag_outlined,
                          color: AppColors.brandDark,
                          size: 19,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          s.itemsSummary,
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                      ),
                      AppBadge(
                        label: s.itemCount(
                          order.items.fold<int>(
                            0,
                            (count, item) => count + item.quantity,
                          ),
                        ),
                        tone: AppBadgeTone.brand,
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          for (
                            var index = 0;
                            index < order.items.length;
                            index++
                          ) ...[
                            _OrderItemRow(item: order.items[index]),
                            if (index != order.items.length - 1)
                              const Divider(height: 1),
                          ],
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
                          Row(
                            children: [
                              const Icon(
                                Icons.receipt_long_rounded,
                                color: AppColors.brandDark,
                                size: 21,
                              ),
                              const SizedBox(width: 9),
                              Text(
                                s.orderDetails,
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          const Divider(height: 1),
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
                          const Divider(height: 1),
                          _OrderInfoRow(
                            icon: Icons.payments_outlined,
                            label: s.paymentMethod,
                            value: order.orderType == CustomerOrderType.delivery
                                ? s.cashOnDelivery
                                : s.cashOnPickup,
                          ),
                          _OrderInfoRow(
                            icon: order.orderType == CustomerOrderType.delivery
                                ? Icons.delivery_dining_rounded
                                : Icons.shopping_bag_outlined,
                            label: s.orderType,
                            value: order.orderType == CustomerOrderType.delivery
                                ? s.delivery
                                : s.takeaway,
                          ),
                          if (order.address?.isNotEmpty == true)
                            _OrderInfoRow(
                              icon: Icons.location_on_outlined,
                              label: s.address,
                              value: order.address!,
                            ),
                          if (order.phone?.isNotEmpty == true)
                            _OrderInfoRow(
                              icon: Icons.phone_outlined,
                              label: s.phone,
                              value: order.phone!,
                            ),
                          if (order.note?.isNotEmpty == true)
                            _OrderInfoRow(
                              icon: Icons.sticky_note_2_outlined,
                              label: s.orderNote,
                              value: order.note!,
                            ),
                          for (final entry in [
                            (
                              Icons.schedule_rounded,
                              s.placedOn,
                              order.createdAt,
                            ),
                            (
                              Icons.update_rounded,
                              s.lastUpdated,
                              order.updatedAt,
                            ),
                          ])
                            if (entry.$3 != null)
                              _OrderInfoRow(
                                icon: entry.$1,
                                label: entry.$2,
                                value: DateFormat.yMMMd().add_jm().format(
                                  entry.$3!.toLocal(),
                                ),
                              ),
                        ],
                      ),
                    ),
                  ),
                  if (order.status == 'pending' &&
                      order.createdAt != null &&
                      DateTime.now().difference(order.createdAt!) <
                          const Duration(minutes: 2)) ...[
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: _cancelling ? null : _cancel,
                        icon: _cancelling
                            ? const SizedBox.square(
                                dimension: 17,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              )
                            : const Icon(Icons.close_rounded, size: 18),
                        label: Text(s.cancelOrder),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.error,
                          side: const BorderSide(color: AppColors.error),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
    );
  }
}

class _TrackingHero extends StatelessWidget {
  const _TrackingHero({required this.order, required this.connection});

  final CustomerOrder order;
  final _LiveState connection;

  @override
  Widget build(BuildContext context) {
    final s = AppLocalizations.of(context);
    final cancelled = order.phase == OrderPhase.cancelled;
    final connected = connection == _LiveState.connected;
    final statusColor = cancelled ? AppColors.error : Colors.white;
    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: AlignmentDirectional.topStart,
          end: AlignmentDirectional.bottomEnd,
          colors: cancelled
              ? const [Color(0xFFE55B63), Color(0xFF9F2730)]
              : const [Color(0xFFFF783E), AppColors.brand, AppColors.brandDark],
        ),
        borderRadius: BorderRadius.circular(AppRadius.xl),
        boxShadow: [
          BoxShadow(
            color: (cancelled ? AppColors.error : AppColors.brand).withValues(
              alpha: .24,
            ),
            blurRadius: 30,
            offset: const Offset(0, 13),
          ),
        ],
      ),
      child: Stack(
        children: [
          PositionedDirectional(
            top: -52,
            end: -42,
            child: Container(
              width: 150,
              height: 150,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: .08),
                shape: BoxShape.circle,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(AppSpacing.xl),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      flex: 1,
                      child: Text(
                        s.orderNumber(order.orderNumber),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.labelLarge?.copyWith(
                          color: Colors.white.withValues(alpha: .78),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Flexible(
                      flex: 2,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: .15),
                          borderRadius: BorderRadius.circular(AppRadius.pill),
                          border: Border.all(
                            color: Colors.white.withValues(alpha: .20),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              order.isFinal
                                  ? Icons.check_circle_rounded
                                  : connected
                                  ? Icons.wifi_rounded
                                  : Icons.sync_rounded,
                              size: 14,
                              color: Colors.white,
                            ),
                            const SizedBox(width: 5),
                            Flexible(
                              child: Text(
                                order.isFinal
                                    ? orderStatusLabel(order, s)
                                    : connected
                                    ? s.liveUpdates
                                    : s.refreshingUpdates,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: Theme.of(context).textTheme.labelSmall
                                    ?.copyWith(color: Colors.white),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.xl),
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 360),
                  transitionBuilder: (child, animation) => FadeTransition(
                    opacity: animation,
                    child: SlideTransition(
                      position: Tween<Offset>(
                        begin: const Offset(0, .12),
                        end: Offset.zero,
                      ).animate(animation),
                      child: child,
                    ),
                  ),
                  child: Text(
                    orderStatusLabel(order, s),
                    key: ValueKey(order.status),
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      color: statusColor,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                const SizedBox(height: 7),
                Text(
                  [
                    order.restaurantName,
                    order.branchName,
                  ].whereType<String>().join(' · '),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodyMedium
                      ?.copyWith(color: Colors.white.withValues(alpha: .80)),
                ),
                if (order.preparationTime != null && order.isActive) ...[
                  const SizedBox(height: AppSpacing.lg),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 11,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: .14),
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.schedule_rounded,
                          color: Colors.white,
                          size: 17,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          '${order.preparationTime} ${s.minutesShort}',
                          style: Theme.of(context).textTheme.labelLarge
                              ?.copyWith(color: Colors.white),
                        ),
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: AppSpacing.xl),
                ClipRRect(
                  borderRadius: BorderRadius.circular(AppRadius.pill),
                  child: LinearProgressIndicator(
                    value: _trackingProgress(order.phase),
                    minHeight: 7,
                    color: Colors.white,
                    backgroundColor: Colors.white.withValues(alpha: .22),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _TrackingProgressCard extends StatelessWidget {
  const _TrackingProgressCard({required this.order});

  final CustomerOrder order;

  @override
  Widget build(BuildContext context) {
    final s = AppLocalizations.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: AppColors.brandSoft,
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                  child: const Icon(
                    Icons.route_rounded,
                    color: AppColors.brandDark,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    s.orderProgress,
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ),
                Flexible(
                  child: AppBadge(
                    label: orderStatusLabel(order, s),
                    tone: order.phase == OrderPhase.cancelled
                        ? AppBadgeTone.error
                        : order.isFinal
                        ? AppBadgeTone.success
                        : AppBadgeTone.warning,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xl),
            _Timeline(order: order),
          ],
        ),
      ),
    );
  }
}

class _OrderItemRow extends StatelessWidget {
  const _OrderItemRow({required this.item});

  final CustomerOrderItem item;

  @override
  Widget build(BuildContext context) {
    final s = AppLocalizations.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 38,
            height: 38,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: AppColors.brandSoft,
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
            child: Text(
              '${item.quantity}×',
              style: Theme.of(context).textTheme.labelMedium
                  ?.copyWith(color: AppColors.brandDark),
            ),
          ),
          const SizedBox(width: 11),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.name, style: Theme.of(context).textTheme.titleSmall),
                if (item.status == 'cancelled')
                  Text(
                    s.orderCancelled,
                    style: Theme.of(context).textTheme.bodySmall
                        ?.copyWith(color: AppColors.error),
                  ),
                if (item.note?.isNotEmpty == true)
                  Text(
                    item.note!,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          PriceText(item.subtotal),
        ],
      ),
    );
  }
}

class _OrderInfoRow extends StatelessWidget {
  const _OrderInfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(top: 14),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 34,
          height: 34,
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surfaceContainer,
            borderRadius: BorderRadius.circular(AppRadius.sm),
          ),
          child: Icon(icon, size: 18, color: AppColors.brandDark),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: Theme.of(context).textTheme.labelSmall),
              const SizedBox(height: 2),
              Text(value, style: Theme.of(context).textTheme.bodyMedium),
            ],
          ),
        ),
      ],
    ),
  );
}

double _trackingProgress(OrderPhase phase) => switch (phase) {
  OrderPhase.received => .10,
  OrderPhase.confirmed => .25,
  OrderPhase.preparing => .45,
  OrderPhase.ready => .65,
  OrderPhase.outForDelivery => .82,
  OrderPhase.finished || OrderPhase.cancelled => 1,
  OrderPhase.unknown => .05,
};

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
    final stages = <(OrderPhase, String, IconData)>[
      (OrderPhase.received, s.orderReceived, Icons.receipt_long_rounded),
      (OrderPhase.confirmed, s.restaurantConfirmed, Icons.storefront_rounded),
      (OrderPhase.preparing, s.preparingFood, Icons.soup_kitchen_rounded),
      (OrderPhase.ready, s.orderReady, Icons.shopping_bag_rounded),
      if (delivery)
        (
          OrderPhase.outForDelivery,
          s.outForDelivery,
          Icons.delivery_dining_rounded,
        ),
      (
        OrderPhase.finished,
        delivery ? s.orderDelivered : s.orderPickedUp,
        Icons.celebration_rounded,
      ),
    ];
    final matched = stages.indexWhere((stage) => stage.$1 == order.phase);
    final current = matched < 0 ? 0 : matched;
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
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 320),
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: i <= current
                            ? i == current
                                  ? AppColors.brand
                                  : AppColors.brandSoft
                            : Theme.of(context).colorScheme.surfaceContainer,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: i <= current
                              ? AppColors.brand
                              : Theme.of(context).colorScheme.outlineVariant,
                        ),
                      ),
                      child: Icon(
                        i < current ? Icons.check_rounded : stages[i].$3,
                        size: 19,
                        color: i == current
                            ? Colors.white
                            : i < current
                            ? AppColors.brandDark
                            : Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                    if (i < stages.length - 1)
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 320),
                        width: 2,
                        height: 38,
                        color: i < current
                            ? AppColors.brand
                            : Theme.of(context).colorScheme.outlineVariant,
                      ),
                  ],
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 320),
                    constraints: const BoxConstraints(minHeight: 38),
                    padding: EdgeInsets.symmetric(
                      horizontal: i == current ? 12 : 0,
                      vertical: i == current ? 9 : 8,
                    ),
                    decoration: BoxDecoration(
                      color: i == current
                          ? AppColors.brandSoft
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                    ),
                    child: Text(
                      stages[i].$2,
                      style: i == current
                          ? Theme.of(context).textTheme.titleSmall
                                ?.copyWith(color: AppColors.brandDark)
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
