import 'package:flutter/material.dart';
import 'package:pakhlai_mobile/core/theme/app_radius.dart';
import 'package:pakhlai_mobile/core/widgets/network_image_view.dart';
import 'package:pakhlai_mobile/core/widgets/price_text.dart';
import 'package:pakhlai_mobile/core/widgets/pressable_scale.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/menu_models.dart';

class DiscoveryDishCard extends StatelessWidget {
  const DiscoveryDishCard({required this.item, required this.onTap, super.key});

  final MarketplaceItem item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => SizedBox(
    width: 170,
    child: PressableScale(
      child: Card(
        child: InkWell(
          onTap: onTap,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              NetworkImageView(imageUrl: item.imageUrl, aspectRatio: 1.65),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(11),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.titleSmall,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        item.restaurantName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      const Spacer(),
                      PriceText(
                        item.price,
                        style: Theme.of(context).textTheme.labelMedium
                            ?.copyWith(
                              color: Theme.of(context).colorScheme.primary,
                            ),
                      ),
                    ],
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

class CuisineTile extends StatelessWidget {
  const CuisineTile({
    required this.name,
    required this.imageUrl,
    required this.onTap,
    super.key,
  });

  final String name;
  final String? imageUrl;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => SizedBox(
    width: 84,
    child: PressableScale(
      pressedScale: 0.95,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        child: Padding(
          padding: const EdgeInsets.all(4),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: Theme.of(context).dividerColor.withValues(alpha: .6),
                  ),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x143A2116),
                      blurRadius: 14,
                      offset: Offset(0, 5),
                    ),
                  ],
                ),
                child: SizedBox.square(
                  dimension: 52,
                  child: NetworkImageView(
                    imageUrl: imageUrl,
                    borderRadius: BorderRadius.circular(AppRadius.pill),
                  ),
                ),
              ),
              const SizedBox(height: 5),
              Text(
                name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.labelSmall,
              ),
            ],
          ),
        ),
      ),
    ),
  );
}
