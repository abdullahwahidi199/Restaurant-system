import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pakhlai_mobile/features/customers/data/customer_repository.dart';
import 'package:pakhlai_mobile/features/customers/domain/customer_models.dart';
import 'package:pakhlai_mobile/features/auth/application/auth_controller.dart';
import 'package:pakhlai_mobile/features/auth/domain/auth_status.dart';
import 'package:pakhlai_mobile/core/errors/app_exception.dart';

final customerProfileProvider = FutureProvider<CustomerProfile>((ref) {
  if (ref.watch(authControllerProvider) != AuthStatus.authenticated) {
    throw const AppException('Please sign in to view your profile.');
  }
  return ref.watch(customerRepositoryProvider).getProfile();
});
