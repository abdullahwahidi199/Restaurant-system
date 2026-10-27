import 'package:flutter/material.dart';

abstract final class AppShadows {
  static const subtle = [
    BoxShadow(color: Color(0x0D332017), blurRadius: 18, offset: Offset(0, 6)),
  ];

  static const floating = [
    BoxShadow(color: Color(0x1A4C2B1D), blurRadius: 32, offset: Offset(0, 14)),
  ];

  static const brandGlow = [
    BoxShadow(color: Color(0x38F25A24), blurRadius: 26, offset: Offset(0, 10)),
  ];
}
