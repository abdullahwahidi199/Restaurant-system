import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pakhlai_mobile/core/errors/customer_error_message.dart';
import 'package:pakhlai_mobile/core/theme/app_colors.dart';
import 'package:pakhlai_mobile/core/widgets/app_buttons.dart';
import 'package:pakhlai_mobile/core/widgets/app_text_field.dart';
import 'package:pakhlai_mobile/features/addresses/application/customer_addresses_controller.dart';
import 'package:pakhlai_mobile/features/addresses/domain/customer_address.dart';
import 'package:pakhlai_mobile/features/addresses/domain/delivery_point.dart';
import 'package:pakhlai_mobile/features/addresses/presentation/delivery_map.dart';
import 'package:pakhlai_mobile/features/customers/application/customer_providers.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';

class AddressEditor extends ConsumerStatefulWidget {
  const AddressEditor({
    super.key,
    this.address,
    this.prefillAddress,
    this.initialPoint,
    this.openMapOnStart = false,
    this.useCurrentLocation = false,
    this.requirePin = false,
    this.saveAndUse = false,
  });
  final CustomerAddress? address;
  final String? prefillAddress;
  final DeliveryPoint? initialPoint;
  final bool openMapOnStart;
  final bool useCurrentLocation;
  final bool requirePin;
  final bool saveAndUse;
  @override
  ConsumerState<AddressEditor> createState() => _AddressEditorState();
}

