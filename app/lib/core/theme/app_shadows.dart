import 'package:flutter/material.dart';

abstract final class AppShadows {
  static const subtle = [
    BoxShadow(color: Color(0x0A10201C), blurRadius: 12, offset: Offset(0, 4)),
  ];

  static const floating = [
    BoxShadow(color: Color(0x1210201C), blurRadius: 24, offset: Offset(0, 10)),
  ];
}
