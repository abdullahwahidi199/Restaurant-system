import 'package:flutter/material.dart';

abstract final class AppTypography {
  static TextTheme textTheme(Color color, Color mutedColor) => TextTheme(
    displaySmall: TextStyle(
      fontSize: 26,
      height: 1.15,
      fontWeight: FontWeight.w700,
      letterSpacing: -0.5,
      color: color,
    ),
    headlineSmall: TextStyle(
      fontSize: 23,
      height: 1.2,
      fontWeight: FontWeight.w700,
      letterSpacing: -0.35,
      color: color,
    ),
    titleLarge: TextStyle(
      fontSize: 19,
      height: 1.25,
      fontWeight: FontWeight.w600,
      letterSpacing: -0.2,
      color: color,
    ),
    titleMedium: TextStyle(
      fontSize: 16,
      height: 1.3,
      fontWeight: FontWeight.w600,
      color: color,
    ),
    titleSmall: TextStyle(
      fontSize: 14,
      height: 1.35,
      fontWeight: FontWeight.w600,
      color: color,
    ),
    bodyLarge: TextStyle(fontSize: 15, height: 1.45, color: color),
    bodyMedium: TextStyle(fontSize: 14, height: 1.45, color: color),
    bodySmall: TextStyle(fontSize: 12, height: 1.4, color: mutedColor),
    labelLarge: TextStyle(
      fontSize: 14,
      height: 1.2,
      fontWeight: FontWeight.w600,
      color: color,
    ),
    labelMedium: TextStyle(
      fontSize: 12,
      height: 1.2,
      fontWeight: FontWeight.w600,
      color: color,
    ),
    labelSmall: TextStyle(
      fontSize: 11,
      height: 1.2,
      fontWeight: FontWeight.w600,
      color: mutedColor,
    ),
  );
}
