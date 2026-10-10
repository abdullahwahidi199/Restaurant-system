import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pakhlai_mobile/core/errors/customer_error_message.dart';
import 'package:pakhlai_mobile/core/theme/app_colors.dart';
import 'package:pakhlai_mobile/core/widgets/state_views.dart';
import 'package:pakhlai_mobile/features/addresses/application/customer_addresses_controller.dart';
import 'package:pakhlai_mobile/features/addresses/domain/customer_address.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';

class CheckoutAddressCard extends StatelessWidget {
  const CheckoutAddressCard({
    super.key,
    required this.address,
    required this.onChange,
    required this.onCurrentLocation,
    required this.onMap,
    required this.onEdit,
  });
  final CustomerAddress? address;
  final VoidCallback onChange, onCurrentLocation, onMap, onEdit;

  @override
  Widget build(BuildContext context) {
    final s = AppLocalizations.of(context);
    final a = address;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.brandSoft,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    a?.label == 'Work'
                        ? Icons.work_outline_rounded
                        : Icons.home_outlined,
                    color: AppColors.brand,
                    size: 22,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        a?.label ?? s.chooseAddress,
                        style: Theme.of(context).textTheme.titleSmall,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        a?.formattedAddress ?? s.addressDetailsHelp,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      if (a != null) ...[
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(
                              a.hasLocation
                                  ? Icons.check_circle_outline_rounded
                                  : Icons.info_outline_rounded,
                              size: 16,
                              color: a.hasLocation
                                  ? AppColors.brand
                                  : Theme.of(context).colorScheme.error,
                            ),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                a.hasLocation
                                    ? s.pinSelected
                                    : s.locationMissing,
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                OutlinedButton.icon(
                  onPressed: onCurrentLocation,
                  icon: const Icon(Icons.my_location_rounded, size: 18),
                  label: Text(s.useCurrentLocation),
                ),
                OutlinedButton.icon(
                  onPressed: onMap,
                  icon: const Icon(Icons.map_outlined, size: 18),
                  label: Text(s.chooseOnMap),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 12,
              children: [
                TextButton.icon(
                  onPressed: onChange,
                  icon: const Icon(Icons.bookmark_border_rounded, size: 18),
                  label: Text(s.addresses),
                ),
                if (a != null)
                  TextButton(onPressed: onEdit, child: Text(s.editAddress)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

Future<int?> showSavedAddressPicker(BuildContext context, {int? selectedId}) =>
    showModalBottomSheet<int>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      showDragHandle: true,
      builder: (_) => _SavedAddressPicker(selectedId: selectedId),
    );

class _SavedAddressPicker extends ConsumerWidget {
  const _SavedAddressPicker({this.selectedId});
  final int? selectedId;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final s = AppLocalizations.of(context);
    return FractionallySizedBox(
      heightFactor: .65,
      child: Padding(
        padding: const EdgeInsetsDirectional.fromSTEB(20, 4, 20, 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(s.addresses, style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            Text(
              s.savedAddressHelp,
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: 20),
            Expanded(
              child: ref
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
                        : ListView.separated(
                            itemCount: addresses.length,
                            separatorBuilder: (_, _) =>
                                const SizedBox(height: 10),
                            itemBuilder: (_, index) {
                              final a = addresses[index];
                              final selected = a.id == selectedId;
                              return Card(
                                color: selected ? AppColors.brandSoft : null,
                                child: ListTile(
                                  contentPadding: const EdgeInsets.all(12),
                                  leading: Icon(
                                    a.label == 'Work'
                                        ? Icons.work_outline_rounded
                                        : Icons.home_outlined,
                                    color: AppColors.brand,
                                  ),
                                  title: Text(a.label),
                                  subtitle: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(a.formattedAddress),
                                      if (a.isDefault)
                                        Text(
                                          s.defaultAddress,
                                          style: Theme.of(context)
                                              .textTheme
                                              .labelSmall,
                                        ),
                                      if (!a.hasLocation)
                                        Text(
                                          s.locationMissing,
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodySmall,
                                        ),
                                    ],
                                  ),
                                  trailing: Icon(
                                    selected
                                        ? Icons.check_circle_rounded
                                        : Icons.radio_button_unchecked_rounded,
                                    color: selected
                                        ? AppColors.brand
                                        : Theme.of(context).colorScheme.outline,
                                  ),
                                  onTap: () => Navigator.pop(context, a.id),
                                ),
                              );
                            },
                          ),
                  ),
            ),
          ],
        ),
      ),
    );
  }
}
