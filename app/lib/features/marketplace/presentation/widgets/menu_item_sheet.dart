import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pakhlai_mobile/core/theme/app_spacing.dart';
import 'package:pakhlai_mobile/core/widgets/app_buttons.dart';
import 'package:pakhlai_mobile/core/widgets/app_text_field.dart';
import 'package:pakhlai_mobile/core/widgets/bottom_sheet_container.dart';
import 'package:pakhlai_mobile/core/widgets/network_image_view.dart';
import 'package:pakhlai_mobile/core/widgets/price_text.dart';
import 'package:pakhlai_mobile/core/widgets/quantity_stepper.dart';
import 'package:pakhlai_mobile/features/cart/presentation/cart_actions.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/menu_models.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/restaurant_models.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';

Future<void> showMenuItemSheet({
  required BuildContext context,
  required MarketplaceItem item,
  required Restaurant restaurant,
  required RestaurantBranch branch,
}) {
  return showModalBottomSheet<void>(
    context: context,
    showDragHandle: true,
    isScrollControlled: true,
    builder: (context) =>
        _MenuItemSheet(item: item, restaurant: restaurant, branch: branch),
  );
}

class _MenuItemSheet extends ConsumerStatefulWidget {
  const _MenuItemSheet({
    required this.item,
    required this.restaurant,
    required this.branch,
  });

  final MarketplaceItem item;
  final Restaurant restaurant;
  final RestaurantBranch branch;

  @override
  ConsumerState<_MenuItemSheet> createState() => _MenuItemSheetState();
}

class _MenuItemSheetState extends ConsumerState<_MenuItemSheet> {
  final _noteController = TextEditingController();
  var _quantity = 1;
  var _submitting = false;

  @override
  void dispose() {
    _noteController.dispose();
    super.dispose();
  }

  Future<void> _add() async {
    setState(() => _submitting = true);
    final added = await addMarketplaceItemToCart(
      context: context,
      ref: ref,
      item: widget.item,
      restaurant: widget.restaurant,
      branch: widget.branch,
      quantity: _quantity,
      note: _noteController.text,
    );
    if (!mounted) return;
    setState(() => _submitting = false);
    if (added) Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final strings = AppLocalizations.of(context);
    return BottomSheetContainer(
      footer: Row(
        children: [
          QuantityStepper(
            value: _quantity,
            minimum: 1,
            onChanged: (value) => setState(() => _quantity = value),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: PrimaryButton(
              label: strings.addToCart,
              loading: _submitting,
              onPressed: widget.item.isAvailable && widget.branch.canOrder
                  ? _add
                  : null,
            ),
          ),
        ],
      ),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (widget.item.imageUrl != null) ...[
              NetworkImageView(
                imageUrl: widget.item.imageUrl,
                aspectRatio: 2,
                borderRadius: BorderRadius.circular(12),
              ),
              const SizedBox(height: AppSpacing.lg),
            ],
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    widget.item.name,
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                ),
                const SizedBox(width: 12),
                PriceText(widget.item.price),
              ],
            ),
            if (widget.item.description != null) ...[
              const SizedBox(height: AppSpacing.sm),
              Text(
                widget.item.description!,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
            const SizedBox(height: AppSpacing.lg),
            AppTextField(
              controller: _noteController,
              label: strings.itemNote,
              hint: strings.itemNoteHint,
              prefixIcon: Icons.edit_note_rounded,
              textInputAction: TextInputAction.done,
              maxLines: 2,
            ),
          ],
        ),
      ),
    );
  }
}
