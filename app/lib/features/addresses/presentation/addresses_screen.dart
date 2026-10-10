import 'package:pakhlai_mobile/features/addresses/presentation/address_editor.dart';
import 'package:pakhlai_mobile/features/addresses/domain/delivery_point.dart';
import 'package:pakhlai_mobile/core/errors/customer_error_message.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pakhlai_mobile/core/theme/app_spacing.dart';
import 'package:pakhlai_mobile/core/widgets/state_views.dart';
import 'package:pakhlai_mobile/features/addresses/application/customer_addresses_controller.dart';
import 'package:pakhlai_mobile/features/addresses/domain/customer_address.dart';
import 'package:pakhlai_mobile/features/auth/application/auth_controller.dart';
import 'package:pakhlai_mobile/features/auth/domain/auth_status.dart';
import 'package:pakhlai_mobile/features/auth/presentation/guest_gate.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';

class AddressesScreen extends ConsumerWidget {
  const AddressesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final s = AppLocalizations.of(context);
    final authenticated =
        ref.watch(authControllerProvider) == AuthStatus.authenticated;
    return Scaffold(
      appBar: AppBar(title: Text(s.addresses)),
      floatingActionButton: authenticated
          ? FloatingActionButton.extended(
              onPressed: () => showAddressEditor(context, ref),
              icon: const Icon(Icons.add_rounded),
              label: Text(s.addAddress),
            )
          : null,
      body: !authenticated
          ? GuestGate(
              icon: Icons.location_on_outlined,
              title: s.addresses,
              description: s.addressGuestDescription,
              signInLabel: s.signIn,
              registerLabel: s.createAccount,
            )
          : ref
                .watch(customerAddressesProvider)
                .when(
                  loading: () => const LoadingState(),
                  error: (error, _) => ErrorState(
                    title: s.somethingWentWrong,
                    description: customerErrorMessage(error, s),
                    retryLabel: s.retry,
                    onRetry: () => ref.invalidate(customerAddressesProvider),
                  ),
                  data: (addresses) => addresses.isEmpty
                      ? EmptyState(
                          icon: Icons.location_on_outlined,
                          title: s.noAddresses,
                          description: s.noAddressesDescription,
                        )
                      : RefreshIndicator(
                          onRefresh: () =>
                              ref.refresh(customerAddressesProvider.future),
                          child: ListView.separated(
                            physics: const AlwaysScrollableScrollPhysics(),
                            padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
                            itemCount: addresses.length,
                            separatorBuilder: (_, _) =>
                                const SizedBox(height: AppSpacing.md),
                            itemBuilder: (context, index) {
                              final address = addresses[index];
                              return Card(
                                child: Padding(
                                  padding: const EdgeInsets.all(16),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          const Icon(
                                            Icons.location_on_outlined,
                                            size: 20,
                                          ),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: Text(
                                              address.label,
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .titleSmall,
                                            ),
                                          ),
                                          if (address.isDefault)
                                            Text(
                                              s.defaultAddress,
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .labelSmall,
                                            ),
                                        ],
                                      ),
                                      const SizedBox(height: 8),
                                      Text(address.formattedAddress),
                                      if (!address.hasLocation)
                                        Padding(
                                          padding: const EdgeInsets.only(
                                            top: 6,
                                          ),
                                          child: Text(
                                            s.locationMissing,
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodySmall,
                                          ),
                                        ),
                                      Wrap(
                                        spacing: 8,
                                        children: [
                                          TextButton(
                                            onPressed: () => showAddressEditor(
                                              context,
                                              ref,
                                              address: address,
                                            ),
                                            child: Text(s.edit),
                                          ),
                                          if (!address.isDefault)
                                            TextButton(
                                              onPressed: () => _action(
                                                context,
                                                () => ref
                                                    .read(
                                                      customerAddressesProvider
                                                          .notifier,
                                                    )
                                                    .setDefault(address.id),
                                              ),
                                              child: Text(s.setDefault),
                                            ),
                                          TextButton(
                                            onPressed: () =>
                                                _delete(context, ref, address),
                                            child: Text(s.deleteAddress),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                ),
    );
  }

  Future<void> _delete(
    BuildContext context,
    WidgetRef ref,
    CustomerAddress address,
  ) async {
    final s = AppLocalizations.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(s.deleteAddress),
        content: Text(s.deleteAddressPrompt),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: Text(s.cancel),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            child: Text(s.deleteAddress),
          ),
        ],
      ),
    );
    if (confirmed == true && context.mounted) {
      await _action(
        context,
        () => ref.read(customerAddressesProvider.notifier).delete(address.id),
      );
    }
  }

  Future<void> _action(
    BuildContext context,
    Future<void> Function() action,
  ) async {
    try {
      await action();
    } catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              customerErrorMessage(error, AppLocalizations.of(context)),
            ),
          ),
        );
      }
    }
  }
}

Future<CustomerAddress?> showAddressEditor(
  BuildContext context,
  WidgetRef ref, {
  CustomerAddress? address,
  String? prefillAddress,
  DeliveryPoint? initialPoint,
  bool openMapOnStart = false,
  bool useCurrentLocation = false,
  bool requirePin = false,
  bool saveAndUse = false,
}) => showModalBottomSheet<CustomerAddress>(
  context: context,
  isScrollControlled: true,
  useSafeArea: true,
  showDragHandle: true,
  builder: (_) => AddressEditor(
    address: address,
    prefillAddress: prefillAddress,
    initialPoint: initialPoint,
    openMapOnStart: openMapOnStart,
    useCurrentLocation: useCurrentLocation,
    requirePin: requirePin,
    saveAndUse: saveAndUse,
  ),
);
