import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pakhlai_mobile/features/auth/domain/auth_status.dart';
import 'package:pakhlai_mobile/features/auth/data/auth_repository.dart';
import 'package:pakhlai_mobile/core/auth/session_events.dart';

final authControllerProvider = NotifierProvider<AuthController, AuthStatus>(
  AuthController.new,
);

class AuthController extends Notifier<AuthStatus> {
  @override
  AuthStatus build() {
    ref.listen(sessionExpiryProvider, (previous, next) {
      if (previous != next) state = AuthStatus.guest;
    });
    return AuthStatus.unknown;
  }

  void restore({required bool hasSession}) {
    state = hasSession ? AuthStatus.authenticated : AuthStatus.guest;
  }

  void continueAsGuest() => state = AuthStatus.guest;
  void markAuthenticated() => state = AuthStatus.authenticated;

  Future<void> login({
    required String username,
    required String password,
  }) async {
    await ref
        .read(authRepositoryProvider)
        .login(username: username, password: password);
    state = AuthStatus.authenticated;
  }

  Future<void> register({
    required String username,
    required String password,
    required String phone,
    required String address,
    required String dateOfBirth,
    String email = '',
  }) {
    return ref
        .read(authRepositoryProvider)
        .register(
          username: username,
          password: password,
          phone: phone,
          address: address,
          dateOfBirth: dateOfBirth,
          email: email,
        );
  }

  Future<void> signOut() async {
    await ref.read(authRepositoryProvider).signOut();
    state = AuthStatus.guest;
  }
}