class _AddressEditorState extends ConsumerState<AddressEditor> {
  final _form = GlobalKey<FormState>();
  late final Map<String, TextEditingController> _fields;
  DeliveryPoint? _point;
  bool _saving = false, _default = false, _lineTouched = false;
  String? _error;
  @override
  void initState() {
    super.initState();
    final a = widget.address;
    _fields = {
      'label': TextEditingController(text: a?.label ?? 'Home'),
      'line': TextEditingController(
        text: a?.addressLine ?? widget.prefillAddress,
      ),
      'area': TextEditingController(text: a?.area),
      'city': TextEditingController(text: a?.city),
      'instructions': TextEditingController(text: a?.instructions),
    };
    _default =
        a?.isDefault ??
        (ref.read(customerAddressesProvider).value?.isEmpty ?? true);
    _point =
        widget.initialPoint ??
        (a?.hasLocation == true
            ? DeliveryPoint(a!.latitude!, a.longitude!)
            : null);
    _fields['line']!.addListener(() => _lineTouched = true);
    if (a == null && widget.prefillAddress == null) Future.microtask(_prefill);
    if (widget.openMapOnStart || widget.useCurrentLocation) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _pickPin(locate: widget.useCurrentLocation);
      });
    }
  }

  Future<void> _prefill() async {
    try {
      final profile = await ref.read(customerProfileProvider.future);
      if (mounted && !_lineTouched && _fields['line']!.text.isEmpty) {
        _fields['line']!.text = profile.address ?? '';
      }
    } catch (_) {
      /* The customer may enter address details manually. */
    }
  }

  @override
  void dispose() {
    for (final field in _fields.values) {
      field.dispose();
    }
    super.dispose();
  }

  Future<void> _pickPin({bool locate = false}) async {
    FocusScope.of(context).unfocus();
    final point = await showDeliveryMap(
      context,
      initialPoint: _point,
      locateOnOpen: locate,
    );
    if (point != null && mounted) {
      setState(() {
        _point = point;
        _error = null;
      });
    }
  }

  Future<void> _save() async {
    if (_saving) return;
    final s = AppLocalizations.of(context);
    // Off-screen ListView fields may be unmounted when Save is tapped.
    for (final field in _fields.entries) {
      final error = _fieldError(field.key, field.value.text, s);
      if (error != null) {
        _form.currentState?.validate();
        setState(
          () =>
              _error = field.key == 'line' ? '${s.addressLine}: $error' : error,
        );
        return;
      }
    }
    if (!(_form.currentState?.validate() ?? false)) return;
    if (widget.requirePin && _point?.isValid != true) {
      setState(() => _error = AppLocalizations.of(context).pinMissing);
      return;
    }
    setState(() {
      _saving = true;
      _error = null;
    });
    final draft = CustomerAddressDraft(
      label: _fields['label']!.text,
      addressLine: _fields['line']!.text,
      area: _fields['area']!.text,
      city: _fields['city']!.text,
      instructions: _fields['instructions']!.text,
      latitude: _point?.latitude,
      longitude: _point?.longitude,
      isDefault: _default,
    );
    try {
      final controller = ref.read(customerAddressesProvider.notifier);
      final saved = widget.address == null
          ? await controller.create(draft)
          : await controller.updateAddress(widget.address!.id, draft);
      if (mounted) Navigator.of(context).pop(saved);
    } catch (error) {
      if (mounted) {
        setState(
          () => _error = customerErrorMessage(
            error,
            AppLocalizations.of(context),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = AppLocalizations.of(context);
    return PopScope(
      canPop: !_saving,
      child: Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.viewInsetsOf(context).bottom,
        ),
        child: FractionallySizedBox(
          heightFactor: .9,
          child: AbsorbPointer(
            absorbing: _saving,
            child: Form(
              key: _form,
              child: ListView(
                padding: const EdgeInsetsDirectional.fromSTEB(20, 4, 20, 28),
                children: [
                  Text(
                    widget.address == null
                        ? s.confirmAddressDetails
                        : s.editAddress,
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    s.addressDetailsHelp,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(height: 20),
                  if (_point != null) ...[
                    DeliveryMapPreview(
                      point: _point!,
                      height: 150,
                      onTap: _pickPin,
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(
                          Icons.check_circle_rounded,
                          size: 17,
                          color: AppColors.brand,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            s.pinSelected,
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ),
                        TextButton(onPressed: _pickPin, child: Text(s.editPin)),
                      ],
                    ),
                  ] else ...[
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: AppColors.brandSoft,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Column(
                        children: [
                          const Icon(
                            Icons.location_on_outlined,
                            color: AppColors.brand,
                            size: 30,
                          ),
                          const SizedBox(height: 8),
                          Text(s.locationHelp, textAlign: TextAlign.center),
                        ],
                      ),
                    ),
                  ],
                  Wrap(
                    spacing: 8,
                    children: [
                      TextButton.icon(
                        onPressed: () => _pickPin(locate: true),
                        icon: const Icon(Icons.my_location_rounded, size: 18),
                        label: Text(s.useCurrentLocation),
                      ),
                      TextButton.icon(
                        onPressed: _pickPin,
                        icon: const Icon(Icons.map_outlined, size: 18),
                        label: Text(s.chooseOnMap),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (final entry in {
                        'Home': s.addressHome,
                        'Work': s.addressWork,
                        'Other': s.addressOther,
                      }.entries)
                        ChoiceChip(
                          label: Text(entry.value),
                          selected: _fields['label']!.text == entry.key,
                          onSelected: (_) => setState(
                            () => _fields['label']!.text = entry.key,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  for (final entry in {
                    'label': s.addressLabel,
                    'line': s.addressLine,
                    'area': s.area,
                    'city': s.city,
                    'instructions': s.deliveryInstructions,
                  }.entries) ...[
                    AppTextField(
                      controller: _fields[entry.key]!,
                      label: entry.value,
                      hint: entry.key == 'line'
                          ? s.addressLineHint
                          : entry.key == 'area'
                          ? s.landmarkHint
                          : null,
                      maxLines: entry.key == 'instructions' ? 2 : 1,
                      autofillHints: entry.key == 'line'
                          ? const [AutofillHints.streetAddressLine1]
                          : entry.key == 'city'
                          ? const [AutofillHints.addressCity]
                          : null,
                      textInputAction: entry.key == 'instructions'
                          ? TextInputAction.done
                          : TextInputAction.next,
                      validator: (value) =>
                          _fieldError(entry.key, value ?? '', s),
                    ),
                    const SizedBox(height: 14),
                  ],
                  SwitchListTile.adaptive(
                    contentPadding: EdgeInsets.zero,
                    title: Text(s.defaultAddress),
                    value: _default,
                    onChanged: (value) => setState(() => _default = value),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(
                          Icons.lock_outline_rounded,
                          size: 16,
                          color: AppColors.brand,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            s.savedAddressHelp,
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (_error != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Semantics(
                        liveRegion: true,
                        child: Text(
                          _error!,
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.error,
                          ),
                        ),
                      ),
                    ),
                  PrimaryButton(
                    label: widget.saveAndUse ? s.saveAndUseAddress : s.save,
                    icon: Icons.check_rounded,
                    loading: _saving,
                    onPressed: _save,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  static String? _fieldError(String key, String value, AppLocalizations s) {
    if ((key == 'label' || key == 'line') && value.trim().isEmpty) {
      return s.requiredField;
    }
    final limit = key == 'label'
        ? 40
        : key == 'area' || key == 'city'
        ? 120
        : 1000;
    return value.length > limit ? s.actionFailed : null;
  }
}
