import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pakhlai_mobile/features/addresses/application/delivery_location_controller.dart';
import 'package:pakhlai_mobile/features/addresses/data/address_repository.dart';
import 'package:pakhlai_mobile/features/addresses/domain/customer_address.dart';
import 'package:pakhlai_mobile/features/addresses/domain/delivery_location.dart';
import 'package:pakhlai_mobile/features/auth/application/auth_controller.dart';
import 'package:pakhlai_mobile/features/auth/domain/auth_status.dart';
import 'package:pakhlai_mobile/core/errors/app_exception.dart';

final customerAddressesProvider =
    AsyncNotifierProvider<CustomerAddressesController, List<CustomerAddress>>(
      CustomerAddressesController.new,
    );

class CustomerAddressesController extends AsyncNotifier<List<CustomerAddress>> {
  int _sessionVersion = 0;
  AddressRepository get _repository => ref.read(addressRepositoryProvider);

  @override
  Future<List<CustomerAddress>> build() async {
    final version = ++_sessionVersion;
    if (ref.watch(authControllerProvider) != AuthStatus.authenticated) {
      return const [];
    }
    final addresses = await _repository.getAddresses();
    if (_sameSession(version)) _syncDeliveryLocation(addresses);
    return addresses;
  }

  Future<CustomerAddress> create(CustomerAddressDraft draft) async {
    await future;
    _requireAccount();
    final version = _sessionVersion;
    final created = await _repository.createAddress(draft);
    if (_sameSession(version)) _upsert(created);
    return created;
  }

  Future<CustomerAddress> updateAddress(
    int id,
    CustomerAddressDraft draft,
  ) async {
    await future;
    _requireAccount();
    final version = _sessionVersion;
    final updated = await _repository.updateAddress(id, draft);
    if (_sameSession(version)) _upsert(updated);
    return updated;
  }

  Future<void> delete(int id) async {
    await future;
    _requireAccount();
    final version = _sessionVersion;
    await _repository.deleteAddress(id);
    final addresses = await _repository.getAddresses();
    if (_sameSession(version)) {
      state = AsyncData(addresses);
      _syncDeliveryLocation(addresses);
    }
  }

  Future<void> setDefault(int id) async {
    await future;
    _requireAccount();
    final version = _sessionVersion;
    final updated = await _repository.setDefault(id);
    if (_sameSession(version)) _upsert(updated);
  }

  bool _sameSession(int version) =>
      ref.mounted &&
      version == _sessionVersion &&
      ref.read(authControllerProvider) == AuthStatus.authenticated;
  void _requireAccount() {
    if (ref.read(authControllerProvider) != AuthStatus.authenticated) {
      throw const AppException(
        'Please sign in to save an address.',
        code: '401',
      );
    }
  }

  void _upsert(CustomerAddress updated) {
    final addresses =
        [
          updated,
          for (final address in state.value ?? <CustomerAddress>[])
            if (address.id != updated.id)
              updated.isDefault ? address.copyWith(isDefault: false) : address,
        ]..sort(
          (a, b) => a.isDefault == b.isDefault
              ? 0
              : a.isDefault
              ? -1
              : 1,
        );
    state = AsyncData(addresses);
    _syncDeliveryLocation(addresses);
  }

  void _syncDeliveryLocation(List<CustomerAddress> addresses) {
    if (addresses.isEmpty) {
      ref
          .read(deliveryLocationProvider.notifier)
          .select(DeliveryLocation.defaultLocation);
      return;
    }
    final address =
        addresses.where((item) => item.isDefault).firstOrNull ??
        addresses.first;
    ref
        .read(deliveryLocationProvider.notifier)
        .select(
          DeliveryLocation(
            label: address.formattedAddress,
            latitude: address.latitude,
            longitude: address.longitude,
          ),
        );
  }
}

extension<T> on Iterable<T> {
  T? get firstOrNull {
    final iterator = this.iterator;
    return iterator.moveNext() ? iterator.current : null;
  }
}
