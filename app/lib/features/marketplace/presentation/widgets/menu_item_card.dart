import 'package:flutter/material.dart';
import 'package:pakhlai_mobile/core/theme/app_colors.dart';
import 'package:pakhlai_mobile/core/theme/app_radius.dart';
import 'package:pakhlai_mobile/core/widgets/network_image_view.dart';
import 'package:pakhlai_mobile/core/widgets/price_text.dart';
import 'package:pakhlai_mobile/core/widgets/pressable_scale.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/menu_models.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';

enum MenuItemCardLayout { list, grid }

class MenuItemCard extends StatelessWidget {
  const MenuItemCard({
    required this.item,
    required this.onTap,
    required this.onAdd,
    super.key,
    this.layout = MenuItemCardLayout.list,
  });

  final MarketplaceItem item;
  final VoidCallback onTap;
  final VoidCallback? onAdd;
  final MenuItemCardLayout layout;

  @override
  Widget build(BuildContext context) {
    final card = layout == MenuItemCardLayout.grid
        ? _GridMenuCard(item: item, onTap: onTap, onAdd: onAdd)
        : _ListMenuCard(item: item, onTap: onTap, onAdd: onAdd);
    return TweenAnimationBuilder<double>(
      key: ValueKey(layout),
      tween: Tween(begin: 0, end: 1),
      duration: const Duration(milliseconds: 280),
      curve: Curves.easeOutCubic,
      builder: (context, value, child) => Opacity(
        opacity: value,
        child: Transform.translate(
          offset: Offset(0, 8 * (1 - value)),
          child: child,
        ),
      ),
      child: PressableScale(child: card),
    );
  }
}

class _ListMenuCard extends StatelessWidget {
  const _ListMenuCard({
    required this.item,
    required this.onTap,
    required this.onAdd,
  });

  final MarketplaceItem item;
  final VoidCallback onTap;
  final VoidCallback? onAdd;

  @override
  Widget build(BuildContext context) {
    final strings = AppLocalizations.of(context);
    return Card(
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox.square(
                dimension: 100,
                child: NetworkImageView(
                  imageUrl: item.imageUrl,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
              ),
              const SizedBox(width: 13),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.titleSmall,
                    ),
                    if (item.description?.trim().isNotEmpty == true) ...[
                      const SizedBox(height: 4),
                      Text(
                        item.description!,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: item.isAvailable
                              ? PriceText(
                                  item.price,
                                  style: Theme.of(context).textTheme.labelLarge
                                      ?.copyWith(color: AppColors.brandDark),
                                )
                              : Text(
                                  strings.unavailable,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: Theme.of(context).textTheme.labelSmall
                                      ?.copyWith(color: AppColors.error),
                                ),
                        ),
                        const SizedBox(width: 8),
                        _AddButton(
                          onPressed: onAdd,
                          label: strings.add,
                          tooltip: strings.addToCart,
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
}

class _GridMenuCard extends StatelessWidget {
  const _GridMenuCard({
    required this.item,
    required this.onTap,
    required this.onAdd,
  });

  final MarketplaceItem item;
  final VoidCallback onTap;
  final VoidCallback? onAdd;

  @override
  Widget build(BuildContext context) {
    final strings = AppLocalizations.of(context);
    return Card(
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            NetworkImageView(imageUrl: item.imageUrl, aspectRatio: 1.45),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(12, 11, 12, 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.titleSmall,
                    ),
                    if (item.description?.trim().isNotEmpty == true) ...[
                      const SizedBox(height: 4),
                      Text(
                        item.description!,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                    const Spacer(),
                    Row(
                      children: [
                        Expanded(
                          child: item.isAvailable
                              ? PriceText(
                                  item.price,
                                  style: Theme.of(context).textTheme.labelLarge
                                      ?.copyWith(color: AppColors.brandDark),
                                )
                              : Text(
                                  strings.unavailable,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: Theme.of(context).textTheme.labelSmall
                                      ?.copyWith(color: AppColors.error),
                                ),
                        ),
                        IconButton.filled(
                          onPressed: onAdd,
                          tooltip: strings.addToCart,
                          style: IconButton.styleFrom(
                            minimumSize: const Size.square(38),
                            maximumSize: const Size.square(38),
                            backgroundColor: AppColors.brand,
                            foregroundColor: Colors.white,
                            disabledBackgroundColor: Theme.of(context)
                                .colorScheme
                                .surfaceContainerHighest,
                          ),
                          icon: const Icon(Icons.add_rounded, size: 20),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AddButton extends StatelessWidget {
  const _AddButton({
    required this.onPressed,
    required this.label,
    required this.tooltip,
  });

  final VoidCallback? onPressed;
  final String label;
  final String tooltip;

  @override
  Widget build(BuildContext context) => Tooltip(
    message: tooltip,
    child: SizedBox(
      height: 38,
      child: FilledButton.icon(
        onPressed: onPressed,
        icon: const Icon(Icons.add_rounded, size: 18),
        label: Text(label),
        style: FilledButton.styleFrom(
          minimumSize: const Size(0, 38),
          padding: const EdgeInsets.symmetric(horizontal: 12),
          textStyle: Theme.of(context).textTheme.labelMedium,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.sm),
          ),
        ),
      ),
    ),
  );
}
