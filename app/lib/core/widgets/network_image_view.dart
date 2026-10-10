import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:pakhlai_mobile/core/theme/app_colors.dart';

class NetworkImageView extends StatelessWidget {
  const NetworkImageView({
    required this.imageUrl,
    super.key,
    this.fit = BoxFit.cover,
    this.borderRadius,
    this.aspectRatio,
  });

  final String? imageUrl;
  final BoxFit fit;
  final BorderRadius? borderRadius;
  final double? aspectRatio;

  @override
  Widget build(BuildContext context) {
    final image = ClipRRect(
      borderRadius: borderRadius ?? BorderRadius.zero,
      child: imageUrl == null || imageUrl!.isEmpty
          ? const _ImageFallback()
          : CachedNetworkImage(
              imageUrl: imageUrl!,
              fit: fit,
              fadeInDuration: const Duration(milliseconds: 180),
              placeholder: (context, url) => const _ImagePlaceholder(),
              errorWidget: (context, url, error) => const _ImageFallback(),
            ),
    );
    return aspectRatio == null
        ? image
        : AspectRatio(aspectRatio: aspectRatio!, child: image);
  }
}

class _ImagePlaceholder extends StatelessWidget {
  const _ImagePlaceholder();

  @override
  Widget build(BuildContext context) => Container(
    color: Theme.of(context).colorScheme.surfaceContainerHighest,
    alignment: Alignment.center,
    child: const SizedBox.square(
      dimension: 20,
      child: CircularProgressIndicator(strokeWidth: 2),
    ),
  );
}

class _ImageFallback extends StatelessWidget {
  const _ImageFallback();

  @override
  Widget build(BuildContext context) => Container(
    color: AppColors.brandSoft,
    alignment: Alignment.center,
    child: const Icon(
      Icons.restaurant_rounded,
      color: AppColors.brand,
      size: 30,
    ),
  );
}
