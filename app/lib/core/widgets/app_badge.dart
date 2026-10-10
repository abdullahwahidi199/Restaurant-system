import 'package:flutter/material.dart';
import 'package:pakhlai_mobile/core/theme/app_colors.dart';
import 'package:pakhlai_mobile/core/theme/app_radius.dart';

enum AppBadgeTone { neutral, brand, success, warning, error }

class AppBadge extends StatelessWidget {
  const AppBadge({
    required this.label,
    super.key,
    this.icon,
    this.tone = AppBadgeTone.neutral,
  });

  final String label;
  final IconData? icon;
  final AppBadgeTone tone;

  @override
  Widget build(BuildContext context) {
    final colors = switch (tone) {
      AppBadgeTone.brand => (AppColors.brandSoft, AppColors.brandDark),
      AppBadgeTone.success => (const Color(0xFFE7F5EF), AppColors.success),
      AppBadgeTone.warning => (const Color(0xFFFFF3DF), AppColors.warning),
      AppBadgeTone.error => (const Color(0xFFFBEAEC), AppColors.error),
      AppBadgeTone.neutral => (
        Theme.of(context).colorScheme.surfaceContainerHighest,
        Theme.of(context).colorScheme.onSurfaceVariant,
      ),
    };
    return Container(
      padding: const EdgeInsetsDirectional.fromSTEB(8, 4, 8, 4),
      decoration: BoxDecoration(
        color: colors.$1,
        borderRadius: BorderRadius.circular(AppRadius.pill),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12, color: colors.$2),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: Theme.of(context).textTheme.labelSmall
                ?.copyWith(color: colors.$2),
          ),
        ],
      ),
    );
  }
}
