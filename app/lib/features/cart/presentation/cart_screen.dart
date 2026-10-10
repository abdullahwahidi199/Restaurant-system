import 'package:pakhlai_mobile/core/errors/customer_error_message.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pakhlai_mobile/app/router/app_routes.dart';
import 'package:pakhlai_mobile/core/theme/app_radius.dart';
import 'package:pakhlai_mobile/core/theme/app_spacing.dart';
import 'package:pakhlai_mobile/core/widgets/app_buttons.dart';
import 'package:pakhlai_mobile/core/widgets/app_scaffold.dart';
import 'package:pakhlai_mobile/core/widgets/app_text_field.dart';
import 'package:pakhlai_mobile/core/widgets/app_top_bar.dart';
import 'package:pakhlai_mobile/core/widgets/bottom_sheet_container.dart';
import 'package:pakhlai_mobile/core/widgets/divider_row.dart';
import 'package:pakhlai_mobile/core/widgets/network_image_view.dart';
import 'package:pakhlai_mobile/core/widgets/price_text.dart';
import 'package:pakhlai_mobile/core/widgets/quantity_stepper.dart';
import 'package:pakhlai_mobile/core/widgets/state_views.dart';
import 'package:pakhlai_mobile/features/cart/application/cart_controller.dart';
import 'package:pakhlai_mobile/features/cart/domain/cart_models.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';
import 'package:pakhlai_mobile/core/errors/app_exception.dart';
import 'package:pakhlai_mobile/features/auth/application/auth_controller.dart';
import 'package:pakhlai_mobile/features/auth/domain/auth_status.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final strings = AppLocalizations.of(context);
    final cartState = ref.watch(cartControllerProvider);
    final cart = cartState.value;
    return AppScaffold(
      appBar: AppTopBar(
        title: strings.cart,
        actions: [
          if (cart?.isNotEmpty ?? false)
            IconButton(
              tooltip: strings.clearCart,
              onPressed: () => _confirmClear(context, ref),
              icon: const Icon(Icons.delete_outline_rounded, size: 20),
            ),
        ],
      ),
      body: cartState.when(
        loading: () => const LoadingState(),
        error: (error, stackTrace) => ErrorState(
          title: strings.somethingWentWrong,
          description: customerErrorMessage(
            error,
            AppLocalizations.of(context),
          ),
          retryLabel: strings.retry,
          onRetry: () => ref.invalidate(cartControllerProvider),
        ),
        data: (cart) => cart.isEmpty
            ? EmptyState(
                icon: Icons.shopping_bag_outlined,
                title: strings.emptyCart,
                description: strings.emptyCartDescription,
                actionLabel: strings.search,
                onAction: () => context.go(AppRoutes.search),
              )
            : _CartContent(cart: cart),
      ),
    );
  }

  Future<void> _confirmClear(BuildContext context, WidgetRef ref) async {
    final strings = AppLocalizations.of(context);
    final confirmed =
        await showDialog<bool>(
          context: context,
          builder: (dialogContext) => AlertDialog(
            title: Text(strings.clearCart),
            content: Text(strings.emptyCartDescription),
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
    if (confirmed) await ref.read(cartControllerProvider.notifier).clear();
  }
}

class _CartContent extends ConsumerStatefulWidget {
  const _CartContent({required this.cart});

  final Cart cart;

  @override
  ConsumerState<_CartContent> createState() => _CartContentState();
}

class _CartContentState extends ConsumerState<_CartContent> {
  bool _checking = false;
  Cart get cart => widget.cart;

  Future<void> _checkout() async {
    if (_checking) return;
    final s = AppLocalizations.of(context);
    if (ref.read(authControllerProvider) != AuthStatus.authenticated) {
      context.push(
        AppRoutes.authPath(AppRoutes.login, returnTo: AppRoutes.checkout),
      );
      return;
    }
    setState(() => _checking = true);
    try {
      final result = await ref
          .read(cartControllerProvider.notifier)
          .revalidate();
      if (!mounted) return;
      if (result.changed) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              result.removedNames.isNotEmpty
                  ? '${s.cartUnavailableRemoved} ${result.removedNames.join(', ')}'
                  : s.reviewPrices,
            ),
          ),
        );
      } else if (ref.read(cartControllerProvider).value?.isNotEmpty ?? false) {
        context.push(AppRoutes.checkout);
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              error is AppException ? error.message : s.actionFailed,
            ),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _checking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final strings = AppLocalizations.of(context);
    return ListView(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.pagePadding,
        AppSpacing.sm,
        AppSpacing.pagePadding,
        AppSpacing.xxl,
      ),
      children: [
        Text(
          cart.restaurantName ?? '',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        const SizedBox(height: 2),
        Text(
          cart.branchName ?? '',
          style: Theme.of(context).textTheme.bodySmall,
        ),
        const SizedBox(height: AppSpacing.lg),
        Card(
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.xs,
            ),
            child: Column(
              children: [
                for (var index = 0; index < cart.items.length; index++) ...[
                  _CartItemRow(item: cart.items[index]),
                  if (index != cart.items.length - 1) const Divider(height: 1),
                ],
              ],
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        TextActionButton(
          label: strings.addMoreItems,
          onPressed: () {
            final slug = cart.restaurantSlug;
            if (slug == null) return;
            context.push(
              AppRoutes.restaurantPath(slug, branchSlug: cart.branchSlug),
            );
          },
        ),
        const SizedBox(height: AppSpacing.md),
        Card(
          child: ListTile(
            leading: const Icon(Icons.edit_note_rounded),
            title: Text(strings.orderNote),
            subtitle: Text(cart.orderNote ?? strings.addInstructions),
            trailing: Text(strings.edit),
            onTap: () => _editOrderNote(context, ref, cart.orderNote),
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        Card(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            child: Column(
              children: [
                DividerRow(
                  label: strings.subtotal,
                  value: PriceText(cart.subtotal),
                ),
                const Divider(height: 1),
                DividerRow(
                  label: strings.deliveryFee,
                  value: cart.deliveryFee == 0
                      ? Text(strings.freeDelivery)
                      : PriceText(cart.deliveryFee),
                ),
                if (cart.discount > 0) ...[
                  const Divider(height: 1),
                  DividerRow(
                    label: strings.discount,
                    value: PriceText(-cart.discount),
                  ),
                ],
                const Divider(height: 1),
                DividerRow(
                  label: strings.total,
                  value: PriceText(cart.displayTotal),
                  emphasized: true,
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        PrimaryButton(
          label: strings.continueToCheckout,
          loading: _checking,
          onPressed: _checkout,
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(
          strings.cartEstimates,
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }

  Future<void> _editOrderNote(
    BuildContext context,
    WidgetRef ref,
    String? current,
  ) async {
    final note = await _showNoteEditor(
      context: context,
      initial: current,
      title: AppLocalizations.of(context).orderNote,
    );
    if (note != null) {
      await ref.read(cartControllerProvider.notifier).updateOrderNote(note);
    }
  }
}

class _CartItemRow extends ConsumerWidget {
  const _CartItemRow({required this.item});

  final CartItem item;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final strings = AppLocalizations.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox.square(
            dimension: 62,
            child: NetworkImageView(
              imageUrl: item.imageUrl,
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        item.name,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.titleSmall,
                      ),
                    ),
                    IconButton(
                      tooltip: strings.removeItem,
                      onPressed: () => ref
                          .read(cartControllerProvider.notifier)
                          .removeItem(item.key),
                      visualDensity: VisualDensity.compact,
                      constraints: const BoxConstraints.tightFor(
                        width: 32,
                        height: 32,
                      ),
                      icon: const Icon(Icons.close_rounded, size: 17),
                    ),
                  ],
                ),
                PriceText(
                  item.subtotal,
                  style: Theme.of(context).textTheme.labelMedium,
                ),
                if (item.note != null) ...[
                  const SizedBox(height: 3),
                  Text(
                    item.note!,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
                const SizedBox(height: AppSpacing.sm),
                Row(
                  children: [
                    QuantityStepper(
                      value: item.quantity,
                      onChanged: (value) => ref
                          .read(cartControllerProvider.notifier)
                          .setQuantity(item.key, value),
                    ),
                    const Spacer(),
                    TextButton(
                      onPressed: () async {
                        final note = await _showNoteEditor(
                          context: context,
                          initial: item.note,
                          title: strings.itemNote,
                        );
                        if (note != null) {
                          await ref
                              .read(cartControllerProvider.notifier)
                              .updateItemNote(item.key, note);
                        }
                      },
                      child: Text(
                        item.note == null ? strings.add : strings.edit,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

Future<String?> _showNoteEditor({
  required BuildContext context,
  required String title,
  String? initial,
}) {
  final controller = TextEditingController(text: initial);
  final strings = AppLocalizations.of(context);
  return showModalBottomSheet<String>(
    context: context,
    showDragHandle: true,
    isScrollControlled: true,
    builder: (sheetContext) => BottomSheetContainer(
      title: title,
      footer: PrimaryButton(
        label: strings.save,
        onPressed: () => Navigator.of(sheetContext).pop(controller.text),
      ),
      child: AppTextField(
        controller: controller,
        hint: strings.itemNoteHint,
        prefixIcon: Icons.edit_note_rounded,
        maxLines: 3,
        textInputAction: TextInputAction.done,
      ),
    ),
  ).whenComplete(controller.dispose);
}
