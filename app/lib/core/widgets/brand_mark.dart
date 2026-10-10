import 'package:flutter/material.dart';
import 'package:pakhlai_mobile/core/config/app_config.dart';
import 'package:pakhlai_mobile/core/theme/app_colors.dart';
import 'package:pakhlai_mobile/core/theme/app_radius.dart';

class BrandMark extends StatelessWidget {
  const BrandMark({super.key, this.compact = false, this.light = false});

  static const logoAsset = 'assets/branding/pakhlai-logo.png';

  final bool compact;
  final bool light;

  @override
  Widget build(BuildContext context) {
    final foreground = light ? Colors.white : AppColors.brand;
    return Semantics(
      label: AppConfig.appName,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: compact ? 34 : 42,
            height: compact ? 34 : 42,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
            padding: const EdgeInsets.all(4),
            child: Image.asset(
              logoAsset,
              fit: BoxFit.contain,
              excludeFromSemantics: true,
            ),
          ),
          if (!compact) ...[
            const SizedBox(width: 10),
            Text(
              AppConfig.appName,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                color: foreground,
                fontWeight: FontWeight.w700,
                letterSpacing: -0.4,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
