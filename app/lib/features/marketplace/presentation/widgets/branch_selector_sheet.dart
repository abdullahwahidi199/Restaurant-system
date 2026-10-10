import 'package:flutter/material.dart';
import 'package:pakhlai_mobile/core/theme/app_colors.dart';
import 'package:pakhlai_mobile/core/widgets/bottom_sheet_container.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/restaurant_models.dart';
import 'package:pakhlai_mobile/features/marketplace/presentation/widgets/restaurant_status_badge.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';

Future<RestaurantBranch?> showBranchSelector({
  required BuildContext context,
  required List<RestaurantBranch> branches,
  required RestaurantBranch selected,
}) {
  final strings = AppLocalizations.of(context);
  return showModalBottomSheet<RestaurantBranch>(
    context: context,
    showDragHandle: true,
    isScrollControlled: true,
    builder: (sheetContext) => BottomSheetContainer(
      title: strings.selectBranch,
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.sizeOf(context).height * 0.62,
        ),
        child: ListView.separated(
          shrinkWrap: true,
          itemCount: branches.length,
          separatorBuilder: (context, index) => const Divider(height: 1),
          itemBuilder: (context, index) {
            final branch = branches[index];
            final isSelected = branch.id == selected.id;
            return ListTile(
              contentPadding: EdgeInsets.zero,
              onTap: () => Navigator.of(sheetContext).pop(branch),
              leading: Container(
                width: 38,
                height: 38,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: isSelected
                      ? AppColors.brandSoft
                      : Theme.of(context).colorScheme.surfaceContainerHighest,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  isSelected ? Icons.check_rounded : Icons.storefront_outlined,
                  size: 19,
                  color: isSelected ? AppColors.brand : null,
                ),
              ),
              title: Row(
                children: [
                  Flexible(child: Text(branch.name)),
                  if (branch.isMain) ...[
                    const SizedBox(width: 6),
                    Text(
                      strings.mainBranch,
                      style: Theme.of(context).textTheme.labelSmall
                          ?.copyWith(color: AppColors.brandDark),
                    ),
                  ],
                ],
              ),
              subtitle: Text(
                branch.address ?? strings.hoursUnavailable,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              trailing: branch.status == RestaurantStatus.unknown
                  ? null
                  : RestaurantStatusBadge(status: branch.status),
            );
          },
        ),
      ),
    ),
  );
}
