import 'package:flutter/material.dart';

/// A small, reusable piece of tactile feedback for cards and primary actions.
/// It intentionally leaves tap handling to its child so existing semantics,
/// ripples, and disabled states continue to work.
class PressableScale extends StatefulWidget {
  const PressableScale({
    required this.child,
    super.key,
    this.enabled = true,
    this.pressedScale = 0.985,
  });

  final Widget child;
  final bool enabled;
  final double pressedScale;

  @override
  State<PressableScale> createState() => _PressableScaleState();
}

class _PressableScaleState extends State<PressableScale> {
  var _pressed = false;

  void _setPressed(bool value) {
    if (!widget.enabled || _pressed == value) return;
    setState(() => _pressed = value);
  }

  @override
  Widget build(BuildContext context) {
    final reduceMotion =
        MediaQuery.maybeOf(context)?.disableAnimations ?? false;
    return Listener(
      onPointerDown: (_) => _setPressed(true),
      onPointerUp: (_) => _setPressed(false),
      onPointerCancel: (_) => _setPressed(false),
      child: AnimatedScale(
        scale: _pressed ? widget.pressedScale : 1,
        duration: reduceMotion
            ? Duration.zero
            : const Duration(milliseconds: 130),
        curve: Curves.easeOutCubic,
        child: widget.child,
      ),
    );
  }
}
