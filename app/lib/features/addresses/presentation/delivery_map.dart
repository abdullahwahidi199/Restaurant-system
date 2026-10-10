import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:pakhlai_mobile/core/errors/app_exception.dart';
import 'package:pakhlai_mobile/core/theme/app_colors.dart';
import 'package:pakhlai_mobile/core/widgets/app_buttons.dart';
import 'package:pakhlai_mobile/features/addresses/data/location_service.dart';
import 'package:pakhlai_mobile/features/addresses/domain/delivery_point.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';

abstract final class DeliveryMapConfig {
  static const tileUrl = String.fromEnvironment(
    'MAP_TILE_URL',
    defaultValue: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  );
  static const attribution = String.fromEnvironment(
    'MAP_ATTRIBUTION',
    defaultValue: '© OpenStreetMap contributors',
  );
  static const attributionUrl = String.fromEnvironment(
    'MAP_ATTRIBUTION_URL',
    defaultValue: 'https://www.openstreetmap.org/copyright',
  );
  // Viewport only. This must never become a delivery pin without user selection.
  static const initialCenter = LatLng(34.5553, 69.2075);
}

final mapTileProviderFactoryProvider = Provider<TileProvider Function()>(
  (ref) =>
      () => NetworkTileProvider(
        cachingProvider: BuiltInMapCachingProvider.getOrCreateInstance(
          maxCacheSize: 80000000,
        ),
      ),
);

String locationErrorMessage(Object error, AppLocalizations s) =>
    switch (error) {
      AppException(code: 'location_permission') => s.locationPermissionHelp,
      AppException(code: 'location_disabled') => s.locationDisabledHelp,
      AppException(code: 'location_timeout') => s.locationTimeoutHelp,
      AppException(code: 'location_insecure') => s.locationSecureHelp,
      _ => s.locationUnavailableHelp,
    };

Future<DeliveryPoint?> showDeliveryMap(
  BuildContext context, {
  DeliveryPoint? initialPoint,
  bool locateOnOpen = false,
}) => Navigator.of(context).push<DeliveryPoint>(
  MaterialPageRoute(
    builder: (_) => DeliveryMapScreen(
      initialPoint: initialPoint,
      locateOnOpen: locateOnOpen,
    ),
  ),
);

class DeliveryMapScreen extends ConsumerStatefulWidget {
  const DeliveryMapScreen({
    super.key,
    this.initialPoint,
    this.locateOnOpen = false,
  });
  final DeliveryPoint? initialPoint;
  final bool locateOnOpen;
  @override
  ConsumerState<DeliveryMapScreen> createState() => _DeliveryMapScreenState();
}

