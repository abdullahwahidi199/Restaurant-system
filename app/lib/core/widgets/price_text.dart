import 'package:flutter/material.dart';
import 'package:pakhlai_mobile/core/utils/currency_formatter.dart';

class PriceText extends StatelessWidget {
  const PriceText(this.amount, {super.key, this.style});

  final num amount;
  final TextStyle? style;

  @override
  Widget build(BuildContext context) => Text(
    CurrencyFormatter.format(amount),
    maxLines: 1,
    overflow: TextOverflow.ellipsis,
    style:
        style ??
        Theme.of(context).textTheme.titleSmall
            ?.copyWith(fontFeatures: const [FontFeature.tabularFigures()]),
  );
}
