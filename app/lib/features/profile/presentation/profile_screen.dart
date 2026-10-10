import 'package:pakhlai_mobile/core/errors/customer_error_message.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:go_router/go_router.dart';
import 'package:pakhlai_mobile/app/router/app_routes.dart';
import 'package:pakhlai_mobile/features/orders/application/order_providers.dart';
import 'package:pakhlai_mobile/features/addresses/application/customer_addresses_controller.dart';
import 'package:pakhlai_mobile/core/theme/app_colors.dart';
import 'package:pakhlai_mobile/core/theme/app_spacing.dart';
import 'package:pakhlai_mobile/core/widgets/app_buttons.dart';
import 'package:pakhlai_mobile/core/widgets/state_views.dart';
import 'package:pakhlai_mobile/features/auth/application/auth_controller.dart';
import 'package:pakhlai_mobile/features/auth/domain/auth_status.dart';
import 'package:pakhlai_mobile/features/auth/presentation/guest_gate.dart';
import 'package:pakhlai_mobile/features/customers/application/customer_providers.dart';
import 'package:pakhlai_mobile/features/customers/domain/customer_models.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final strings = AppLocalizations.of(context);
    final status = ref.watch(authControllerProvider);
    return Scaffold(
      appBar: AppBar(title: Text(strings.profile)),
      body: status != AuthStatus.authenticated
          ? GuestGate(
              icon: Icons.person_outline_rounded,
              title: strings.profileTitle,
              description: strings.profileGuestDescription,
              signInLabel: strings.signIn,
              registerLabel: strings.createAccount,
            )
          : ref
                .watch(customerProfileProvider)
                .when(
                  loading: () => const LoadingState(),
                  error: (error, stackTrace) => ErrorState(
                    title: strings.somethingWentWrong,
                    description: customerErrorMessage(
                      error,
                      AppLocalizations.of(context),
                    ),
                    retryLabel: strings.retry,
                    onRetry: () => ref.invalidate(customerProfileProvider),
                  ),
                  data: (profile) => _ProfileContent(profile: profile),
                ),
    );
  }
}

class _ProfileContent extends ConsumerWidget {
  const _ProfileContent({required this.profile});

  final CustomerProfile profile;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final strings = AppLocalizations.of(context);
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.pagePadding),
      children: [
        Row(
          children: [
            CircleAvatar(
              radius: 28,
              backgroundColor: AppColors.brandSoft,
              foregroundColor: AppColors.brandDark,
              child: Text(
                profile.username.isEmpty
                    ? '?'
                    : profile.username.characters.first.toUpperCase(),
                style: Theme.of(context).textTheme.titleLarge
                    ?.copyWith(color: AppColors.brandDark),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    profile.username,
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  if (profile.email != null)
                    Text(
                      profile.email!,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
              decoration: BoxDecoration(
                color: AppColors.brandSoft,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Column(
                children: [
                  Text(
                    '${profile.ordersCount}',
                    style: Theme.of(context).textTheme.titleSmall
                        ?.copyWith(color: AppColors.brandDark),
                  ),
                  Text(
                    strings.ordersCount,
                    style: Theme.of(context).textTheme.labelSmall,
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.xl),
        Card(
          child: Column(
            children: [
              if (profile.phone != null)
                _ProfileRow(
                  icon: Icons.phone_outlined,
                  label: strings.phone,
                  value: profile.phone!,
                ),
              if (profile.address != null)
                _ProfileRow(
                  icon: Icons.location_on_outlined,
                  label: strings.address,
                  value: profile.address!,
                ),
              if (profile.dateOfBirth != null)
                _ProfileRow(
                  icon: Icons.cake_outlined,
                  label: strings.dateOfBirth,
                  value: DateFormat.yMMMd().format(profile.dateOfBirth!),
                ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.xl),
        Card(
          child: Column(
            children: [
              ListTile(
                leading: const Icon(Icons.receipt_long_outlined),
                title: Text(strings.orders),
                trailing: const Icon(Icons.chevron_right_rounded),
                onTap: () => context.go(AppRoutes.orders),
              ),
              const Divider(height: 1),
              ListTile(
                leading: const Icon(Icons.location_on_outlined),
                title: Text(strings.addresses),
                trailing: const Icon(Icons.chevron_right_rounded),
                onTap: () => context.push(AppRoutes.addresses),
              ),
              const Divider(height: 1),
              ListTile(
                leading: const Icon(Icons.light_mode_outlined),
                title: Text(strings.lightAppearance),
              ),
              ListTile(
                leading: const Icon(Icons.info_outline_rounded),
                title: Text(strings.aboutPakhlai),
                onTap: () => showAboutDialog(
                  context: context,
                  applicationName: 'Pakhlai',
                  applicationVersion: '1.0.0',
                  children: [Text(strings.aboutPakhlaiDescription)],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.xl),
        SecondaryButton(
          label: strings.signOut,
          icon: Icons.logout_rounded,
          expand: true,
          onPressed: () async {
            await ref.read(authControllerProvider.notifier).signOut();
            ref
              ..invalidate(customerProfileProvider)
              ..invalidate(customerAddressesProvider)
              ..invalidate(customerOrdersProvider);
          },
        ),
      ],
    );
  }
}

class _ProfileRow extends StatelessWidget {
  const _ProfileRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) => ListTile(
    leading: Icon(icon, size: 20),
    title: Text(label, style: Theme.of(context).textTheme.labelSmall),
    subtitle: Text(value, style: Theme.of(context).textTheme.bodyMedium),
  );
}