class _DeliveryMapScreenState extends ConsumerState<DeliveryMapScreen> {
  final _map = MapController();
  final _link = TextEditingController();
  DeliveryPoint? _point;
  bool _locating = false;
  bool _tileFailure = false;
  int _tileVersion = 0;
  String? _error;
  @override
  void initState() {
    super.initState();
    _point = widget.initialPoint?.isValid == true ? widget.initialPoint : null;
    if (widget.locateOnOpen) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _locate();
      });
    }
  }

  @override
  void dispose() {
    _map.dispose();
    _link.dispose();
    super.dispose();
  }

  void _select(LatLng point) {
    final selected = DeliveryPoint(point.latitude, point.longitude);
    if (!selected.isValid) return;
    setState(() {
      _point = selected;
      _error = null;
    });
  }

  Future<void> _locate() async {
    if (_locating) return;
    setState(() {
      _locating = true;
      _error = null;
    });
    try {
      final point = await ref.read(locationServiceProvider).currentLocation();
      if (!mounted) return;
      _map.move(LatLng(point.latitude, point.longitude), 17);
      setState(() {
        if ((point.accuracyMeters ?? 0) > 300) {
          _point = null;
          _error = AppLocalizations.of(context).approximateLocationHelp;
        } else {
          _point = point;
        }
      });
    } catch (error) {
      if (mounted) {
        setState(
          () => _error = locationErrorMessage(
            error,
            AppLocalizations.of(context),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _locating = false);
    }
  }

  void _applyLink() {
    final point = DeliveryPoint.parse(_link.text);
    if (point == null) {
      setState(() => _error = AppLocalizations.of(context).invalidMapLink);
      return;
    }
    FocusScope.of(context).unfocus();
    _map.move(LatLng(point.latitude, point.longitude), 17);
    setState(() {
      _point = point;
      _error = null;
    });
  }

  void _tileError() {
    if (_tileFailure) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted && !_tileFailure) setState(() => _tileFailure = true);
    });
  }

  @override
  Widget build(BuildContext context) {
    final s = AppLocalizations.of(context);
    final initial = widget.initialPoint;
    return Scaffold(
      appBar: AppBar(title: Text(s.chooseDeliveryLocation)),
      body: Column(
        children: [
          Expanded(
            child: Stack(
              children: [
                FlutterMap(
                  mapController: _map,
                  options: MapOptions(
                    initialCenter: initial?.isValid == true
                        ? LatLng(initial!.latitude, initial.longitude)
                        : DeliveryMapConfig.initialCenter,
                    initialZoom: initial == null ? 13 : 17,
                    minZoom: 3,
                    maxZoom: 19,
                    interactionOptions: const InteractionOptions(
                      flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
                    ),
                    onTap: (_, point) {
                      _map.move(point, _map.camera.zoom);
                      _select(point);
                    },
                    onPositionChanged: (camera, gesture) {
                      if (gesture && !_locating) _select(camera.center);
                    },
                  ),
                  children: [
                    _MapTiles(key: ValueKey(_tileVersion), onError: _tileError),
                  ],
                ),
                Center(
                  child: IgnorePointer(
                    child: Semantics(
                      label: s.deliveryPin,
                      child: Transform.translate(
                        offset: const Offset(0, -24),
                        child: const Icon(
                          Icons.location_on_rounded,
                          size: 48,
                          color: AppColors.brand,
                        ),
                      ),
                    ),
                  ),
                ),
                PositionedDirectional(
                  start: 16,
                  end: 16,
                  top: 16,
                  child: Material(
                    color: Colors.white,
                    elevation: 2,
                    borderRadius: BorderRadius.circular(14),
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Text(s.movePinHelp, textAlign: TextAlign.center),
                    ),
                  ),
                ),
                PositionedDirectional(
                  end: 16,
                  bottom: 40,
                  child: Column(
                    children: [
                      _MapControl(
                        icon: Icons.add_rounded,
                        label: s.zoomIn,
                        onPressed: () => _map.move(
                          _map.camera.center,
                          (_map.camera.zoom + 1).clamp(3, 19),
                        ),
                      ),
                      const SizedBox(height: 8),
                      _MapControl(
                        icon: Icons.remove_rounded,
                        label: s.zoomOut,
                        onPressed: () => _map.move(
                          _map.camera.center,
                          (_map.camera.zoom - 1).clamp(3, 19),
                        ),
                      ),
                      const SizedBox(height: 12),
                      _MapControl(
                        icon: Icons.my_location_rounded,
                        label: s.useCurrentLocation,
                        onPressed: _locating ? null : _locate,
                      ),
                    ],
                  ),
                ),
                const PositionedDirectional(
                  start: 0,
                  bottom: 0,
                  child: _MapAttribution(),
                ),
              ],
            ),
          ),
          SafeArea(
            top: false,
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxHeight: MediaQuery.sizeOf(context).height * .5,
              ),
              child: SingleChildScrollView(
                padding: const EdgeInsetsDirectional.fromSTEB(20, 16, 20, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      _locating
                          ? s.locatingYou
                          : _point == null
                          ? s.chooseDeliveryLocation
                          : s.pinSelected,
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 6),
                    Text(
                      s.confirmPinHelp,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                    if (_error != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 10),
                        child: Text(
                          _error!,
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.error,
                          ),
                        ),
                      ),
                    if (_tileFailure) ...[
                      const SizedBox(height: 8),
                      Text(
                        s.mapLoadFailed,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      TextButton(
                        onPressed: () => setState(() {
                          _tileFailure = false;
                          _tileVersion++;
                        }),
                        child: Text(s.retryMap),
                      ),
                    ],
                    ExpansionTile(
                      tilePadding: EdgeInsets.zero,
                      title: Text(
                        s.useMapLink,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      children: [
                        TextField(
                          controller: _link,
                          decoration: InputDecoration(
                            labelText: s.mapLink,
                            hintText: s.mapLinkHint,
                          ),
                          onSubmitted: (_) => _applyLink(),
                        ),
                        Align(
                          alignment: AlignmentDirectional.centerEnd,
                          child: TextButton(
                            onPressed: _applyLink,
                            child: Text(s.applyLocation),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    PrimaryButton(
                      label: s.confirmLocation,
                      icon: Icons.check_rounded,
                      loading: _locating,
                      onPressed: _point?.isValid == true
                          ? () {
                              Navigator.of(context).pop(_point);
                            }
                          : null,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class DeliveryMapPreview extends StatelessWidget {
  const DeliveryMapPreview({
    required this.point,
    super.key,
    this.onTap,
    this.height = 140,
  });
  final DeliveryPoint point;
  final VoidCallback? onTap;
  final double height;
  @override
  Widget build(BuildContext context) => ClipRRect(
    borderRadius: BorderRadius.circular(14),
    child: SizedBox(
      height: height,
      child: Stack(
        children: [
          IgnorePointer(
            child: FlutterMap(
              key: ValueKey('${point.latitude}:${point.longitude}'),
              options: MapOptions(
                initialCenter: LatLng(point.latitude, point.longitude),
                initialZoom: 16,
                interactionOptions: const InteractionOptions(
                  flags: InteractiveFlag.none,
                ),
              ),
              children: const [_MapTiles()],
            ),
          ),
          Center(
            child: Transform.translate(
              offset: const Offset(0, -16),
              child: const Icon(
                Icons.location_on_rounded,
                size: 34,
                color: AppColors.brand,
              ),
            ),
          ),
          if (onTap != null)
            Positioned.fill(
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: onTap,
                  child: Semantics(
                    button: true,
                    label: AppLocalizations.of(context).editPin,
                  ),
                ),
              ),
            ),
          const PositionedDirectional(
            start: 0,
            bottom: 0,
            child: _MapAttribution(),
          ),
        ],
      ),
    ),
  );
}

class _MapTiles extends ConsumerStatefulWidget {
  const _MapTiles({super.key, this.onError});
  final VoidCallback? onError;
  @override
  ConsumerState<_MapTiles> createState() => _MapTilesState();
}

class _MapTilesState extends ConsumerState<_MapTiles> {
  late final TileProvider _provider = ref.read(
    mapTileProviderFactoryProvider,
  )();
  @override
  Widget build(BuildContext context) => TileLayer(
    urlTemplate: DeliveryMapConfig.tileUrl,
    userAgentPackageName: 'com.pakhlai.marketplace',
    tileProvider: _provider,
    panBuffer: 0,
    maxNativeZoom: 19,
    errorTileCallback: (_, _, _) => widget.onError?.call(),
  );
}

class _MapAttribution extends StatelessWidget {
  const _MapAttribution();
  @override
  Widget build(BuildContext context) => Material(
    color: Colors.white.withValues(alpha: .92),
    child: InkWell(
      onTap: () async {
        final url = Uri.tryParse(DeliveryMapConfig.attributionUrl);
        if (url != null && url.scheme == 'https') {
          try {
            await launchUrl(url, mode: LaunchMode.externalApplication);
          } catch (_) {
            /* Attribution remains visible. */
          }
        }
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        child: Text(
          DeliveryMapConfig.attribution,
          style: const TextStyle(fontSize: 10, color: AppColors.textSecondary),
        ),
      ),
    ),
  );
}

class _MapControl extends StatelessWidget {
  const _MapControl({
    required this.icon,
    required this.label,
    required this.onPressed,
  });
  final IconData icon;
  final String label;
  final VoidCallback? onPressed;
  @override
  Widget build(BuildContext context) => Material(
    color: Colors.white,
    elevation: 2,
    borderRadius: BorderRadius.circular(12),
    child: IconButton(
      tooltip: label,
      onPressed: onPressed,
      icon: Icon(icon, color: AppColors.brandDark),
      constraints: const BoxConstraints(minWidth: 48, minHeight: 48),
    ),
  );
}
