import 'package:pakhlai_mobile/core/errors/customer_error_message.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pakhlai_mobile/app/bootstrap/app_bootstrap.dart';
import 'package:pakhlai_mobile/app/router/app_routes.dart';
import 'package:pakhlai_mobile/core/theme/app_colors.dart';
import 'package:pakhlai_mobile/core/widgets/brand_mark.dart';
import 'package:pakhlai_mobile/core/widgets/state_views.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';

class StartupScreen extends ConsumerWidget {
  const StartupScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.listen(appBootstrapProvider, (previous, next) {
      next.whenData((_) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (context.mounted) context.go(AppRoutes.home);
        });
      });
    });

    final bootstrap = ref.watch(appBootstrapProvider);
    final strings = AppLocalizations.of(context);
    return Scaffold(
      backgroundColor: AppColors.brandDark,
      body: SafeArea(
        child: DecoratedBox(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: AlignmentDirectional.topStart,
              end: AlignmentDirectional.bottomEnd,
              colors: [Color(0xFFFF7438), AppColors.brand, AppColors.brandDeep],
            ),
          ),
          child: bootstrap.when(
            loading: () => Center(
              child: TweenAnimationBuilder<double>(
                tween: Tween(begin: .84, end: 1),
                duration: const Duration(milliseconds: 700),
                curve: Curves.easeOutBack,
                builder: (context, scale, child) =>
                    Transform.scale(scale: scale, child: child),
                child: const Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    BrandMark(light: true),
                    SizedBox(height: 32),
                    SizedBox.square(
                      dimension: 24,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            error: (error, stackTrace) => ErrorState(
              title: strings.somethingWentWrong,
              description: customerErrorMessage(
                error,
                AppLocalizations.of(context),
              ),
              retryLabel: strings.retry,
              onRetry: () => ref.invalidate(appBootstrapProvider),
            ),
            data: (_) => const SizedBox.expand(),
          ),
        ),
      ),
    );
  }
}
