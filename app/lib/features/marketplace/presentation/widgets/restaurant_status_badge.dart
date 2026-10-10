import 'package:flutter/material.dart';
import 'package:pakhlai_mobile/core/widgets/app_badge.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/restaurant_models.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';

class RestaurantStatusBadge extends StatelessWidget {
  const RestaurantStatusBadge({required this.status, super.key});

  final RestaurantStatus status;

  @override
  Widget build(BuildContext context) {
    final strings = AppLocalizations.of(context);
    return switch (status) {
      RestaurantStatus.open => AppBadge(
        label: strings.open,
        tone: AppBadgeTone.success,
      ),
      RestaurantStatus.closed => AppBadge(
        label: strings.closed,
        tone: AppBadgeTone.error,
      ),
      RestaurantStatus.busy => AppBadge(
        label: strings.busy,
        tone: AppBadgeTone.warning,
      ),
      RestaurantStatus.temporarilyUnavailable => AppBadge(
        label: strings.unavailable,
        tone: AppBadgeTone.error,
      ),
      RestaurantStatus.unknown => const SizedBox.shrink(),
    };
  }
}
