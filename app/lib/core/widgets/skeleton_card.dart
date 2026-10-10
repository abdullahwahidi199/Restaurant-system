import 'package:flutter/material.dart';
import 'package:pakhlai_mobile/core/theme/app_radius.dart';

class SkeletonCard extends StatefulWidget {
  const SkeletonCard({super.key, this.height = 140, this.width});

  final double height;
  final double? width;

  @override
  State<SkeletonCard> createState() => _SkeletonCardState();
}

class _SkeletonCardState extends State<SkeletonCard>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 850),
  )..repeat(reverse: true);

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AnimatedBuilder(
    animation: _controller,
    builder: (context, child) => Container(
      width: widget.width,
      height: widget.height,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest
            .withValues(alpha: 0.55 + (_controller.value * 0.25)),
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
    ),
  );
}
