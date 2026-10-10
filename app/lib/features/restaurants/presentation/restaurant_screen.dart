import 'package:pakhlai_mobile/core/errors/customer_error_message.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pakhlai_mobile/core/theme/app_radius.dart';
import 'package:pakhlai_mobile/core/theme/app_spacing.dart';
import 'package:pakhlai_mobile/core/utils/currency_formatter.dart';
import 'package:pakhlai_mobile/core/widgets/app_badge.dart';
import 'package:pakhlai_mobile/core/widgets/network_image_view.dart';
import 'package:pakhlai_mobile/core/widgets/skeleton_card.dart';
import 'package:pakhlai_mobile/core/widgets/state_views.dart';
import 'package:pakhlai_mobile/features/cart/application/cart_controller.dart';
import 'package:pakhlai_mobile/features/cart/presentation/cart_actions.dart';
import 'package:pakhlai_mobile/features/cart/presentation/widgets/contextual_cart_bar.dart';
import 'package:pakhlai_mobile/features/marketplace/application/marketplace_providers.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/menu_models.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/restaurant_models.dart';
import 'package:pakhlai_mobile/features/marketplace/presentation/widgets/branch_selector_sheet.dart';
import 'package:pakhlai_mobile/features/marketplace/presentation/widgets/menu_item_card.dart';
import 'package:pakhlai_mobile/features/marketplace/presentation/widgets/menu_item_sheet.dart';
import 'package:pakhlai_mobile/features/marketplace/presentation/widgets/restaurant_status_badge.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';

class RestaurantScreen extends ConsumerWidget {
  const RestaurantScreen({
    required this.restaurantSlug,
    super.key,
    this.initialBranchSlug,
  });

  final String restaurantSlug;
  final String? initialBranchSlug;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final strings = AppLocalizations.of(context);
    return ref
        .watch(restaurantProvider(restaurantSlug))
        .when(
          loading: () => const Scaffold(body: _RestaurantSkeleton()),
          error: (error, stackTrace) => Scaffold(
            appBar: AppBar(),
            body: ErrorState(
              title: strings.somethingWentWrong,
              description: customerErrorMessage(
                error,
                AppLocalizations.of(context),
              ),
              retryLabel: strings.retry,
              onRetry: () => ref.invalidate(restaurantProvider(restaurantSlug)),
            ),
          ),
          data: (restaurant) => _RestaurantBody(
            restaurant: restaurant,
            initialBranchSlug: initialBranchSlug,
          ),
        );
  }
}

class _RestaurantBody extends ConsumerStatefulWidget {
  const _RestaurantBody({required this.restaurant, this.initialBranchSlug});

  final Restaurant restaurant;
  final String? initialBranchSlug;

  @override
  ConsumerState<_RestaurantBody> createState() => _RestaurantBodyState();
}

class _RestaurantBodyState extends ConsumerState<_RestaurantBody> {
  String? _selectedBranchSlug;
  int? _selectedCategoryId;

  RestaurantBranch? get _selectedBranch {
    final branches = widget.restaurant.branches;
    if (branches.isEmpty) return null;
    final slug = _selectedBranchSlug ?? widget.initialBranchSlug;
    if (slug != null) {
      for (final branch in branches) {
        if (branch.slug == slug) return branch;
      }
    }
    return widget.restaurant.defaultBranch;
  }

