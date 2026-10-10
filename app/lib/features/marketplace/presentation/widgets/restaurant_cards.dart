import 'package:flutter/material.dart';
import 'package:pakhlai_mobile/core/theme/app_colors.dart';
import 'package:pakhlai_mobile/core/theme/app_radius.dart';
import 'package:pakhlai_mobile/core/widgets/network_image_view.dart';
import 'package:pakhlai_mobile/core/widgets/price_text.dart';
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
    width: 264,
    child: Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                NetworkImageView(
                  imageUrl: restaurant.coverImageUrl ?? restaurant.logoUrl,
                  aspectRatio: 2.15,
                ),
                if (restaurant.status == RestaurantStatus.closed)
                  PositionedDirectional(
                    top: 8,
                    start: 8,
                    child: RestaurantStatusBadge(status: restaurant.status),
                  ),
              ],
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(11),
                child: _RestaurantMetadata(restaurant: restaurant),
              ),
            ),
          ],
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
  Widget build(BuildContext context) => Card(
    clipBehavior: Clip.antiAlias,
    child: InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(10),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox.square(
              dimension: 92,
              child: NetworkImageView(
                imageUrl: restaurant.coverImageUrl ?? restaurant.logoUrl,
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(child: _RestaurantMetadata(restaurant: restaurant)),
            const SizedBox(width: 4),
            const Icon(Icons.chevron_right_rounded, size: 20),
          ],
        ),
      ),
    ),
  );
}

class _RestaurantMetadata extends StatelessWidget {
  const _RestaurantMetadata({required this.restaurant});

  final Restaurant restaurant;

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
            if (restaurant.rating.average != null) ...[
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
