import 'package:pakhlai_mobile/core/errors/customer_error_message.dart';

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pakhlai_mobile/app/router/app_routes.dart';
import 'package:pakhlai_mobile/core/theme/app_radius.dart';
import 'package:pakhlai_mobile/core/theme/app_spacing.dart';
import 'package:pakhlai_mobile/core/widgets/app_buttons.dart';
import 'package:pakhlai_mobile/core/widgets/bottom_sheet_container.dart';
import 'package:pakhlai_mobile/core/widgets/network_image_view.dart';
import 'package:pakhlai_mobile/core/widgets/price_text.dart';
import 'package:pakhlai_mobile/core/widgets/search_field.dart';
import 'package:pakhlai_mobile/core/widgets/section_header.dart';
import 'package:pakhlai_mobile/core/widgets/skeleton_card.dart';
import 'package:pakhlai_mobile/core/widgets/state_views.dart';
import 'package:pakhlai_mobile/features/marketplace/application/marketplace_providers.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/discovery_data.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/menu_models.dart';
import 'package:pakhlai_mobile/features/marketplace/domain/restaurant_models.dart';
import 'package:pakhlai_mobile/features/marketplace/presentation/widgets/restaurant_cards.dart';
import 'package:pakhlai_mobile/features/search/application/recent_searches_controller.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key, this.initialQuery = ''});

  final String initialQuery;

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  late final TextEditingController _controller;
  Timer? _debounce;
  late String _query;
  var _filters = const _SearchFilters();

  @override
  void initState() {
    super.initState();
    _query = widget.initialQuery.trim();
    _controller = TextEditingController(text: _query);
  }

  @override
  void didUpdateWidget(covariant SearchScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialQuery != widget.initialQuery) {
      _query = widget.initialQuery.trim();
      _controller.text = _query;
    }
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _controller.dispose();
    super.dispose();
  }

  void _onChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 320), () {
      if (mounted) setState(() => _query = value.trim());
    });
    setState(() {});
  }

  Future<void> _submit(String value) async {
    _debounce?.cancel();
    final query = value.trim();
    setState(() => _query = query);
    await ref.read(recentSearchesProvider.notifier).add(query);
  }

  void _useQuery(String query) {
    _controller.text = query;
    _controller.selection = TextSelection.collapsed(offset: query.length);
    _submit(query);
  }

  Future<void> _openFilters(DiscoveryData data) async {
    final result = await _showFilterSheet(
      context: context,
      initial: _filters,
      cuisines: data.cuisines.map((item) => item.name).toList(),
    );
    if (result != null && mounted) setState(() => _filters = result);
  }

  @override
  Widget build(BuildContext context) {
    final strings = AppLocalizations.of(context);
    final discovery = ref.watch(searchDiscoveryProvider(_query));
    final recent = ref.watch(recentSearchesProvider);
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.pagePadding,
                AppSpacing.md,
                AppSpacing.compactPagePadding,
                AppSpacing.sm,
              ),
              child: Row(
                children: [
                  Expanded(
                    child: SearchField(
                      controller: _controller,
                      hint: strings.searchHint,
                      autofocus: widget.initialQuery.isEmpty,
                      onChanged: _onChanged,
                      onSubmitted: _submit,
                      suffix: _controller.text.isEmpty
                          ? null
                          : IconButton(
                              tooltip: strings.clearAll,
                              onPressed: () {
                                _controller.clear();
                                _debounce?.cancel();
                                setState(() => _query = '');
                              },
                              icon: const Icon(Icons.close_rounded, size: 18),
                            ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filledTonal(
                    tooltip: strings.filters,
                    onPressed: discovery.value == null
                        ? null
                        : () => _openFilters(discovery.value!),
                    icon: Badge(
                      isLabelVisible: _filters.isActive,
                      child: const Icon(Icons.tune_rounded, size: 20),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: discovery.when(
                loading: () => const _SearchSkeleton(),
                error: (error, stackTrace) => ErrorState(
                  title: strings.somethingWentWrong,
                  description: customerErrorMessage(
                    error,
                    AppLocalizations.of(context),
                  ),
                  retryLabel: strings.retry,
                  onRetry: () =>
                      ref.invalidate(searchDiscoveryProvider(_query)),
                ),
                data: (data) => _SearchResults(
                  data: data,
                  query: _query,
                  filters: _filters,
                  recent: recent.value ?? const [],
                  onQuerySelected: _useQuery,
                  onClearRecent: () =>
                      ref.read(recentSearchesProvider.notifier).clear(),
                  onResultOpened: () =>
                      ref.read(recentSearchesProvider.notifier).add(_query),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

enum _SearchSort { recommended, rating, deliveryFee }

class _SearchFilters {
  const _SearchFilters({
    this.sort = _SearchSort.recommended,
    this.openNow = false,
    this.freeDelivery = false,
    this.cuisine,
  });

  final _SearchSort sort;
  final bool openNow;
  final bool freeDelivery;
  final String? cuisine;

  bool get isActive =>
      sort != _SearchSort.recommended ||
      openNow ||
      freeDelivery ||
      cuisine != null;

  _SearchFilters copyWith({
    _SearchSort? sort,
    bool? openNow,
    bool? freeDelivery,
    String? cuisine,
    bool clearCuisine = false,
  }) {
    return _SearchFilters(
      sort: sort ?? this.sort,
      openNow: openNow ?? this.openNow,
      freeDelivery: freeDelivery ?? this.freeDelivery,
      cuisine: clearCuisine ? null : cuisine ?? this.cuisine,
    );
  }
}

class _SearchResults extends StatelessWidget {
  const _SearchResults({
    required this.data,
    required this.query,
    required this.filters,
    required this.recent,
    required this.onQuerySelected,
    required this.onClearRecent,
    required this.onResultOpened,
  });

  final DiscoveryData data;
  final String query;
  final _SearchFilters filters;
  final List<String> recent;
  final ValueChanged<String> onQuerySelected;
  final VoidCallback onClearRecent;
  final VoidCallback onResultOpened;

  @override
  Widget build(BuildContext context) {
    final strings = AppLocalizations.of(context);
    final restaurants = data.restaurants.where((restaurant) {
      if (filters.openNow && restaurant.status != RestaurantStatus.open) {
        return false;
      }
      if (filters.freeDelivery && restaurant.delivery.baseFee != 0) {
        return false;
      }
      if (filters.cuisine != null &&
          !restaurant.cuisines.any(
            (item) => item.name.toLowerCase() == filters.cuisine!.toLowerCase(),
          )) {
        return false;
      }
      return true;
    }).toList();

    switch (filters.sort) {
      case _SearchSort.rating:
        restaurants.sort(
          (a, b) => (b.rating.average ?? -1).compareTo(a.rating.average ?? -1),
        );
      case _SearchSort.deliveryFee:
        restaurants.sort(
          (a, b) => a.delivery.baseFee.compareTo(b.delivery.baseFee),
        );
      case _SearchSort.recommended:
        break;
    }

    final allowedRestaurantIds = restaurants.map((item) => item.id).toSet();
    final dishes = data.dishes.where((dish) {
      if ((filters.openNow ||
              filters.freeDelivery ||
              filters.cuisine != null) &&
          !allowedRestaurantIds.contains(dish.restaurantId)) {
        return false;
      }
      return true;
    }).toList();

    if (restaurants.isEmpty && dishes.isEmpty && query.isNotEmpty) {
      return EmptyState(
        icon: Icons.search_off_rounded,
        title: strings.noSearchResults,
        description: strings.noSearchResultsDescription,
      );
    }

    return ListView(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.pagePadding,
        AppSpacing.sm,
        AppSpacing.pagePadding,
        AppSpacing.xxl,
      ),
      children: [
        if (query.isEmpty && recent.isNotEmpty) ...[
          SectionHeader(
            title: strings.recentSearches,
            actionLabel: strings.clearAll,
            onAction: onClearRecent,
          ),
          const SizedBox(height: AppSpacing.sm),
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: [
              for (final item in recent)
                ActionChip(
                  onPressed: () => onQuerySelected(item),
                  avatar: const Icon(Icons.history_rounded, size: 16),
                  label: Text(item),
                ),
            ],
          ),
          const SizedBox(height: AppSpacing.xl),
        ],
        if (query.isEmpty && data.cuisines.isNotEmpty) ...[
          SectionHeader(title: strings.suggestedSearches),
          const SizedBox(height: AppSpacing.sm),
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: [
              for (final cuisine in data.cuisines.take(8))
                ActionChip(
                  onPressed: () => onQuerySelected(cuisine.name),
                  label: Text(cuisine.name),
                ),
            ],
          ),
          const SizedBox(height: AppSpacing.xl),
        ],
        if (restaurants.isNotEmpty) ...[
          SectionHeader(title: strings.restaurants),
          const SizedBox(height: AppSpacing.sm),
          for (var index = 0; index < restaurants.length; index++) ...[
            RestaurantListCard(
              restaurant: restaurants[index],
              onTap: () {
                onResultOpened();
                context.push(AppRoutes.restaurantPath(restaurants[index].slug));
              },
            ),
            if (index != restaurants.length - 1)
              const SizedBox(height: AppSpacing.sm),
          ],
        ],
        if (dishes.isNotEmpty) ...[
          if (restaurants.isNotEmpty) const SizedBox(height: AppSpacing.xl),
          SectionHeader(title: strings.dishes),
          const SizedBox(height: AppSpacing.xs),
          for (final dish in dishes)
            _DishResultRow(
              item: dish,
              onTap: () {
                onResultOpened();
                context.push(AppRoutes.restaurantPath(dish.restaurantSlug));
              },
            ),
        ],
      ],
    );
  }
}

class _DishResultRow extends StatelessWidget {
  const _DishResultRow({required this.item, required this.onTap});

  final MarketplaceItem item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => InkWell(
    onTap: onTap,
    child: Padding(
      padding: const EdgeInsets.symmetric(vertical: 9),
      child: Row(
        children: [
          SizedBox.square(
            dimension: 58,
            child: NetworkImageView(
              imageUrl: item.imageUrl,
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
          ),
          const SizedBox(width: 11),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.titleSmall,
                ),
                const SizedBox(height: 2),
                Text(
                  item.restaurantName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          PriceText(item.price, style: Theme.of(context).textTheme.labelMedium),
          const SizedBox(width: 2),
          const Icon(Icons.chevron_right_rounded, size: 18),
        ],
      ),
    ),
  );
}

class _SearchSkeleton extends StatelessWidget {
  const _SearchSkeleton();

  @override
  Widget build(BuildContext context) => ListView.separated(
    padding: const EdgeInsets.all(AppSpacing.pagePadding),
    itemCount: 4,
    separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.sm),
    itemBuilder: (context, index) => const SkeletonCard(height: 114),
  );
}

Future<_SearchFilters?> _showFilterSheet({
  required BuildContext context,
  required _SearchFilters initial,
  required List<String> cuisines,
}) {
  final strings = AppLocalizations.of(context);
  var draft = initial;
  return showModalBottomSheet<_SearchFilters>(
    context: context,
    showDragHandle: true,
    isScrollControlled: true,
    builder: (sheetContext) => StatefulBuilder(
      builder: (context, setModalState) => BottomSheetContainer(
        title: strings.filters,
        footer: Row(
          children: [
            Expanded(
              child: SecondaryButton(
                label: strings.reset,
                expand: true,
                onPressed: () =>
                    setModalState(() => draft = const _SearchFilters()),
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: PrimaryButton(
                label: strings.applyFilters,
                onPressed: () => Navigator.of(sheetContext).pop(draft),
              ),
            ),
          ],
        ),
        child: ConstrainedBox(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.sizeOf(context).height * 0.55,
          ),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  strings.sortBy,
                  style: Theme.of(context).textTheme.titleSmall,
                ),
                const SizedBox(height: AppSpacing.sm),
                Wrap(
                  spacing: 8,
                  runSpacing: 6,
                  children: [
                    ChoiceChip(
                      label: Text(strings.recommended),
                      selected: draft.sort == _SearchSort.recommended,
                      onSelected: (_) => setModalState(
                        () => draft = draft.copyWith(
                          sort: _SearchSort.recommended,
                        ),
                      ),
                    ),
                    ChoiceChip(
                      label: Text(strings.rating),
                      selected: draft.sort == _SearchSort.rating,
                      onSelected: (_) => setModalState(
                        () => draft = draft.copyWith(sort: _SearchSort.rating),
                      ),
                    ),
                    ChoiceChip(
                      label: Text(strings.deliveryFee),
                      selected: draft.sort == _SearchSort.deliveryFee,
                      onSelected: (_) => setModalState(
                        () => draft = draft.copyWith(
                          sort: _SearchSort.deliveryFee,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.lg),
                Wrap(
                  spacing: 8,
                  runSpacing: 6,
                  children: [
                    FilterChip(
                      label: Text(strings.openNow),
                      selected: draft.openNow,
                      onSelected: (selected) => setModalState(
                        () => draft = draft.copyWith(openNow: selected),
                      ),
                    ),
                    FilterChip(
                      label: Text(strings.freeDelivery),
                      selected: draft.freeDelivery,
                      onSelected: (selected) => setModalState(
                        () => draft = draft.copyWith(freeDelivery: selected),
                      ),
                    ),
                  ],
                ),
                if (cuisines.isNotEmpty) ...[
                  const SizedBox(height: AppSpacing.lg),
                  Text(
                    strings.cuisines,
                    style: Theme.of(context).textTheme.titleSmall,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Wrap(
                    spacing: 8,
                    runSpacing: 6,
                    children: [
                      for (final cuisine in cuisines)
                        FilterChip(
                          label: Text(cuisine),
                          selected: draft.cuisine == cuisine,
                          onSelected: (selected) => setModalState(
                            () => draft = draft.copyWith(
                              cuisine: selected ? cuisine : null,
                              clearCuisine: !selected,
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    ),
  );
}
