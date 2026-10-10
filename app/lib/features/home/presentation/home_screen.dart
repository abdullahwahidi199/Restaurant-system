import 'package:pakhlai_mobile/core/errors/customer_error_message.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pakhlai_mobile/app/router/app_routes.dart';
import 'package:pakhlai_mobile/core/theme/app_spacing.dart';
import 'package:pakhlai_mobile/core/widgets/app_buttons.dart';
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
              SliverPadding(
                padding: const EdgeInsetsDirectional.fromSTEB(
                  AppSpacing.pagePadding,
                  4,
                  AppSpacing.pagePadding,
                  AppSpacing.lg,
                ),
                sliver: SliverToBoxAdapter(
                  child: SearchField(
                    hint: strings.searchHint,
                    readOnly: true,
                    onTap: () => context.go(AppRoutes.search),
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: discovery.when(
                  loading: () => const _HomeSkeleton(),
                  error: (error, stackTrace) => SizedBox(
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
                  data: (data) => _HomeContent(data: data),
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
    return Padding(
      padding: const EdgeInsetsDirectional.fromSTEB(16, 10, 12, 14),
      child: Row(
        children: [
          const BrandMark(compact: true),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  strings.deliverTo,
                  style: Theme.of(context).textTheme.labelSmall,
                ),
                const SizedBox(height: 1),
                Row(
                  children: [
                    const Icon(Icons.location_on_outlined, size: 16),
                    const SizedBox(width: 3),
                    Flexible(
                      child: Text(
                        location.label.isEmpty
                            ? strings.chooseAddress
                            : location.label,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.titleSmall,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          AppIconButton(
            icon: Icons.person_outline_rounded,
            tooltip: strings.profileAction,
            onPressed: () => context.go(AppRoutes.profile),
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
          height: 210,
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
            height: 184,
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
