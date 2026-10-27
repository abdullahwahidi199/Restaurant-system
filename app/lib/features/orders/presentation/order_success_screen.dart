import 'package:pakhlai_mobile/core/errors/customer_error_message.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pakhlai_mobile/app/router/app_routes.dart';
import 'package:pakhlai_mobile/core/theme/app_colors.dart';
import 'package:pakhlai_mobile/core/theme/app_spacing.dart';
import 'package:pakhlai_mobile/core/widgets/app_badge.dart';
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
                padding: const EdgeInsets.all(AppSpacing.pagePadding),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 420),
                  child: Column(
                    children: [
                      TweenAnimationBuilder<double>(
                        tween: Tween(begin: .65, end: 1),
                        duration: const Duration(milliseconds: 650),
                        curve: Curves.easeOutBack,
                        builder: (context, value, child) =>
                            Transform.scale(scale: value, child: child),
                        child: Container(
                          width: 104,
                          height: 104,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [Color(0xFFFF7B43), AppColors.brandDark],
                            ),
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.brand.withValues(alpha: .28),
                                blurRadius: 32,
                                offset: const Offset(0, 14),
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.check_rounded,
                            size: 54,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      Text(
                        s.orderConfirmed,
                        style: Theme.of(context).textTheme.headlineSmall,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: AppSpacing.xl),
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(AppSpacing.xl),
                          child: Column(
                            children: [
                              AppBadge(
                                label: s.orderNumber(order.orderNumber),
                                tone: AppBadgeTone.brand,
                              ),
                              const SizedBox(height: AppSpacing.md),
                              Text(
                                s.orderSent(order.restaurantName ?? s.appName),
                                textAlign: TextAlign.center,
                                style: Theme.of(context).textTheme.bodyLarge,
                              ),
                              const SizedBox(height: AppSpacing.lg),
                              const Divider(height: 1),
                              const SizedBox(height: AppSpacing.lg),
                              Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      s.total,
                                      style: Theme.of(context)
                                          .textTheme
                                          .titleSmall,
                                    ),
                                  ),
                                  PriceText(
                                    order.total,
                                    style: Theme.of(context)
                                        .textTheme
                                        .titleLarge
                                        ?.copyWith(color: AppColors.brandDark),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xl),
                      PrimaryButton(
                        label: s.trackOrder,
                        icon: Icons.route_rounded,
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
