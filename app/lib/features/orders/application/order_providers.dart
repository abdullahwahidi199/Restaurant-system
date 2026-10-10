import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pakhlai_mobile/features/orders/data/order_repository.dart';
import 'package:pakhlai_mobile/features/orders/domain/order_models.dart';
import 'package:pakhlai_mobile/features/auth/application/auth_controller.dart';
import 'package:pakhlai_mobile/features/auth/domain/auth_status.dart';
import 'package:pakhlai_mobile/core/errors/app_exception.dart';

final customerOrdersProvider = FutureProvider<CustomerOrderPage>((ref) {
  if (ref.watch(authControllerProvider) != AuthStatus.authenticated) {
    throw const AppException('Please sign in to view your orders.');
  }
  return ref.watch(orderRepositoryProvider).getOrders();
});

final customerOrderProvider = FutureProvider.family<CustomerOrder, int>((
  ref,
  id,
) {
  if (ref.watch(authControllerProvider) != AuthStatus.authenticated) {
    throw const AppException('Please sign in to view your order.');
  }
  return ref.watch(orderRepositoryProvider).getOrder(id);
});
