import 'package:pakhlai_mobile/core/errors/customer_error_message.dart';

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:pakhlai_mobile/app/router/app_routes.dart';
import 'package:pakhlai_mobile/core/widgets/app_badge.dart';
import 'package:pakhlai_mobile/core/widgets/price_text.dart';
import 'package:pakhlai_mobile/core/widgets/state_views.dart';
import 'package:pakhlai_mobile/features/auth/application/auth_controller.dart';
import 'package:pakhlai_mobile/features/auth/domain/auth_status.dart';
import 'package:pakhlai_mobile/features/auth/presentation/guest_gate.dart';
import 'package:pakhlai_mobile/features/orders/application/order_providers.dart';
import 'package:pakhlai_mobile/features/orders/data/order_repository.dart';
import 'package:pakhlai_mobile/features/orders/domain/order_models.dart';
import 'package:pakhlai_mobile/features/orders/presentation/order_status_label.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';

class OrdersScreen extends ConsumerStatefulWidget {
  const OrdersScreen({super.key});
  @override
  ConsumerState<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends ConsumerState<OrdersScreen>
    with WidgetsBindingObserver {
  final _extra = <CustomerOrder>[];
  int _page = 1, _generation = 0;
  bool _past = false, _loadingMore = false, _hasMore = true, _foreground = true;
  Timer? _timer;
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _timer = Timer.periodic(const Duration(seconds: 30), (_) {
      if (mounted &&
          _foreground &&
          TickerMode.valuesOf(context).enabled &&
          ref.read(authControllerProvider) == AuthStatus.authenticated) {
        _refresh();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    _foreground = state == AppLifecycleState.resumed;
    if (_foreground &&
        mounted &&
        TickerMode.valuesOf(context).enabled &&
        ref.read(authControllerProvider) == AuthStatus.authenticated) {
      _refresh();
    }
  }

  Future<void> _refresh() async {
    _generation++;
    if (mounted) {
      setState(() {
        _extra.clear();
        _page = 1;
        _hasMore = true;
        _loadingMore = false;
      });
    }
    try {
      final refreshed = await ref.refresh(customerOrdersProvider.future);
      _hasMore = refreshed.hasNext;
    } catch (_) {
      /* Provider renders retry. */
    }
  }

  Future<void> _loadMore() async {
    if (_loadingMore) return;
    final generation = _generation;
    setState(() => _loadingMore = true);
    try {
      final page = await ref
          .read(orderRepositoryProvider)
          .getOrders(page: _page + 1);
      if (!mounted || generation != _generation) return;
      setState(() {
        _extra.addAll(page.items);
        _page++;
        _hasMore = page.hasNext;
      });
    } catch (error) {
      if (mounted && generation == _generation) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              customerErrorMessage(error, AppLocalizations.of(context)),
            ),
          ),
        );
      }
    } finally {
      if (mounted && generation == _generation) {
        setState(() => _loadingMore = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = AppLocalizations.of(context);
    final auth = ref.watch(authControllerProvider);
    ref.listen(authControllerProvider, (_, next) {
      if (next != AuthStatus.authenticated) {
        _generation++;
        _extra.clear();
        _page = 1;
        _hasMore = true;
      }
    });
    return Scaffold(
      appBar: AppBar(title: Text(s.orders)),
      body: auth != AuthStatus.authenticated
          ? GuestGate(
              icon: Icons.receipt_long_outlined,
              title: s.ordersTitle,
              description: s.ordersGuestDescription,
              signInLabel: s.signIn,
              registerLabel: s.createAccount,
            )
          : Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
                  child: SegmentedButton<bool>(
                    segments: [
                      ButtonSegment(value: false, label: Text(s.activeOrders)),
                      ButtonSegment(value: true, label: Text(s.pastOrders)),
                    ],
                    selected: {_past},
                    onSelectionChanged: (value) =>
                        setState(() => _past = value.first),
                  ),
                ),
                Expanded(
                  child: ref
                      .watch(customerOrdersProvider)
                      .when(
                        loading: () => const OrderSkeleton(),
                        error: (error, _) => ErrorState(
                          title: s.somethingWentWrong,
                          description: customerErrorMessage(error, s),
                          retryLabel: s.retry,
                          onRetry: _refresh,
                        ),
                        data: (first) {
                          final all = {
                            for (final o in [...first.items, ..._extra])
                              o.id: o,
                          }.values;
                          final orders = all
                              .where((o) => _past ? o.isFinal : o.isActive)
                              .toList();
                          final more = _page == 1 ? first.hasNext : _hasMore;
                          return RefreshIndicator(
                            onRefresh: _refresh,
                            child: ListView.separated(
                              physics: const AlwaysScrollableScrollPhysics(),
                              padding: const EdgeInsets.all(20),
                              itemCount:
                                  orders.length +
                                  (orders.isEmpty ? 1 : 0) +
                                  (more ? 1 : 0),
                              separatorBuilder: (_, _) =>
                                  const SizedBox(height: 12),
                              itemBuilder: (context, index) {
                                if (orders.isEmpty && index == 0) {
                                  return SizedBox(
                                    height: 260,
                                    child: EmptyState(
                                      icon: Icons.receipt_long_outlined,
                                      title: _past
                                          ? s.noPastOrders
                                          : s.noActiveOrders,
                                      description: s.noOrdersDescription,
                                    ),
                                  );
                                }
                                if (index >= orders.length) {
                                  return Center(
                                    child: TextButton(
                                      onPressed: _loadingMore
                                          ? null
                                          : _loadMore,
                                      child: _loadingMore
                                          ? const SizedBox.square(
                                              dimension: 20,
                                              child: CircularProgressIndicator(
                                                strokeWidth: 2,
                                              ),
                                            )
                                          : Text(s.loadMore),
                                    ),
                                  );
                                }
                                return _OrderCard(order: orders[index]);
                              },
                            ),
                          );
                        },
                      ),
                ),
              ],
            ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  const _OrderCard({required this.order});
  final CustomerOrder order;
  @override
  Widget build(BuildContext context) {
    final s = AppLocalizations.of(context);
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => context.push(AppRoutes.orderDetailPath(order.id)),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Wrap(
                spacing: 12,
                runSpacing: 8,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  Text(
                    s.orderNumber(order.orderNumber),
                    style: Theme.of(context).textTheme.titleSmall,
                  ),
                  AppBadge(
                    label: orderStatusLabel(order, s),
                    tone: order.phase == OrderPhase.cancelled
                        ? AppBadgeTone.error
                        : order.isFinal
                        ? AppBadgeTone.success
                        : AppBadgeTone.warning,
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                [
                  order.restaurantName,
                  order.branchName,
                ].whereType<String>().join(' · '),
              ),
              const SizedBox(height: 8),
              Text(
                order.items
                    .map((item) => '${item.quantity} × ${item.name}')
                    .join(' · '),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 20,
                runSpacing: 8,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  if (order.createdAt != null)
                    Text(
                      DateFormat.yMMMd().add_jm().format(
                        order.createdAt!.toLocal(),
                      ),
                      style: Theme.of(context).textTheme.labelSmall,
                    ),
                  PriceText(order.total),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class OrderSkeleton extends StatelessWidget {
  const OrderSkeleton({super.key});
  @override
  Widget build(BuildContext context) => ListView.separated(
    padding: const EdgeInsets.all(20),
    itemCount: 3,
    separatorBuilder: (_, _) => const SizedBox(height: 12),
    itemBuilder: (_, _) => Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            for (final width in [150.0, 220.0, 180.0])
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Container(
                  height: 16,
                  width: width,
                  decoration: BoxDecoration(
                    color: Theme.of(context)
                        .colorScheme
                        .surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(5),
                  ),
                ),
              ),
          ],
        ),
      ),
    ),
  );
}