  Future<void> _selectBranch(RestaurantBranch current) async {
    final selected = await showBranchSelector(
      context: context,
      branches: widget.restaurant.branches,
      selected: current,
    );
    if (selected == null || selected.id == current.id || !mounted) return;
    final cart = await ref.read(cartControllerProvider.future);
    if (cart.isNotEmpty && !cart.isCompatible(widget.restaurant, selected)) {
      if (!mounted) return;
      final strings = AppLocalizations.of(context);
      final confirmed =
          await showDialog<bool>(
            context: context,
            builder: (dialogContext) => AlertDialog(
              title: Text(strings.branchChangeTitle),
              content: Text(strings.branchChangeMessage),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(dialogContext).pop(false),
                  child: Text(strings.cancel),
                ),
                FilledButton(
                  onPressed: () => Navigator.of(dialogContext).pop(true),
                  child: Text(strings.clearCart),
                ),
              ],
            ),
          ) ??
          false;
      if (!confirmed) return;
      await ref.read(cartControllerProvider.notifier).clear();
    }
    if (!mounted) return;
    setState(() {
      _selectedBranchSlug = selected.slug;
      _selectedCategoryId = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final branch = _selectedBranch;
    final strings = AppLocalizations.of(context);
    if (branch == null) {
      return Scaffold(
        appBar: AppBar(),
        body: EmptyState(
          icon: Icons.storefront_outlined,
          title: strings.noMenu,
          description: strings.noMenuDescription,
        ),
      );
    }
    final request = (restaurant: widget.restaurant, branch: branch);
    final menu = ref.watch(restaurantMenuProvider(request));
    return Scaffold(
      bottomNavigationBar: const ContextualCartBar(),
      body: CustomScrollView(
        slivers: [
          _RestaurantHero(restaurant: widget.restaurant),
          SliverToBoxAdapter(
            child: _RestaurantSummary(
              restaurant: widget.restaurant,
              branch: branch,
              onSelectBranch: () => _selectBranch(branch),
            ),
          ),
          ...menu.when(
            loading: () => const [
              SliverPadding(
                padding: EdgeInsets.all(AppSpacing.pagePadding),
                sliver: SliverToBoxAdapter(child: SkeletonCard(height: 320)),
              ),
            ],
            error: (error, stackTrace) => [
              SliverFillRemaining(
                hasScrollBody: false,
                child: ErrorState(
                  title: strings.somethingWentWrong,
                  description: customerErrorMessage(
                    error,
                    AppLocalizations.of(context),
                  ),
                  retryLabel: strings.retry,
                  onRetry: () =>
                      ref.invalidate(restaurantMenuProvider(request)),
                ),
              ),
            ],
            data: (data) => _menuSlivers(
              context: context,
              menu: data,
              restaurant: widget.restaurant,
              branch: branch,
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: AppSpacing.xxl)),
        ],
      ),
    );
  }

  List<Widget> _menuSlivers({
    required BuildContext context,
    required RestaurantMenu menu,
    required Restaurant restaurant,
    required RestaurantBranch branch,
  }) {
    final strings = AppLocalizations.of(context);
    if (menu.categories.isEmpty) {
      return [
        SliverFillRemaining(
          hasScrollBody: false,
          child: EmptyState(
            icon: Icons.restaurant_menu_rounded,
            title: strings.noMenu,
            description: strings.noMenuDescription,
          ),
        ),
      ];
    }
    final visibleCategories = _selectedCategoryId == null
        ? menu.categories
        : menu.categories
              .where((category) => category.id == _selectedCategoryId)
              .toList();
    return [
      SliverPersistentHeader(
        pinned: true,
        delegate: _CategoryHeaderDelegate(
          categories: menu.categories,
          selectedId: _selectedCategoryId,
          allLabel: strings.menu,
          onSelected: (id) => setState(() => _selectedCategoryId = id),
        ),
      ),
      for (final category in visibleCategories) ...[
        SliverPadding(
          padding: const EdgeInsetsDirectional.fromSTEB(
            AppSpacing.pagePadding,
            AppSpacing.lg,
            AppSpacing.pagePadding,
            0,
          ),
          sliver: SliverToBoxAdapter(
            child: Text(
              category.name,
              style: Theme.of(context).textTheme.titleMedium,
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.pagePadding,
          ),
          sliver: SliverList.separated(
            itemCount: category.items.length,
            separatorBuilder: (context, index) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final item = category.items[index];
              return MenuItemCard(
                item: item,
                onTap: () => showMenuItemSheet(
                  context: context,
                  item: item,
                  restaurant: restaurant,
                  branch: branch,
                ),
                onAdd: item.isAvailable && branch.canOrder
                    ? () => addMarketplaceItemToCart(
                        context: context,
                        ref: ref,
                        item: item,
                        restaurant: restaurant,
                        branch: branch,
                      )
                    : null,
              );
            },
          ),
        ),
      ],
    ];
  }
}

class _RestaurantHero extends StatelessWidget {
  const _RestaurantHero({required this.restaurant});

  final Restaurant restaurant;

