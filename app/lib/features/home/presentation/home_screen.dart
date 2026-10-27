import 'package:pakhlai_mobile/core/errors/customer_error_message.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pakhlai_mobile/app/router/app_routes.dart';
import 'package:pakhlai_mobile/core/theme/app_colors.dart';
import 'package:pakhlai_mobile/core/theme/app_radius.dart';
import 'package:pakhlai_mobile/core/theme/app_spacing.dart';
import 'package:pakhlai_mobile/core/widgets/brand_mark.dart';
import 'package:pakhlai_mobile/core/widgets/search_field.dart';
import 'package:pakhlai_mobile/core/widgets/section_header.dart';
import 'package:pakhlai_mobile/core/widgets/skeleton_card.dart';
import 'package:pakhlai_mobile/core/widgets/state_views.dart';
import 'package:pakhlai_mobile/features/addresses/application/delivery_location_controller.dart';
import 'package:pakhlai_mobile/features/marketplace/application/marketplace_providers.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/discovery_data.dart';
import 'package:pakhlai_mobile/features/marketplace/presentation/widgets/discovery_dish_card.dart';
import 'package:pakhlai_mobile/features/marketplace/presentation/widgets/restaurant_cards.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final strings = AppLocalizations.of(context);
    final discovery = ref.watch(homeDiscoveryProvider);
    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => ref.refresh(homeDiscoveryProvider.future),
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              const SliverToBoxAdapter(child: _HomeHeader()),
              SliverToBoxAdapter(
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 420),
                  switchInCurve: Curves.easeOutCubic,
                  switchOutCurve: Curves.easeInCubic,
                  transitionBuilder: (child, animation) => FadeTransition(
                    opacity: animation,
                    child: SlideTransition(
                      position: Tween<Offset>(
                        begin: const Offset(0, 0.025),
                        end: Offset.zero,
                      ).animate(animation),
                      child: child,
                    ),
                  ),
                  child: discovery.when(
                    loading: () => const KeyedSubtree(
                      key: ValueKey('loading'),
                      child: _HomeSkeleton(),
                    ),
                    error: (error, stackTrace) => SizedBox(
                      key: const ValueKey('error'),
                      height: 420,
                      child: ErrorState(
                        title: strings.somethingWentWrong,
                        description: customerErrorMessage(
                          error,
                          AppLocalizations.of(context),
                        ),
                        retryLabel: strings.retry,
                        onRetry: () => ref.invalidate(homeDiscoveryProvider),
                      ),
                    ),
                    data: (data) => KeyedSubtree(
                      key: ValueKey(
                        'data-${data.restaurants.length}-${data.dishes.length}',
                      ),
                      child: _HomeContent(data: data),
                    ),
                  ),
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: AppSpacing.xxl)),
            ],
          ),
        ),
      ),
    );
  }
}

