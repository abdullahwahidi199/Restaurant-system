import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pakhlai_mobile/features/addresses/domain/delivery_location.dart';
import 'package:pakhlai_mobile/features/auth/application/auth_controller.dart';

final deliveryLocationProvider =
    NotifierProvider<DeliveryLocationController, DeliveryLocation>(
      DeliveryLocationController.new,
    );

class DeliveryLocationController extends Notifier<DeliveryLocation> {
  @override
  DeliveryLocation build() {
    ref.watch(authControllerProvider);
    return DeliveryLocation.defaultLocation;
  }

  void select(DeliveryLocation location) => state = location;
}
