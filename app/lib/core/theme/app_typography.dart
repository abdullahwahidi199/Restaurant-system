import 'package:flutter/material.dart';

abstract final class AppTypography {
  static TextTheme textTheme(Color color, Color mutedColor) => TextTheme(
    displaySmall: TextStyle(
      fontSize: 30,
      height: 1.1,
      fontWeight: FontWeight.w800,
      letterSpacing: -0.9,
      color: color,
    ),
    headlineSmall: TextStyle(
      fontSize: 25,
      height: 1.15,
      fontWeight: FontWeight.w800,
      letterSpacing: -0.65,
      color: color,
    ),
    titleLarge: TextStyle(
      fontSize: 20,
      height: 1.22,
      fontWeight: FontWeight.w700,
      letterSpacing: -0.35,
      color: color,
    ),
    titleMedium: TextStyle(
      fontSize: 16,
      height: 1.3,
      fontWeight: FontWeight.w700,
      letterSpacing: -0.12,
      color: color,
    ),
    titleSmall: TextStyle(
      fontSize: 14,
      height: 1.35,
      fontWeight: FontWeight.w700,
      color: color,
    ),
    bodyLarge: TextStyle(fontSize: 16, height: 1.5, color: color),
    bodyMedium: TextStyle(fontSize: 14, height: 1.5, color: color),
    bodySmall: TextStyle(fontSize: 12.5, height: 1.45, color: mutedColor),
    labelLarge: TextStyle(
      fontSize: 14,
      height: 1.2,
      fontWeight: FontWeight.w700,
      color: color,
    ),
    labelMedium: TextStyle(
      fontSize: 12,
      height: 1.2,
      fontWeight: FontWeight.w700,
      color: color,
    ),
    labelSmall: TextStyle(
      fontSize: 11,
      height: 1.2,
      fontWeight: FontWeight.w700,
      color: mutedColor,
    ),
  );
}
