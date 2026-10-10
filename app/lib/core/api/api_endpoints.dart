abstract final class ApiEndpoints {
  static const customerLogin = 'customer/login/';
  static const customerSignup = 'customer/signup/';
  static const customerTokenRefresh = 'customer/token/refresh/';
  static const customerProfile = 'customer/profile/';
  static const customerAddresses = 'customer/addresses/';
  static const customerOrders = 'customer/orders/';
  static const checkoutValidation = 'customer/checkout/validate/';
  static const discovery = 'restaurant/discovery/';

  static String customerAddress(int id) => 'customer/addresses/$id/';
  static String customerOrder(int id) => 'customer/orders/$id/';
  static String cancelCustomerOrder(int id) => 'customer/orders/$id/cancel/';
  static String customerOrderSocketTicket(int id) =>
      'customer/orders/$id/socket-ticket/';
  static String publicRestaurant(String slug) =>
      'restaurant/public/${Uri.encodeComponent(slug)}/';
  static String publicMenuPrefix(String restaurantSlug, String branchSlug) =>
      'menu/public/${Uri.encodeComponent(restaurantSlug)}/${Uri.encodeComponent(branchSlug)}';
}
