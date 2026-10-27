import 'package:flutter/material.dart';
import 'package:pakhlai_mobile/core/theme/app_colors.dart';
import 'package:pakhlai_mobile/core/theme/app_radius.dart';
import 'package:pakhlai_mobile/core/widgets/network_image_view.dart';
import 'package:pakhlai_mobile/core/widgets/price_text.dart';
import 'package:pakhlai_mobile/core/widgets/pressable_scale.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/restaurant_models.dart';
import 'package:pakhlai_mobile/features/marketplace/presentation/widgets/restaurant_status_badge.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';

class RestaurantHorizontalCard extends StatelessWidget {
  const RestaurantHorizontalCard({
    required this.restaurant,
    required this.onTap,
    super.key,
  });

  final Restaurant restaurant;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => SizedBox(
    width: 282,
    child: PressableScale(
      child: Card(
        child: InkWell(
          onTap: onTap,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Stack(
                children: [
                  NetworkImageView(
                    imageUrl: restaurant.coverImageUrl ?? restaurant.logoUrl,
                    aspectRatio: 2.1,
                  ),
                  Positioned.fill(
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            Colors.black.withValues(alpha: 0.20),
                          ],
                        ),
                      ),
                    ),
                  ),
                  if (restaurant.status == RestaurantStatus.closed)
                    PositionedDirectional(
                      top: 10,
                      start: 10,
                      child: RestaurantStatusBadge(status: restaurant.status),
                    ),
                  if (restaurant.rating.average != null)
                    PositionedDirectional(
                      end: 10,
                      bottom: 10,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 5,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.62),
                          borderRadius: BorderRadius.circular(AppRadius.pill),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.star_rounded,
                              size: 14,
                              color: Color(0xFFFFC45C),
                            ),
                            const SizedBox(width: 3),
                            Text(
                              restaurant.rating.average!.toStringAsFixed(1),
                              style: Theme.of(context).textTheme.labelSmall
                                  ?.copyWith(color: Colors.white),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(13),
                  child: _RestaurantMetadata(
                    restaurant: restaurant,
                    showRating: false,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    ),
  );
}

class RestaurantListCard extends StatelessWidget {
  const RestaurantListCard({
    required this.restaurant,
    required this.onTap,
    super.key,
  });

  final Restaurant restaurant;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => PressableScale(
    child: Card(
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox.square(
                dimension: 96,
                child: NetworkImageView(
                  imageUrl: restaurant.coverImageUrl ?? restaurant.logoUrl,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(child: _RestaurantMetadata(restaurant: restaurant)),
              const SizedBox(width: 5),
              Container(
                width: 30,
                height: 30,
                decoration: const BoxDecoration(
                  color: AppColors.brandSoft,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.arrow_forward_rounded,
                  color: AppColors.brandDark,
                  size: 17,
                ),
              ),
            ],
          ),
        ),
      ),
    ),
  );
}

class _RestaurantMetadata extends StatelessWidget {
  const _RestaurantMetadata({required this.restaurant, this.showRating = true});

  final Restaurant restaurant;
  final bool showRating;

  @override
  Widget build(BuildContext context) {
    final strings = AppLocalizations.of(context);
    final cuisine = restaurant.cuisines
        .map((item) => item.name)
        .take(2)
        .join(' · ');
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Text(
                restaurant.name,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.titleSmall,
              ),
            ),
            if (showRating && restaurant.rating.average != null) ...[
              const SizedBox(width: 6),
              const Icon(
                Icons.star_rounded,
                size: 15,
                color: Color(0xFFE39B2E),
              ),
              const SizedBox(width: 2),
              Text(
                restaurant.rating.average!.toStringAsFixed(1),
                style: Theme.of(context).textTheme.labelMedium,
              ),
            ],
          ],
        ),
        const SizedBox(height: 3),
        Text(
          cuisine.isNotEmpty
              ? cuisine
              : restaurant.slogan ?? restaurant.address ?? '',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: Theme.of(context).textTheme.bodySmall,
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Icon(
              restaurant.delivery.available
                  ? Icons.delivery_dining_outlined
                  : Icons.storefront_outlined,
              size: 15,
              color: AppColors.textSecondary,
            ),
            const SizedBox(width: 4),
            Flexible(
              child:
                  restaurant.delivery.available &&
                      restaurant.delivery.baseFee == 0
                  ? Text(
                      strings.freeDelivery,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.bodySmall
                          ?.copyWith(color: AppColors.brandDark),
                    )
                  : PriceText(
                      restaurant.delivery.baseFee,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
            ),
            if (restaurant.delivery.distanceKm != null) ...[
              const SizedBox(width: 8),
              Text(
                '${restaurant.delivery.distanceKm!.toStringAsFixed(1)} km',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ],
        ),
      ],
    );
  }
}
