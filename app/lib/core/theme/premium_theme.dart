import 'package:flutter/material.dart';
import 'package:pakhlai_mobile/core/theme/app_colors.dart';
import 'package:pakhlai_mobile/core/theme/app_radius.dart';
import 'package:pakhlai_mobile/core/theme/app_typography.dart';

/// The expressive Pakhlai theme. Kept separate from the compatibility theme
/// builder so the new visual system remains easy to evolve.
abstract final class PremiumTheme {
  static ThemeData get light => _build(Brightness.light);
  static ThemeData get dark => _build(Brightness.dark);

  static ThemeData _build(Brightness brightness) {
    final isDark = brightness == Brightness.dark;
    final canvas = isDark ? AppColors.darkCanvas : AppColors.canvas;
    final surface = isDark ? AppColors.darkSurface : AppColors.surface;
    final muted = isDark ? AppColors.darkSurfaceMuted : AppColors.surfaceMuted;
    final border = isDark ? AppColors.darkBorder : AppColors.border;
    final text = isDark ? AppColors.darkTextPrimary : AppColors.textPrimary;
    final secondary = isDark
        ? AppColors.darkTextSecondary
        : AppColors.textSecondary;
    final scheme =
        ColorScheme.fromSeed(
          seedColor: AppColors.brand,
          brightness: brightness,
          primary: AppColors.brand,
          surface: surface,
          error: AppColors.error,
        ).copyWith(
          primary: AppColors.brand,
          onPrimary: Colors.white,
          primaryContainer: isDark ? AppColors.brandDeep : AppColors.brandSoft,
          onPrimaryContainer: isDark ? Colors.white : AppColors.brandDeep,
          secondary: AppColors.accent,
          onSecondary: AppColors.textPrimary,
          surface: surface,
          onSurface: text,
          onSurfaceVariant: secondary,
          outline: border,
          outlineVariant: border.withValues(alpha: 0.72),
          surfaceContainerLowest: surface,
          surfaceContainerLow: isDark ? muted : AppColors.surfaceWarm,
          surfaceContainer: muted,
          surfaceContainerHigh: muted,
          surfaceContainerHighest: muted,
        );
    final textTheme = AppTypography.textTheme(text, secondary);
    final mediumShape = RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(AppRadius.md),
    );
    final inputBorder = OutlineInputBorder(
      borderRadius: BorderRadius.circular(AppRadius.md),
      borderSide: BorderSide(color: border.withValues(alpha: 0.82)),
    );

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: scheme,
      scaffoldBackgroundColor: canvas,
      canvasColor: canvas,
      textTheme: textTheme,
      dividerColor: border.withValues(alpha: 0.78),
      splashFactory: InkRipple.splashFactory,
      visualDensity: VisualDensity.standard,
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: _SmoothPageTransitionsBuilder(),
          TargetPlatform.iOS: _SmoothPageTransitionsBuilder(),
          TargetPlatform.macOS: _SmoothPageTransitionsBuilder(),
          TargetPlatform.windows: _SmoothPageTransitionsBuilder(),
          TargetPlatform.linux: _SmoothPageTransitionsBuilder(),
        },
      ),
      appBarTheme: AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        backgroundColor: canvas,
        foregroundColor: text,
        surfaceTintColor: Colors.transparent,
        titleSpacing: 18,
        toolbarHeight: 62,
        titleTextStyle: textTheme.titleLarge,
        iconTheme: IconThemeData(color: text, size: 22),
      ),
      cardTheme: CardThemeData(
        margin: EdgeInsets.zero,
        elevation: isDark ? 0 : 1.1,
        shadowColor: const Color(0x243A2116),
        color: surface,
        surfaceTintColor: Colors.transparent,
        clipBehavior: Clip.antiAlias,
        shape: RoundedRectangleBorder(
          side: BorderSide(
            color: border.withValues(alpha: isDark ? 0.8 : 0.45),
          ),
          borderRadius: BorderRadius.circular(AppRadius.lg),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: isDark ? muted : surface,
        isDense: true,
        contentPadding: const EdgeInsetsDirectional.fromSTEB(16, 16, 16, 16),
        hintStyle: textTheme.bodyMedium?.copyWith(color: AppColors.textMuted),
        labelStyle: textTheme.bodyMedium?.copyWith(color: secondary),
        floatingLabelStyle: textTheme.labelMedium?.copyWith(
          color: AppColors.brandDark,
        ),
        prefixIconColor: secondary,
        suffixIconColor: secondary,
        border: inputBorder,
        enabledBorder: inputBorder,
        focusedBorder: inputBorder.copyWith(
          borderSide: const BorderSide(color: AppColors.brand, width: 1.7),
        ),
        errorBorder: inputBorder.copyWith(
          borderSide: const BorderSide(color: AppColors.error),
        ),
        focusedErrorBorder: inputBorder.copyWith(
          borderSide: const BorderSide(color: AppColors.error, width: 1.7),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style:
            ElevatedButton.styleFrom(
              minimumSize: const Size(48, 52),
              padding: const EdgeInsets.symmetric(horizontal: 20),
              elevation: 2,
              shadowColor: AppColors.brand.withValues(alpha: 0.35),
              backgroundColor: AppColors.brand,
              foregroundColor: Colors.white,
              disabledBackgroundColor: border,
              disabledForegroundColor: secondary,
              textStyle: textTheme.labelLarge,
              shape: mediumShape,
            ).copyWith(
              overlayColor: WidgetStatePropertyAll(
                Colors.white.withValues(alpha: 0.12),
              ),
            ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(48, 48),
          padding: const EdgeInsets.symmetric(horizontal: 18),
          backgroundColor: AppColors.brand,
          foregroundColor: Colors.white,
          textStyle: textTheme.labelLarge,
          shape: mediumShape,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size(48, 52),
          padding: const EdgeInsets.symmetric(horizontal: 20),
          foregroundColor: text,
          backgroundColor: surface.withValues(alpha: 0.65),
          side: BorderSide(color: border),
          textStyle: textTheme.labelLarge,
          shape: mediumShape,
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.brandDark,
          textStyle: textTheme.labelLarge,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.sm),
          ),
        ),
      ),
      iconButtonTheme: IconButtonThemeData(
        style: IconButton.styleFrom(
          foregroundColor: text,
          highlightColor: AppColors.brand.withValues(alpha: 0.10),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.md),
          ),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        height: 72,
        elevation: 0,
        backgroundColor: Colors.transparent,
        indicatorColor: AppColors.brandSoft,
        indicatorShape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          final active = states.contains(WidgetState.selected);
          return textTheme.labelSmall?.copyWith(
            color: active ? AppColors.brandDark : secondary,
            fontWeight: active ? FontWeight.w800 : FontWeight.w600,
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          final active = states.contains(WidgetState.selected);
          return IconThemeData(
            size: active ? 24 : 22,
            color: active ? AppColors.brand : secondary,
          );
        }),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: surface,
        selectedColor: AppColors.brandSoft,
        side: BorderSide(color: border.withValues(alpha: 0.8)),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        labelStyle: textTheme.labelMedium,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.pill),
        ),
      ),
      segmentedButtonTheme: SegmentedButtonThemeData(
        style: ButtonStyle(
          backgroundColor: WidgetStateProperty.resolveWith(
            (states) => states.contains(WidgetState.selected)
                ? AppColors.brandSoft
                : surface,
          ),
          foregroundColor: WidgetStateProperty.resolveWith(
            (states) => states.contains(WidgetState.selected)
                ? AppColors.brandDark
                : secondary,
          ),
          side: WidgetStatePropertyAll(BorderSide(color: border)),
          textStyle: WidgetStatePropertyAll(textTheme.labelMedium),
          shape: WidgetStatePropertyAll(mediumShape),
          padding: const WidgetStatePropertyAll(
            EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          ),
        ),
      ),
      listTileTheme: ListTileThemeData(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 3),
        iconColor: AppColors.brandDark,
        textColor: text,
        titleTextStyle: textTheme.bodyMedium?.copyWith(
          fontWeight: FontWeight.w600,
        ),
        subtitleTextStyle: textTheme.bodySmall,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
      ),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: surface,
        surfaceTintColor: Colors.transparent,
        showDragHandle: true,
        elevation: 16,
        shadowColor: const Color(0x383A2116),
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(AppRadius.xl),
          ),
        ),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: surface,
        surfaceTintColor: Colors.transparent,
        elevation: 12,
        shadowColor: const Color(0x303A2116),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.xl),
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: text,
        contentTextStyle: textTheme.bodyMedium?.copyWith(color: surface),
        elevation: 8,
        insetPadding: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: AppColors.brand,
        linearTrackColor: AppColors.brandSoft,
      ),
    );
  }
}

class _SmoothPageTransitionsBuilder extends PageTransitionsBuilder {
  const _SmoothPageTransitionsBuilder();

  @override
  Widget buildTransitions<T>(
    PageRoute<T> route,
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    final curved = CurvedAnimation(
      parent: animation,
      curve: Curves.easeOutCubic,
      reverseCurve: Curves.easeInCubic,
    );
    return FadeTransition(
      opacity: curved,
      child: SlideTransition(
        position: Tween<Offset>(
          begin: const Offset(0.035, 0.015),
          end: Offset.zero,
        ).animate(curved),
        child: child,
      ),
    );
  }
}