  @override
  Widget build(BuildContext context) {
    final strings = AppLocalizations.of(context);
    return SliverAppBar(
      pinned: true,
      expandedHeight: 176,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      actions: [
        IconButton.filledTonal(
          tooltip: strings.favoriteUnavailable,
          onPressed: () => ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(strings.favoriteUnavailable))),
          icon: const Icon(Icons.favorite_border_rounded, size: 20),
        ),
        const SizedBox(width: 8),
      ],
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            NetworkImageView(
              imageUrl: restaurant.coverImageUrl ?? restaurant.logoUrl,
            ),
            DecoratedBox(
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.14),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RestaurantSummary extends StatelessWidget {
  const _RestaurantSummary({
    required this.restaurant,
    required this.branch,
    required this.onSelectBranch,
  });

  final Restaurant restaurant;
  final RestaurantBranch branch;
  final VoidCallback onSelectBranch;

  @override
  Widget build(BuildContext context) {
    final strings = AppLocalizations.of(context);
    final cuisines = restaurant.cuisines.map((item) => item.name).join(' · ');
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.pagePadding),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (restaurant.logoUrl != null) ...[
                SizedBox.square(
                  dimension: 54,
                  child: NetworkImageView(
                    imageUrl: restaurant.logoUrl,
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
              ],
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      restaurant.name,
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    if (cuisines.isNotEmpty || restaurant.slogan != null) ...[
                      const SizedBox(height: 3),
                      Text(
                        cuisines.isNotEmpty ? cuisines : restaurant.slogan!,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ],
                ),
              ),
              RestaurantStatusBadge(status: branch.status),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Wrap(
            spacing: 8,
            runSpacing: 7,
            children: [
              if (restaurant.rating.average != null)
                AppBadge(
                  icon: Icons.star_rounded,
                  label: restaurant.rating.average!.toStringAsFixed(1),
                  tone: AppBadgeTone.warning,
                ),
              AppBadge(
                icon: Icons.delivery_dining_outlined,
                label: branch.delivery.baseFee == 0
                    ? strings.freeDelivery
                    : '${strings.deliveryFee}: ${CurrencyFormatter.format(branch.delivery.baseFee)}',
              ),
              if (branch.delivery.minimumOrder > 0)
                AppBadge(
                  icon: Icons.shopping_bag_outlined,
                  label:
                      '${strings.minimumOrder}: ${CurrencyFormatter.format(branch.delivery.minimumOrder)}',
                ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: onSelectBranch,
              icon: const Icon(Icons.storefront_outlined, size: 18),
              label: Row(
                children: [
                  Expanded(
                    child: Text(
                      '${branch.name}${branch.address == null ? '' : ' · ${branch.address}'}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      textAlign: TextAlign.start,
                    ),
                  ),
                  const Icon(Icons.keyboard_arrow_down_rounded, size: 18),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CategoryHeaderDelegate extends SliverPersistentHeaderDelegate {
  _CategoryHeaderDelegate({
    required this.categories,
    required this.selectedId,
    required this.allLabel,
    required this.onSelected,
  });

  final List<MenuCategory> categories;
  final int? selectedId;
  final String allLabel;
  final ValueChanged<int?> onSelected;

  @override
  double get minExtent => 52;

  @override
  double get maxExtent => 52;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    return Material(
      color: Theme.of(context).scaffoldBackgroundColor,
      elevation: overlapsContent ? 1 : 0,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.pagePadding,
          vertical: 7,
        ),
        scrollDirection: Axis.horizontal,
        itemCount: categories.length + 1,
        separatorBuilder: (context, index) => const SizedBox(width: 7),
        itemBuilder: (context, index) {
          final id = index == 0 ? null : categories[index - 1].id;
          final label = index == 0 ? allLabel : categories[index - 1].name;
          return ChoiceChip(
            label: Text(label),
            selected: selectedId == id,
            onSelected: (_) => onSelected(id),
          );
        },
      ),
    );
  }

  @override
  bool shouldRebuild(covariant _CategoryHeaderDelegate oldDelegate) {
    return oldDelegate.selectedId != selectedId ||
        oldDelegate.categories != categories;
  }
}

class _RestaurantSkeleton extends StatelessWidget {
  const _RestaurantSkeleton();

  @override
  Widget build(BuildContext context) => SafeArea(
    child: Padding(
      padding: const EdgeInsets.all(AppSpacing.pagePadding),
      child: Column(
        children: const [
          SkeletonCard(height: 176),
          SizedBox(height: AppSpacing.lg),
          SkeletonCard(height: 100),
          SizedBox(height: AppSpacing.lg),
          Expanded(child: SkeletonCard()),
        ],
      ),
    ),
  );
}
