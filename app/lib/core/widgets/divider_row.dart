import 'package:flutter/material.dart';

class DividerRow extends StatelessWidget {
  const DividerRow({
    required this.label,
    required this.value,
    super.key,
    this.emphasized = false,
  });

  final String label;
  final Widget value;
  final bool emphasized;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 10),
    child: Row(
      children: [
        Expanded(
          child: Text(
            label,
            style: emphasized
                ? Theme.of(context).textTheme.titleSmall
                : Theme.of(context).textTheme.bodyMedium,
          ),
        ),
        const SizedBox(width: 12),
        DefaultTextStyle.merge(
          style: emphasized
              ? Theme.of(context).textTheme.titleSmall
              : Theme.of(context).textTheme.bodyMedium,
          child: value,
        ),
      ],
    ),
  );
}
