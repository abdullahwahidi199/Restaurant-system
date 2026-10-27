import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';
import 'package:pakhlai_mobile/features/cart/presentation/widgets/contextual_cart_bar.dart';
import 'package:pakhlai_mobile/core/theme/app_colors.dart';
import 'package:pakhlai_mobile/core/theme/app_radius.dart';
import 'package:pakhlai_mobile/core/theme/app_shadows.dart';

class MainNavigationShell extends StatelessWidget {
  const MainNavigationShell({required this.navigationShell, super.key});

  final StatefulNavigationShell navigationShell;

  void _selectTab(int index) {
    navigationShell.goBranch(
      index,
      initialLocation: index == navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context) {
    final strings = AppLocalizations.of(context);
    return Scaffold(
      body: Column(
        children: [
          // StatefulShellRoute already keeps every tab in an IndexedStack.
          // Do not wrap the shell in Opacity/Transform: rasterizing the whole
          // stack can prevent retained network-image layers from repainting
          // when an offstage tab becomes active again.
          Expanded(child: navigationShell),
          const ContextualCartBar(),
        ],
      ),
      bottomNavigationBar: DecoratedBox(
        decoration: const BoxDecoration(color: Colors.transparent),
        child: SafeArea(
          top: false,
          minimum: const EdgeInsets.fromLTRB(12, 4, 12, 10),
          child: Container(
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(AppRadius.xl),
              border: Border.all(
                color: Theme.of(context).dividerColor.withValues(alpha: 0.55),
              ),
              boxShadow: AppShadows.floating,
            ),
            clipBehavior: Clip.antiAlias,
            child: NavigationBar(
              selectedIndex: navigationShell.currentIndex,
              onDestinationSelected: _selectTab,
              animationDuration: const Duration(milliseconds: 420),
              destinations: [
                NavigationDestination(
                  icon: const Icon(Icons.home_outlined),
                  selectedIcon: const _SelectedNavIcon(Icons.home_rounded),
                  label: strings.home,
                ),
                NavigationDestination(
                  icon: const Icon(Icons.search_rounded),
                  selectedIcon: const _SelectedNavIcon(
                    Icons.manage_search_rounded,
                  ),
                  label: strings.search,
                ),
                NavigationDestination(
                  icon: const Icon(Icons.receipt_long_outlined),
                  selectedIcon: const _SelectedNavIcon(
                    Icons.receipt_long_rounded,
                  ),
                  label: strings.orders,
                ),
                NavigationDestination(
                  icon: const Icon(Icons.person_outline_rounded),
                  selectedIcon: const _SelectedNavIcon(Icons.person_rounded),
                  label: strings.profile,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _SelectedNavIcon extends StatelessWidget {
  const _SelectedNavIcon(this.icon);

  final IconData icon;

  @override
  Widget build(BuildContext context) => TweenAnimationBuilder<double>(
    tween: Tween(begin: 0.86, end: 1),
    duration: const Duration(milliseconds: 320),
    curve: Curves.easeOutBack,
    builder: (context, value, child) =>
        Transform.scale(scale: value, child: child),
    child: Icon(icon, color: AppColors.brand),
  );
}
