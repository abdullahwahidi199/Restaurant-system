import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pakhlai_mobile/app/router/app_routes.dart';
import 'package:pakhlai_mobile/core/theme/app_colors.dart';
import 'package:pakhlai_mobile/core/theme/app_radius.dart';
import 'package:pakhlai_mobile/core/theme/app_shadows.dart';
import 'package:pakhlai_mobile/core/utils/currency_formatter.dart';
import 'package:pakhlai_mobile/core/widgets/pressable_scale.dart';
import 'package:pakhlai_mobile/features/cart/application/cart_controller.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';

class ContextualCartBar extends ConsumerWidget {
  const ContextualCartBar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final strings = AppLocalizations.of(context);
    return ref
        .watch(cartControllerProvider)
        .when(
          loading: () => const SizedBox.shrink(),
          error: (error, stackTrace) => const SizedBox.shrink(),
          data: (cart) {
            if (cart.isEmpty) return const SizedBox.shrink();
            return SafeArea(
              top: false,
              minimum: const EdgeInsets.fromLTRB(12, 6, 12, 10),
              child: PressableScale(
                pressedScale: .975,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      begin: AlignmentDirectional.centerStart,
                      end: AlignmentDirectional.centerEnd,
                      colors: [Color(0xFFFF6A2E), AppColors.brandDark],
                    ),
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    boxShadow: AppShadows.brandGlow,
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: () => context.push(AppRoutes.cart),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 12,
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 30,
                              height: 30,
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.18),
                                borderRadius: BorderRadius.circular(
                                  AppRadius.sm,
                                ),
                              ),
                              child: Text(
                                '${cart.itemCount}',
                                style: Theme.of(context).textTheme.labelMedium
                                    ?.copyWith(color: Colors.white),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                strings.viewCart,
                                style: Theme.of(context).textTheme.labelLarge
                                    ?.copyWith(color: Colors.white),
                              ),
                            ),
                            Text(
                              CurrencyFormatter.format(cart.displayTotal),
                              style: Theme.of(context).textTheme.labelLarge
                                  ?.copyWith(color: Colors.white),
                            ),
                            const SizedBox(width: 4),
                            const Icon(
                              Icons.arrow_forward_rounded,
                              color: Colors.white,
                              size: 19,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            );
          },
        );
  }
}
