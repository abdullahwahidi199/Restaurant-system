import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pakhlai_mobile/app/router/app_routes.dart';
import 'package:pakhlai_mobile/app/router/main_navigation_shell.dart';
import 'package:pakhlai_mobile/features/auth/presentation/forgot_password_screen.dart';
import 'package:pakhlai_mobile/features/auth/presentation/login_screen.dart';
import 'package:pakhlai_mobile/features/auth/presentation/register_screen.dart';
import 'package:pakhlai_mobile/features/cart/presentation/cart_screen.dart';
import 'package:pakhlai_mobile/features/home/presentation/home_screen.dart';
import 'package:pakhlai_mobile/features/orders/presentation/orders_screen.dart';
import 'package:pakhlai_mobile/features/profile/presentation/profile_screen.dart';
import 'package:pakhlai_mobile/features/restaurants/presentation/restaurant_screen.dart';
import 'package:pakhlai_mobile/features/search/presentation/search_screen.dart';
import 'package:pakhlai_mobile/features/startup/presentation/startup_screen.dart';
import 'package:pakhlai_mobile/features/addresses/presentation/addresses_screen.dart';
import 'package:pakhlai_mobile/features/checkout/presentation/checkout_screen.dart';
import 'package:pakhlai_mobile/features/orders/presentation/order_detail_screen.dart';
import 'package:pakhlai_mobile/features/orders/presentation/order_success_screen.dart';
import 'package:pakhlai_mobile/features/auth/application/auth_controller.dart';
import 'package:pakhlai_mobile/features/auth/domain/auth_status.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

final appRouterProvider = Provider<GoRouter>((ref) {
  final router = GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: AppRoutes.startup,
    redirect: (context, state) {
      final path = state.uri.path;
      final protected =
          path == AppRoutes.checkout ||
          RegExp(r'^/orders/\d+(?:/success)?$').hasMatch(path);
      if (protected &&
          ref.read(authControllerProvider) != AuthStatus.authenticated) {
        return AppRoutes.authPath(AppRoutes.login, returnTo: path);
      }
      return null;
    },
    routes: [
      GoRoute(
        path: AppRoutes.startup,
        builder: (context, state) => const StartupScreen(),
      ),
      GoRoute(
        path: AppRoutes.login,
        parentNavigatorKey: _rootNavigatorKey,
        pageBuilder: (context, state) => _authPage(
          state: state,
          child: LoginScreen(returnTo: state.uri.queryParameters['next']),
        ),
      ),
      GoRoute(
        path: AppRoutes.register,
        parentNavigatorKey: _rootNavigatorKey,
        pageBuilder: (context, state) => _authPage(
          state: state,
          child: RegisterScreen(returnTo: state.uri.queryParameters['next']),
        ),
      ),
      GoRoute(
        path: AppRoutes.forgotPassword,
        parentNavigatorKey: _rootNavigatorKey,
        pageBuilder: (context, state) =>
            _authPage(state: state, child: const ForgotPasswordScreen()),
      ),
      GoRoute(
        path: AppRoutes.restaurantRoute,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => RestaurantScreen(
          restaurantSlug: state.pathParameters['restaurantSlug']!,
          initialBranchSlug: state.uri.queryParameters['branch'],
        ),
      ),
      GoRoute(
        path: AppRoutes.cart,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const CartScreen(),
      ),
      GoRoute(
        path: AppRoutes.checkout,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, _) => const CheckoutScreen(),
      ),
      GoRoute(
        path: AppRoutes.addresses,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, _) => const AddressesScreen(),
      ),
      GoRoute(
        path: AppRoutes.orderSuccessRoute,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, state) => OrderSuccessScreen(
          orderId: int.parse(state.pathParameters['orderId']!),
        ),
      ),
      GoRoute(
        path: AppRoutes.orderDetailRoute,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, state) => OrderDetailScreen(
          orderId: int.parse(state.pathParameters['orderId']!),
        ),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) =>
            MainNavigationShell(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.home,
                builder: (context, state) => const HomeScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.search,
                builder: (context, state) => SearchScreen(
                  initialQuery: state.uri.queryParameters['q'] ?? '',
                ),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.orders,
                builder: (context, state) => const OrdersScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.profile,
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
  ref.listen(authControllerProvider, (_, _) => router.refresh());
  return router;
});

CustomTransitionPage<void> _authPage({
  required GoRouterState state,
  required Widget child,
}) {
  return CustomTransitionPage<void>(
    key: state.pageKey,
    child: child,
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      return FadeTransition(opacity: animation, child: child);
    },
    transitionDuration: const Duration(milliseconds: 160),
  );
}
