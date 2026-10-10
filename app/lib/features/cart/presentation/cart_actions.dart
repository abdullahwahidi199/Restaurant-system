import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pakhlai_mobile/features/cart/application/cart_controller.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/menu_models.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/restaurant_models.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';

Future<bool> addMarketplaceItemToCart({
  required BuildContext context,
  required WidgetRef ref,
  required MarketplaceItem item,
  required Restaurant restaurant,
  required RestaurantBranch branch,
  int quantity = 1,
  String? note,
}) async {
  if (!item.isAvailable || !branch.canOrder) return false;
  final strings = AppLocalizations.of(context);
  final cart = await ref.read(cartControllerProvider.future);
  if (!context.mounted) return false;
  var replaceIncompatible = false;
  if (!cart.isCompatible(restaurant, branch)) {
    replaceIncompatible =
        await showDialog<bool>(
          context: context,
          builder: (dialogContext) => AlertDialog(
            title: Text(strings.startNewCartTitle),
            content: Text(
              strings.startNewCartMessage(cart.restaurantName ?? ''),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(dialogContext).pop(false),
                child: Text(strings.cancel),
              ),
              FilledButton(
                onPressed: () => Navigator.of(dialogContext).pop(true),
                child: Text(strings.startNewCart),
              ),
            ],
          ),
        ) ??
        false;
    if (!replaceIncompatible) return false;
  }

  await ref
      .read(cartControllerProvider.notifier)
      .addItem(
        item: item,
        restaurant: restaurant,
        branch: branch,
        quantity: quantity,
        note: note,
        replaceIncompatible: replaceIncompatible,
      );
  if (context.mounted) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(strings.addedToCart)));
  }
  return true;
}
