// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appName => 'Pakhlai';

  @override
  String get home => 'Home';

  @override
  String get search => 'Search';

  @override
  String get orders => 'Orders';

  @override
  String get profile => 'Profile';

  @override
  String get deliverTo => 'Deliver to';

  @override
  String get chooseAddress => 'Choose an address';

  @override
  String get addressGuestDescription =>
      'Sign in to save an address and see nearby delivery options.';

  @override
  String get notifications => 'Notifications';

  @override
  String get notificationsComingSoon =>
      'Notifications will appear here once account services are connected.';

  @override
  String get searchHint => 'Search restaurants or dishes';

  @override
  String get greeting => 'What would you like to eat?';

  @override
  String get featured => 'Featured near you';

  @override
  String get pakhlaiPick => 'PAKHLAI PICK';

  @override
  String get offerTitle => 'Good food, delivered simply.';

  @override
  String get offerDescription =>
      'Fresh local favorites from restaurants around you.';

  @override
  String get popularCategories => 'Popular categories';

  @override
  String get availableRestaurants => 'Available restaurants';

  @override
  String get popularDishes => 'Popular dishes';

  @override
  String get cuisines => 'Cuisines';

  @override
  String get seeAll => 'See all';

  @override
  String get restaurants => 'Restaurants';

  @override
  String get dishes => 'Dishes';

  @override
  String get freeDelivery => 'Free delivery';

  @override
  String get minutesShort => 'min';

  @override
  String get newLabel => 'New';

  @override
  String get popularLabel => 'Popular';

  @override
  String get searchTitle => 'Find your next meal';

  @override
  String get searchDescription =>
      'Search live restaurants, dishes, and cuisines on Pakhlai.';

  @override
  String get noSearchResults => 'No matches found';

  @override
  String get noSearchResultsDescription =>
      'Try another restaurant, dish, or cuisine.';

  @override
  String get recentSearches => 'Recent searches';

  @override
  String get suggestedSearches => 'Suggested searches';

  @override
  String get clearAll => 'Clear all';

  @override
  String get filters => 'Filters';

  @override
  String get sortBy => 'Sort by';

  @override
  String get recommended => 'Recommended';

  @override
  String get rating => 'Rating';

  @override
  String get deliveryFee => 'Delivery fee';

  @override
  String get openNow => 'Open now';

  @override
  String get applyFilters => 'Apply filters';

  @override
  String get reset => 'Reset';

  @override
  String get noRestaurants => 'No restaurants available';

  @override
  String get noRestaurantsDescription =>
      'No active restaurants are currently published by Pakhlai.';

  @override
  String get currentLocation => 'Shahr-e-Naw, Kabul';

  @override
  String get profileAction => 'Open profile';

  @override
  String get menu => 'Menu';

  @override
  String get selectBranch => 'Select branch';

  @override
  String get branch => 'Branch';

  @override
  String get mainBranch => 'Main branch';

  @override
  String get selected => 'Selected';

  @override
  String get open => 'Open';

  @override
  String get closed => 'Closed';

  @override
  String get busy => 'Busy';

  @override
  String get hoursUnavailable => 'Hours not provided';

  @override
  String get minimumOrder => 'Minimum order';

  @override
  String get noMenu => 'No menu available';

  @override
  String get noMenuDescription => 'This branch has no customer menu items yet.';

  @override
  String get unavailable => 'Unavailable';

  @override
  String get addToCart => 'Add to cart';

  @override
  String get itemNote => 'Item note';

  @override
  String get itemNoteHint => 'For example: no onions or less spicy';

  @override
  String get favoriteUnavailable =>
      'Favorites will be available after customer accounts are connected.';

  @override
  String get cart => 'Cart';

  @override
  String get viewCart => 'View cart';

  @override
  String itemCount(int count) {
    return '$count items';
  }

  @override
  String get startNewCartTitle => 'Start a new cart?';

  @override
  String startNewCartMessage(String restaurant) {
    return 'Your current cart contains items from $restaurant. Adding this item will clear your current cart.';
  }

  @override
  String get branchChangeTitle => 'Change branch?';

  @override
  String get branchChangeMessage =>
      'Changing branch will clear the items currently in your cart.';

  @override
  String get cancel => 'Cancel';

  @override
  String get startNewCart => 'Start new cart';

  @override
  String get emptyCart => 'Your cart is empty';

  @override
  String get emptyCartDescription =>
      'Add something from a restaurant menu to get started.';

  @override
  String get addMoreItems => 'Add more items';

  @override
  String get orderNote => 'Order note';

  @override
  String get addInstructions => 'Add instructions';

  @override
  String get edit => 'Edit';

  @override
  String get save => 'Save';

  @override
  String get subtotal => 'Subtotal';

  @override
  String get discount => 'Discount';

  @override
  String get total => 'Total';

  @override
  String get clearCart => 'Clear cart';

  @override
  String get removeItem => 'Remove item';

  @override
  String get continueToCheckout => 'Continue to checkout';

  @override
  String get checkoutUnavailable =>
      'Checkout will be enabled when delivery details are connected.';

  @override
  String get addedToCart => 'Added to cart';

  @override
  String get ordersTitle => 'Your orders';

  @override
  String get ordersGuestDescription => 'Sign in to view live and past orders.';

  @override
  String get ordersEmptyDescription =>
      'Your active and past orders will appear here.';

  @override
  String get noOrders => 'No orders yet';

  @override
  String get noOrdersDescription =>
      'Your Pakhlai orders will appear here after checkout.';

  @override
  String orderNumber(int id) {
    return 'Order #$id';
  }

  @override
  String get placedOn => 'Placed on';

  @override
  String get profileTitle => 'Your profile';

  @override
  String get profileGuestDescription =>
      'Sign in to manage your profile, addresses, and orders.';

  @override
  String get profileReadyDescription =>
      'Your customer details and preferences will appear here.';

  @override
  String get ordersCount => 'Orders';

  @override
  String get signOut => 'Sign out';

  @override
  String get signIn => 'Sign in';

  @override
  String get createAccount => 'Create account';

  @override
  String get continueAsGuest => 'Continue as guest';

  @override
  String get newToPakhlai => 'New to Pakhlai?';

  @override
  String get alreadyHaveAccount => 'Already have an account?';

  @override
  String get email => 'Email address';

  @override
  String get emailOptional => 'Email address (optional)';

  @override
  String get username => 'Username';

  @override
  String get password => 'Password';

  @override
  String get fullName => 'Full name';

  @override
  String get phone => 'Phone number';

  @override
  String get address => 'Address';

  @override
  String get dateOfBirth => 'Date of birth';

  @override
  String get confirmPassword => 'Confirm password';

  @override
  String get forgotPassword => 'Forgot password?';

  @override
  String get loginTitle => 'Welcome back';

  @override
  String get loginSubtitle => 'Sign in when you are ready to order.';

  @override
  String get registerTitle => 'Create your account';

  @override
  String get registerSubtitle =>
      'Save addresses and keep track of your orders.';

  @override
  String get forgotTitle => 'Reset your password';

  @override
  String get forgotSubtitle =>
      'Customer account recovery is not exposed by the current Pakhlai API.';

  @override
  String get backToSignIn => 'Back to sign in';

  @override
  String get accountCreated => 'Account created. You can now sign in.';

  @override
  String get passwordRecoveryUnavailable =>
      'Password recovery is not available from the server yet.';

  @override
  String get showPassword => 'Show password';

  @override
  String get hidePassword => 'Hide password';

  @override
  String get requiredField => 'This field is required.';

  @override
  String get invalidEmail => 'Enter a valid email address.';

  @override
  String get passwordLength => 'Use at least 8 characters.';

  @override
  String get passwordMismatch => 'Passwords do not match.';

  @override
  String get retry => 'Try again';

  @override
  String get somethingWentWrong => 'Something went wrong';

  @override
  String get emptyTitle => 'Nothing here yet';

  @override
  String get loading => 'Loading';

  @override
  String get from => 'From';

  @override
  String get add => 'Add';

  @override
  String get remove => 'Remove';

  @override
  String get checkout => 'Checkout';

  @override
  String get orderType => 'Order type';

  @override
  String get delivery => 'Delivery';

  @override
  String get takeaway => 'Takeaway';

  @override
  String get addresses => 'Saved addresses';

  @override
  String get addAddress => 'Add address';

  @override
  String get editAddress => 'Edit address';

  @override
  String get deleteAddress => 'Delete address';

  @override
  String get deleteAddressPrompt => 'Remove this saved address?';

  @override
  String get addressLabel => 'Label';

  @override
  String get addressLine => 'Street and building';

  @override
  String get area => 'Area';

  @override
  String get city => 'City';

  @override
  String get deliveryInstructions => 'Delivery instructions';

  @override
  String get latitude => 'Latitude';

  @override
  String get longitude => 'Longitude';

  @override
  String get locationHelp =>
      'Set a delivery pin, then confirm your street and building details.';

  @override
  String get invalidCoordinate => 'Enter a valid coordinate.';

  @override
  String get coordinatePairRequired => 'Enter both latitude and longitude.';

  @override
  String get defaultAddress => 'Default address';

  @override
  String get setDefault => 'Set as default';

  @override
  String get noAddresses => 'No saved addresses';

  @override
  String get noAddressesDescription =>
      'Save your delivery details for a quicker checkout.';

  @override
  String get locationMissing => 'Location needed for delivery';

  @override
  String get paymentMethod => 'Payment method';

  @override
  String get cashOnDelivery => 'Cash on delivery';

  @override
  String get cashOnPickup => 'Cash on pickup';

  @override
  String get cashPaymentHelp =>
      'Pay the restaurant in cash when you receive your order.';

  @override
  String get contactDetails => 'Contact details';

  @override
  String get itemsSummary => 'Your items';

  @override
  String get reviewTotal => 'Review total';

  @override
  String get placeOrder => 'Place order';

  @override
  String get reviewPrices =>
      'Prices have changed. Review the updated items and total before continuing.';

  @override
  String get reviewCartRequired => 'Review your cart before ordering';

  @override
  String get cartRevalidated =>
      'Your cart was checked against the current menu.';

  @override
  String get cartUnavailableRemoved =>
      'Unavailable items were removed from your cart. Please review what remains.';

  @override
  String get cartEstimates =>
      'These prices are estimates. Checkout confirms availability, delivery fees, and the final total.';

  @override
  String get checkoutReviewed => 'Total confirmed by the restaurant';

  @override
  String get checkoutPending =>
      'Review the total to confirm current prices and delivery availability.';

  @override
  String get orderConfirmed => 'Order confirmed';

  @override
  String orderSent(String restaurant) {
    return 'Your order has been sent to $restaurant.';
  }

  @override
  String get trackOrder => 'Track order';

  @override
  String get backToHome => 'Back to home';

  @override
  String get activeOrders => 'Active';

  @override
  String get pastOrders => 'Past';

  @override
  String get noActiveOrders => 'No active orders';

  @override
  String get noPastOrders => 'No past orders';

  @override
  String get orderReceived => 'Order received';

  @override
  String get restaurantConfirmed => 'Restaurant confirmed';

  @override
  String get preparingFood => 'Preparing your food';

  @override
  String get orderReady => 'Ready';

  @override
  String get outForDelivery => 'Out for delivery';

  @override
  String get orderDelivered => 'Delivered';

  @override
  String get orderPickedUp => 'Picked up';

  @override
  String get orderCompleted => 'Completed';

  @override
  String get orderCancelled => 'Cancelled';

  @override
  String get orderStatusUnknown => 'Order update';

  @override
  String get orderDetails => 'Order details';

  @override
  String get orderProgress => 'Order progress';

  @override
  String get liveUpdates => 'Live updates';

  @override
  String get refreshingUpdates => 'Checking for updates';

  @override
  String get lastUpdated => 'Last updated';

  @override
  String get cancelOrder => 'Cancel order';

  @override
  String get cancelOrderPrompt =>
      'Cancel this order? Cancellation is available briefly before preparation begins.';

  @override
  String get loadMore => 'Load more';

  @override
  String get aboutPakhlai => 'About Pakhlai';

  @override
  String get aboutPakhlaiDescription =>
      'Discover local restaurants, order from the right branch, and follow your food from kitchen to doorstep.';

  @override
  String get lightAppearance => 'Light appearance';

  @override
  String get sessionExpired => 'Your session expired. Please sign in again.';

  @override
  String get actionFailed =>
      'We could not complete that action. Please try again.';

  @override
  String get orderSubmissionUnknown =>
      'We are checking whether your order was received. Retry safely using the same order request.';

  @override
  String get resumeOrder => 'Check submitted order';

  @override
  String get checkingCart => 'Checking your cart';

  @override
  String get deliveryAddress => 'Delivery address';

  @override
  String get useCurrentLocation => 'Use current location';

  @override
  String get chooseOnMap => 'Choose on map';

  @override
  String get chooseDeliveryLocation => 'Set delivery location';

  @override
  String get confirmLocation => 'Confirm this location';

  @override
  String get movePinHelp =>
      'Move the map or tap to place the pin at your entrance.';

  @override
  String get confirmPinHelp =>
      'Check the pin before confirming. This is where your order will be delivered.';

  @override
  String get pinSelected => 'Delivery pin selected';

  @override
  String get pinMissing => 'Choose a delivery pin to continue.';

  @override
  String get locatingYou => 'Finding your location…';

  @override
  String get locationPermissionHelp =>
      'Allow location access in your device or browser settings, or choose a point on the map.';

  @override
  String get locationDisabledHelp =>
      'Turn on location services, or choose a point on the map.';

  @override
  String get locationTimeoutHelp =>
      'Finding your location took too long. Try again or choose a point on the map.';

  @override
  String get locationUnavailableHelp =>
      'Your location is unavailable. Choose a point on the map instead.';

  @override
  String get locationSecureHelp =>
      'Current location needs a secure connection. You can still choose a point on the map.';

  @override
  String get approximateLocationHelp =>
      'This location is approximate. Move the map to your entrance to set a precise delivery pin.';

  @override
  String get mapLoadFailed =>
      'The map could not load. Check your connection, or paste a maps link below.';

  @override
  String get retryMap => 'Reload map';

  @override
  String get mapLink => 'Maps link or coordinates';

  @override
  String get mapLinkHint => 'Paste a full maps link or latitude, longitude';

  @override
  String get useMapLink => 'Use a maps link instead';

  @override
  String get applyLocation => 'Set pin';

  @override
  String get invalidMapLink =>
      'Paste coordinates or a full maps link containing the selected coordinates.';

  @override
  String get savedForNextTime =>
      'Saved securely to your account for your next order.';

  @override
  String get savedAddressHelp =>
      'Your addresses stay saved when you sign out or restart the app.';

  @override
  String get saveAndUseAddress => 'Save and use address';

  @override
  String get addressSaved => 'Address saved to your account.';

  @override
  String get confirmAddressDetails => 'Confirm address details';

  @override
  String get addressDetailsHelp =>
      'Add your street, building and a nearby landmark so the restaurant can find you.';

  @override
  String get addressLineHint => 'Street, building or house number';

  @override
  String get landmarkHint => 'Nearby landmark or neighbourhood';

  @override
  String get addressHome => 'Home';

  @override
  String get addressWork => 'Work';

  @override
  String get addressOther => 'Other';

  @override
  String get change => 'Change';

  @override
  String get editPin => 'Adjust pin';

  @override
  String get accountPrefilled => 'From your Pakhlai account';

  @override
  String get secureCheckout => 'Your order, your details';

  @override
  String get checkoutIntro =>
      'Confirm where and how you would like to receive your order.';

  @override
  String get invalidPhone => 'Enter a valid phone number (7–15 digits).';

  @override
  String get zoomIn => 'Zoom in';

  @override
  String get zoomOut => 'Zoom out';

  @override
  String get deliveryPin => 'Delivery pin';
}
