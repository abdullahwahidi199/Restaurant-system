import 'package:flutter/material.dart';
import 'package:pakhlai_mobile/core/theme/app_colors.dart';

class FormLabel extends StatelessWidget {
  const FormLabel(this.label, {super.key, this.required = false});

  final String label;
  final bool required;

  @override
  Widget build(BuildContext context) => Text.rich(
    TextSpan(
      text: label,
      children: [
        if (required)
          const TextSpan(
            text: ' *',
            style: TextStyle(color: AppColors.error),
          ),
      ],
    ),
    style: Theme.of(context).textTheme.labelMedium,
  );
}

class ValidationMessage extends StatelessWidget {
  const ValidationMessage(this.message, {super.key});

  final String message;

  @override
  Widget build(BuildContext context) => Row(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      const Icon(Icons.error_outline_rounded, size: 15, color: AppColors.error),
      const SizedBox(width: 6),
      Expanded(
        child: Text(
          message,
          style: Theme.of(context).textTheme.bodySmall
              ?.copyWith(color: AppColors.error),
        ),
      ),
    ],
  );
}
