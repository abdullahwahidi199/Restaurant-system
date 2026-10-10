import 'package:pakhlai_mobile/core/errors/customer_error_message.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pakhlai_mobile/app/router/app_routes.dart';
import 'package:pakhlai_mobile/core/theme/app_spacing.dart';
import 'package:pakhlai_mobile/core/widgets/app_buttons.dart';
import 'package:pakhlai_mobile/core/widgets/app_text_field.dart';
import 'package:pakhlai_mobile/features/auth/application/auth_controller.dart';
import 'package:pakhlai_mobile/features/auth/presentation/auth_validators.dart';
import 'package:pakhlai_mobile/features/auth/presentation/widgets/auth_layout.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key, this.returnTo});
  final String? returnTo;

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  var _submitting = false;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit(AppLocalizations strings) async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() => _submitting = true);
    try {
      await ref
          .read(authControllerProvider.notifier)
          .login(
            username: _usernameController.text,
            password: _passwordController.text,
          );
      if (mounted) context.go(AppRoutes.safeReturnPath(widget.returnTo));
    } on Object catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context)
          ..hideCurrentSnackBar()
          ..showSnackBar(
            SnackBar(
              content: Text(
                customerErrorMessage(error, AppLocalizations.of(context)),
              ),
            ),
          );
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _continueAsGuest() {
    ref.read(authControllerProvider.notifier).continueAsGuest();
    context.go(
      widget.returnTo == AppRoutes.checkout ? AppRoutes.cart : AppRoutes.home,
    );
  }

  @override
  Widget build(BuildContext context) {
    final strings = AppLocalizations.of(context);
    return AuthLayout(
      title: strings.loginTitle,
      subtitle: strings.loginSubtitle,
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            AppTextField(
              controller: _usernameController,
              label: strings.username,
              prefixIcon: Icons.person_outline_rounded,
              textInputAction: TextInputAction.next,
              autofillHints: const [AutofillHints.username],
              validator: (value) => AuthValidators.required(value, strings),
            ),
            const SizedBox(height: AppSpacing.md),
            PasswordField(
              controller: _passwordController,
              label: strings.password,
              showPasswordLabel: strings.showPassword,
              hidePasswordLabel: strings.hidePassword,
              textInputAction: TextInputAction.done,
              validator: (value) => AuthValidators.password(value, strings),
              onSubmitted: (_) => _submit(strings),
            ),
            Align(
              alignment: AlignmentDirectional.centerEnd,
              child: TextActionButton(
                label: strings.forgotPassword,
                onPressed: () => context.push(AppRoutes.forgotPassword),
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            PrimaryButton(
              label: strings.signIn,
              loading: _submitting,
              onPressed: _submitting ? null : () => _submit(strings),
            ),
            const SizedBox(height: AppSpacing.sm),
            SecondaryButton(
              label: strings.continueAsGuest,
              onPressed: _submitting ? null : _continueAsGuest,
              expand: true,
            ),
            const SizedBox(height: AppSpacing.md),
            Wrap(
              alignment: WrapAlignment.center,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                Text(
                  strings.newToPakhlai,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                TextActionButton(
                  label: strings.createAccount,
                  onPressed: _submitting
                      ? null
                      : () => context.pushReplacement(
                          AppRoutes.authPath(
                            AppRoutes.register,
                            returnTo: widget.returnTo,
                          ),
                        ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
