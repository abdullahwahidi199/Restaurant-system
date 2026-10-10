import 'package:pakhlai_mobile/features/orders/domain/order_models.dart';
import 'package:pakhlai_mobile/l10n/app_localizations.dart';

String orderStatusLabel(CustomerOrder order, AppLocalizations s) =>
    switch (order.status) {
      'pending' => s.orderReceived,
      'approved' => s.restaurantConfirmed,
      'in_progress' || 'preparing' => s.preparingFood,
      'ready' => s.orderReady,
      'out_for_delivery' => s.outForDelivery,
      'delivered' => s.orderDelivered,
      'picked_up' => s.orderPickedUp,
      'completed' || 'served' => s.orderCompleted,
      'cancelled' || 'canceled' => s.orderCancelled,
      _ => s.orderStatusUnknown,
    };
