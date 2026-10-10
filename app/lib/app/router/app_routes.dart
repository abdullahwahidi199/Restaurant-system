abstract final class AppRoutes {
  static const startup = '/startup';
  static const home = '/home';
  static const search = '/search';
  static const orders = '/orders';
  static const profile = '/profile';
  static const login = '/auth/login';
  static const register = '/auth/register';
  static const forgotPassword = '/auth/forgot-password';
  static const cart = '/cart';
  static const checkout = '/checkout';
  static const addresses = '/addresses';
  static const orderDetailRoute = '/orders/:orderId';
  static const orderSuccessRoute = '/orders/:orderId/success';
  static const restaurantRoute = '/restaurants/:restaurantSlug';

  static String restaurantPath(String slug, {String? branchSlug}) {
    final path = '/restaurants/${Uri.encodeComponent(slug)}';
    if (branchSlug == null || branchSlug.isEmpty) return path;
    return '$path?branch=${Uri.encodeQueryComponent(branchSlug)}';
  }

  static String orderPath(int id) => '/orders/$id';
  static String orderDetailPath(int id) => orderPath(id);
  static String orderSuccessPath(int id) => '/orders/$id/success';

  static String safeReturnPath(String? value) {
    if (value == checkout ||
        value == addresses ||
        value == orders ||
        value == profile ||
        (value != null &&
            RegExp(r'^/orders/\d+(?:/success)?$').hasMatch(value))) {
      return value!;
    }
    return home;
  }

  static String authPath(String path, {String? returnTo}) =>
      '$path?next=${Uri.encodeQueryComponent(safeReturnPath(returnTo))}';
}
