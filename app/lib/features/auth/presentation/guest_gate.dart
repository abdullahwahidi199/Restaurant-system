import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:pakhlai_mobile/app/router/app_routes.dart';
import 'package:pakhlai_mobile/core/widgets/app_buttons.dart';

class GuestGate extends StatelessWidget {
  const GuestGate({
    required this.icon,
    required this.title,
    required this.description,
    required this.signInLabel,
    required this.registerLabel,
    super.key,
  });

  final IconData icon;
  final String title;
  final String description;
  final String signInLabel;
  final String registerLabel;

  @override
  Widget build(BuildContext context) => Center(
    child: SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 380),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 58,
              height: 58,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primaryContainer,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(
                icon,
                size: 28,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 6),
            Text(
              description,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 22),
            PrimaryButton(
              label: signInLabel,
              onPressed: () => context.push(AppRoutes.login),
            ),
            const SizedBox(height: 8),
            SecondaryButton(
              label: registerLabel,
              onPressed: () => context.push(AppRoutes.register),
              expand: true,
            ),
          ],
        ),
      ),
    ),
  );
}
