import 'package:flutter/material.dart';
import 'package:pakhlai_mobile/core/theme/app_spacing.dart';

class BottomSheetContainer extends StatelessWidget {
  const BottomSheetContainer({
    required this.child,
    super.key,
    this.title,
    this.footer,
  });

  final String? title;
  final Widget child;
  final Widget? footer;

  @override
  Widget build(BuildContext context) => SafeArea(
    top: false,
    child: Padding(
      padding: EdgeInsetsDirectional.only(
        start: AppSpacing.pagePadding,
        end: AppSpacing.pagePadding,
        bottom: MediaQuery.viewInsetsOf(context).bottom + AppSpacing.lg,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (title != null) ...[
            Text(title!, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: AppSpacing.md),
          ],
          child,
          if (footer != null) ...[
            const SizedBox(height: AppSpacing.lg),
            footer!,
          ],
        ],
      ),
    ),
  );
}
