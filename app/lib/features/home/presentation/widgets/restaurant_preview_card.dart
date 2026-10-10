import 'package:flutter/material.dart';
import 'package:pakhlai_mobile/core/theme/app_radius.dart';
import 'package:pakhlai_mobile/core/widgets/app_badge.dart';
import 'package:pakhlai_mobile/core/widgets/network_image_view.dart';
import 'package:pakhlai_mobile/core/widgets/price_text.dart';

class RestaurantPreviewCard extends StatelessWidget {
  const RestaurantPreviewCard({
    required this.name,
    required this.cuisine,
    required this.imageUrl,
    required this.rating,
    required this.deliveryMinutes,
    required this.minutesLabel,
    required this.freeDeliveryLabel,
    super.key,
    this.deliveryFee = 0,
    this.badge,
    this.onTap,
  });

  final String name;
  final String cuisine;
  final String imageUrl;
  final double rating;
  final int deliveryMinutes;
  final String minutesLabel;
  final String freeDeliveryLabel;
  final num deliveryFee;
  final String? badge;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) => SizedBox(
    width: 268,
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
                  imageUrl: imageUrl,
                  aspectRatio: 2,
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(AppRadius.md),
                  ),
                ),
                if (badge != null)
                  PositionedDirectional(
                    top: 10,
                    start: 10,
                    child: AppBadge(label: badge!, tone: AppBadgeTone.brand),
                  ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.titleSmall,
                  ),
                  const SizedBox(height: 3),
                  Text(
                    cuisine,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      const Icon(
                        Icons.star_rounded,
                        size: 16,
                        color: Color(0xFFE39B2E),
                      ),
                      const SizedBox(width: 3),
                      Text(
                        '$rating',
                        style: Theme.of(context).textTheme.labelMedium,
                      ),
                      const SizedBox(width: 10),
                      const Icon(Icons.schedule_rounded, size: 15),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          '$deliveryMinutes $minutesLabel',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ),
                      const SizedBox(width: 8),
                      if (deliveryFee == 0)
                        Flexible(
                          child: Text(
                            freeDeliveryLabel,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: Theme.of(context).textTheme.labelSmall
                                ?.copyWith(
                                  color: Theme.of(context).colorScheme.primary,
                                ),
                          ),
                        )
                      else
                        Flexible(
                          child: PriceText(
                            deliveryFee,
                            style: Theme.of(context).textTheme.labelSmall,
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    ),
  );
}