class _HomeHeader extends ConsumerWidget {
  const _HomeHeader();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final strings = AppLocalizations.of(context);
    final location = ref.watch(deliveryLocationProvider);
    final theme = Theme.of(context);
    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: AlignmentDirectional.topStart,
          end: AlignmentDirectional.bottomEnd,
          colors: [Color(0xFFFF7438), AppColors.brand, AppColors.brandDark],
          stops: [0, 0.56, 1],
        ),
        borderRadius: BorderRadius.vertical(
          bottom: Radius.circular(AppRadius.xl),
        ),
      ),
      child: Stack(
        children: [
          PositionedDirectional(
            top: -72,
            end: -58,
            child: Container(
              width: 190,
              height: 190,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
            ),
          ),
          PositionedDirectional(
            bottom: 32,
            start: -55,
            child: Container(
              width: 125,
              height: 125,
              decoration: BoxDecoration(
                color: AppColors.accent.withValues(alpha: 0.14),
                shape: BoxShape.circle,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsetsDirectional.fromSTEB(
              AppSpacing.pagePadding,
              14,
              AppSpacing.pagePadding,
              24,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    const BrandMark(compact: true, light: true),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Material(
                        color: Colors.transparent,
                        child: InkWell(
                          onTap: () => context.push(AppRoutes.addresses),
                          borderRadius: BorderRadius.circular(AppRadius.sm),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 5,
                              vertical: 3,
                            ),
                            child: Row(
                              children: [
                                const Icon(
                                  Icons.location_on_rounded,
                                  color: Colors.white,
                                  size: 18,
                                ),
                                const SizedBox(width: 5),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        strings.deliverTo,
                                        style: theme.textTheme.labelSmall
                                            ?.copyWith(
                                              color: Colors.white.withValues(
                                                alpha: 0.72,
                                              ),
                                            ),
                                      ),
                                      Text(
                                        location.label.isEmpty
                                            ? strings.chooseAddress
                                            : location.label,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: theme.textTheme.titleSmall
                                            ?.copyWith(color: Colors.white),
                                      ),
                                    ],
                                  ),
                                ),
                                const Icon(
                                  Icons.keyboard_arrow_down_rounded,
                                  color: Colors.white,
                                  size: 19,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 7),
                    IconButton(
                      onPressed: () => context.go(AppRoutes.profile),
                      tooltip: strings.profileAction,
                      style: IconButton.styleFrom(
                        minimumSize: const Size.square(46),
                        foregroundColor: Colors.white,
                        backgroundColor: Colors.white.withValues(alpha: 0.16),
                        side: BorderSide(
                          color: Colors.white.withValues(alpha: 0.24),
                        ),
                      ),
                      icon: const Icon(Icons.person_outline_rounded, size: 21),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Theme(
                  data: theme.copyWith(
                    inputDecorationTheme: theme.inputDecorationTheme.copyWith(
                      fillColor: Colors.white,
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(AppRadius.md),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                  child: SearchField(
                    hint: strings.searchHint,
                    readOnly: true,
                    onTap: () => context.go(AppRoutes.search),
                    suffix: Container(
                      margin: const EdgeInsetsDirectional.only(end: 7),
                      decoration: BoxDecoration(
                        color: AppColors.brandSoft,
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                      ),
                      child: const Icon(
                        Icons.tune_rounded,
                        color: AppColors.brandDark,
                        size: 18,
                      ),
                    ),
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

class _HomeContent extends StatelessWidget {
  const _HomeContent({required this.data});

  final DiscoveryData data;

  @override
  Widget build(BuildContext context) {
    final strings = AppLocalizations.of(context);
    if (data.restaurants.isEmpty) {
      return SizedBox(
        height: 390,
        child: EmptyState(
          icon: Icons.storefront_outlined,
          title: strings.noRestaurants,
          description: strings.noRestaurantsDescription,
        ),
      );
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: AppSpacing.xl),
        if (data.cuisines.isNotEmpty) ...[
          Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.pagePadding,
            ),
            child: SectionHeader(title: strings.cuisines),
          ),
          const SizedBox(height: AppSpacing.sm),
          SizedBox(
            height: 88,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.pagePadding,
              ),
              scrollDirection: Axis.horizontal,
              itemCount: data.cuisines.length,
              separatorBuilder: (context, index) => const SizedBox(width: 4),
              itemBuilder: (context, index) {
                final cuisine = data.cuisines[index];
                return CuisineTile(
                  name: cuisine.name,
                  imageUrl: cuisine.imageUrl,
                  onTap: () => context.go(
                    '${AppRoutes.search}?q=${Uri.encodeQueryComponent(cuisine.name)}',
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
        ],
        Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.pagePadding,
          ),
          child: SectionHeader(
            title: strings.availableRestaurants,
            actionLabel: strings.seeAll,
            onAction: () => context.go(AppRoutes.search),
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        SizedBox(
          height: 238,
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.pagePadding,
            ),
            scrollDirection: Axis.horizontal,
            itemCount: data.restaurants.length,
            separatorBuilder: (context, index) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final restaurant = data.restaurants[index];
              return RestaurantHorizontalCard(
                restaurant: restaurant,
                onTap: () =>
                    context.push(AppRoutes.restaurantPath(restaurant.slug)),
              );
            },
          ),
        ),
        if (data.dishes.isNotEmpty) ...[
          const SizedBox(height: AppSpacing.xl),
          Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.pagePadding,
            ),
            child: SectionHeader(title: strings.popularDishes),
          ),
          const SizedBox(height: AppSpacing.sm),
          SizedBox(
            height: 204,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.pagePadding,
              ),
              scrollDirection: Axis.horizontal,
              itemCount: data.dishes.length,
              separatorBuilder: (context, index) => const SizedBox(width: 10),
              itemBuilder: (context, index) {
                final dish = data.dishes[index];
                return DiscoveryDishCard(
                  item: dish,
                  onTap: () => context.push(
                    AppRoutes.restaurantPath(dish.restaurantSlug),
                  ),
                );
              },
            ),
          ),
        ],
      ],
    );
  }
}

class _HomeSkeleton extends StatelessWidget {
  const _HomeSkeleton();

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.pagePadding),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SkeletonCard(height: 16, width: 120),
        const SizedBox(height: AppSpacing.md),
        SizedBox(
          height: 86,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: 5,
            separatorBuilder: (context, index) => const SizedBox(width: 10),
            itemBuilder: (context, index) =>
                const SkeletonCard(width: 68, height: 76),
          ),
        ),
        const SizedBox(height: AppSpacing.xl),
        const SkeletonCard(height: 16, width: 180),
        const SizedBox(height: AppSpacing.md),
        const SkeletonCard(height: 196),
      ],
    ),
  );
}
