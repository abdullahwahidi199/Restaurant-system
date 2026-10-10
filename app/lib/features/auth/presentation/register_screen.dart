import 'package:pakhlai_mobile/core/errors/customer_error_message.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:pakhlai_mobile/app/router/app_routes.dart';
import 'package:pakhlai_mobile/core/theme/app_spacing.dart';
import 'package:pakhlai_mobile/core/widgets/app_buttons.dart';
import 'package:pakhlai_mobile/core/widgets/app_text_field.dart';
import 'package:pakhlai_mobile/features/auth/application/auth_controller.dart';
import 'package:pakhlai_mobile/features/auth/presentation/auth_validators.dart';
import 'package:pakhlai_mobile/features/auth/presentation/widgets/auth_layout.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key, this.returnTo});
  final String? returnTo;

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _birthDateController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmationController = TextEditingController();
  var _submitting = false;

  @override
  void dispose() {
    _usernameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _birthDateController.dispose();
    _passwordController.dispose();
    _confirmationController.dispose();
    super.dispose();
  }

  Future<void> _selectBirthDate() async {
    final now = DateTime.now();
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime(now.year - 20),
      firstDate: DateTime(1900),
      lastDate: now,
    );
    if (date != null) {
      _birthDateController.text = DateFormat('yyyy-MM-dd').format(date);
    }
  }

  Future<void> _submit(AppLocalizations strings) async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() => _submitting = true);
    try {
      await ref
          .read(authControllerProvider.notifier)
          .register(
            username: _usernameController.text,
            password: _passwordController.text,
            email: _emailController.text,
            phone: _phoneController.text,
            address: _addressController.text,
            dateOfBirth: _birthDateController.text,
          );
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(strings.accountCreated)));
      context.go(
        AppRoutes.authPath(AppRoutes.login, returnTo: widget.returnTo),
      );
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

  @override
  Widget build(BuildContext context) {
    final strings = AppLocalizations.of(context);
    return AuthLayout(
      title: strings.registerTitle,
      subtitle: strings.registerSubtitle,
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
              autofillHints: const [AutofillHints.newUsername],
              validator: (value) => AuthValidators.required(value, strings),
            ),
            const SizedBox(height: AppSpacing.md),
            AppTextField(
              controller: _emailController,
              label: strings.emailOptional,
              prefixIcon: Icons.mail_outline_rounded,
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.next,
              autofillHints: const [AutofillHints.email],
              validator: (value) =>
                  AuthValidators.optionalEmail(value, strings),
            ),
            const SizedBox(height: AppSpacing.md),
            AppTextField(
              controller: _phoneController,
              label: strings.phone,
              prefixIcon: Icons.phone_outlined,
              keyboardType: TextInputType.phone,
              textInputAction: TextInputAction.next,
              autofillHints: const [AutofillHints.telephoneNumber],
              validator: (value) => AuthValidators.required(value, strings),
            ),
            const SizedBox(height: AppSpacing.md),
            AppTextField(
              controller: _addressController,
              label: strings.address,
              prefixIcon: Icons.location_on_outlined,
              textInputAction: TextInputAction.next,
              autofillHints: const [AutofillHints.fullStreetAddress],
              validator: (value) => AuthValidators.required(value, strings),
            ),
            const SizedBox(height: AppSpacing.md),
            AppTextField(
              controller: _birthDateController,
              label: strings.dateOfBirth,
              prefixIcon: Icons.cake_outlined,
              readOnly: true,
              onTap: _selectBirthDate,
              validator: (value) => AuthValidators.required(value, strings),
            ),
            const SizedBox(height: AppSpacing.md),
            PasswordField(
              controller: _passwordController,
              label: strings.password,
              showPasswordLabel: strings.showPassword,
              hidePasswordLabel: strings.hidePassword,
              autofillHints: const [AutofillHints.newPassword],
              textInputAction: TextInputAction.next,
              validator: (value) => AuthValidators.password(value, strings),
            ),
            const SizedBox(height: AppSpacing.md),
            PasswordField(
              controller: _confirmationController,
              label: strings.confirmPassword,
              showPasswordLabel: strings.showPassword,
              hidePasswordLabel: strings.hidePassword,
              autofillHints: const [AutofillHints.newPassword],
              textInputAction: TextInputAction.done,
              validator: (value) {
                final error = AuthValidators.password(value, strings);
                if (error != null) return error;
                return value == _passwordController.text
                    ? null
                    : strings.passwordMismatch;
              },
              onSubmitted: (_) => _submit(strings),
            ),
            const SizedBox(height: AppSpacing.lg),
            PrimaryButton(
              label: strings.createAccount,
              loading: _submitting,
              onPressed: _submitting ? null : () => _submit(strings),
            ),
            const SizedBox(height: AppSpacing.md),
            Wrap(
              alignment: WrapAlignment.center,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                Text(
                  strings.alreadyHaveAccount,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                TextActionButton(
                  label: strings.signIn,
                  onPressed: _submitting
                      ? null
                      : () => context.pushReplacement(
                          AppRoutes.authPath(
                            AppRoutes.login,
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
