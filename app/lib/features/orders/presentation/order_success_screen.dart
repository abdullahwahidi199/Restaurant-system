import 'package:pakhlai_mobile/core/errors/customer_error_message.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pakhlai_mobile/app/router/app_routes.dart';
import 'package:pakhlai_mobile/core/widgets/app_buttons.dart';
import 'package:pakhlai_mobile/core/widgets/price_text.dart';
import 'package:pakhlai_mobile/core/widgets/state_views.dart';
import 'package:pakhlai_mobile/features/orders/application/order_providers.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';

class OrderSuccessScreen extends ConsumerWidget {
  const OrderSuccessScreen({required this.orderId, super.key});
  final int orderId;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final s = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          tooltip: s.backToHome,
          onPressed: () => context.go(AppRoutes.home),
          icon: const Icon(Icons.close_rounded),
        ),
      ),
      body: ref
          .watch(customerOrderProvider(orderId))
          .when(
            loading: () => const LoadingState(),
            error: (error, _) => ErrorState(
              title: s.somethingWentWrong,
              description: customerErrorMessage(error, s),
              retryLabel: s.retry,
              onRetry: () => ref.invalidate(customerOrderProvider(orderId)),
            ),
            data: (order) => Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 420),
                  child: Column(
                    children: [
                      Icon(
                        Icons.check_circle_outline_rounded,
                        size: 72,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                      const SizedBox(height: 24),
                      Text(
                        s.orderConfirmed,
                        style: Theme.of(context).textTheme.headlineSmall,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        s.orderNumber(order.orderNumber),
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        s.orderSent(order.restaurantName ?? s.appName),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      PriceText(order.total),
                      const SizedBox(height: 32),
                      PrimaryButton(
                        label: s.trackOrder,
                        onPressed: () =>
                            context.go(AppRoutes.orderDetailPath(orderId)),
                      ),
                      const SizedBox(height: 12),
                      SecondaryButton(
                        label: s.backToHome,
                        onPressed: () => context.go(AppRoutes.home),
                        expand: true,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
    );
  }
}
