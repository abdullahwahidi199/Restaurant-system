import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[Locale('en')];

  /// No description provided for @appName.
  ///
  /// In en, this message translates to:
  /// **'Pakhlai'**
  String get appName;

  /// No description provided for @home.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get home;

  /// No description provided for @search.
  ///
  /// In en, this message translates to:
  /// **'Search'**
  String get search;

  /// No description provided for @orders.
  ///
  /// In en, this message translates to:
  /// **'Orders'**
  String get orders;

  /// No description provided for @profile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profile;

  /// No description provided for @deliverTo.
  ///
  /// In en, this message translates to:
  /// **'Deliver to'**
  String get deliverTo;

  /// No description provided for @chooseAddress.
  ///
  /// In en, this message translates to:
  /// **'Choose an address'**
  String get chooseAddress;

  /// No description provided for @addressGuestDescription.
  ///
  /// In en, this message translates to:
  /// **'Sign in to save an address and see nearby delivery options.'**
  String get addressGuestDescription;

  /// No description provided for @notifications.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get notifications;

  /// No description provided for @notificationsComingSoon.
  ///
  /// In en, this message translates to:
  /// **'Notifications will appear here once account services are connected.'**
  String get notificationsComingSoon;

  /// No description provided for @searchHint.
  ///
  /// In en, this message translates to:
  /// **'Search restaurants or dishes'**
  String get searchHint;

  /// No description provided for @greeting.
  ///
  /// In en, this message translates to:
  /// **'What would you like to eat?'**
  String get greeting;

  /// No description provided for @featured.
  ///
  /// In en, this message translates to:
  /// **'Featured near you'**
  String get featured;

  /// No description provided for @pakhlaiPick.
  ///
  /// In en, this message translates to:
  /// **'PAKHLAI PICK'**
  String get pakhlaiPick;

  /// No description provided for @offerTitle.
  ///
  /// In en, this message translates to:
  /// **'Good food, delivered simply.'**
  String get offerTitle;

  /// No description provided for @offerDescription.
  ///
  /// In en, this message translates to:
  /// **'Fresh local favorites from restaurants around you.'**
  String get offerDescription;

  /// No description provided for @popularCategories.
  ///
  /// In en, this message translates to:
  /// **'Popular categories'**
  String get popularCategories;

  /// No description provided for @availableRestaurants.
  ///
  /// In en, this message translates to:
  /// **'Available restaurants'**
  String get availableRestaurants;

  /// No description provided for @popularDishes.
  ///
  /// In en, this message translates to:
  /// **'Popular dishes'**
  String get popularDishes;

  /// No description provided for @cuisines.
  ///
  /// In en, this message translates to:
  /// **'Cuisines'**
  String get cuisines;

  /// No description provided for @seeAll.
  ///
  /// In en, this message translates to:
  /// **'See all'**
  String get seeAll;

  /// No description provided for @restaurants.
  ///
  /// In en, this message translates to:
  /// **'Restaurants'**
  String get restaurants;

  /// No description provided for @dishes.
  ///
  /// In en, this message translates to:
  /// **'Dishes'**
  String get dishes;

  /// No description provided for @freeDelivery.
  ///
  /// In en, this message translates to:
  /// **'Free delivery'**
  String get freeDelivery;

  /// No description provided for @minutesShort.
  ///
  /// In en, this message translates to:
  /// **'min'**
  String get minutesShort;

  /// No description provided for @newLabel.
  ///
  /// In en, this message translates to:
  /// **'New'**
  String get newLabel;

  /// No description provided for @popularLabel.
  ///
  /// In en, this message translates to:
  /// **'Popular'**
  String get popularLabel;

  /// No description provided for @searchTitle.
  ///
  /// In en, this message translates to:
  /// **'Find your next meal'**
  String get searchTitle;

  /// No description provided for @searchDescription.
  ///
  /// In en, this message translates to:
  /// **'Search live restaurants, dishes, and cuisines on Pakhlai.'**
  String get searchDescription;

  /// No description provided for @noSearchResults.
  ///
  /// In en, this message translates to:
  /// **'No matches found'**
  String get noSearchResults;

  /// No description provided for @noSearchResultsDescription.
  ///
  /// In en, this message translates to:
  /// **'Try another restaurant, dish, or cuisine.'**
  String get noSearchResultsDescription;

  /// No description provided for @recentSearches.
  ///
  /// In en, this message translates to:
  /// **'Recent searches'**
  String get recentSearches;

  /// No description provided for @suggestedSearches.
  ///
  /// In en, this message translates to:
  /// **'Suggested searches'**
  String get suggestedSearches;

  /// No description provided for @clearAll.
  ///
  /// In en, this message translates to:
  /// **'Clear all'**
  String get clearAll;

  /// No description provided for @filters.
  ///
  /// In en, this message translates to:
  /// **'Filters'**
  String get filters;

  /// No description provided for @sortBy.
  ///
  /// In en, this message translates to:
  /// **'Sort by'**
  String get sortBy;

  /// No description provided for @recommended.
  ///
  /// In en, this message translates to:
  /// **'Recommended'**
  String get recommended;

  /// No description provided for @rating.
  ///
  /// In en, this message translates to:
  /// **'Rating'**
  String get rating;

  /// No description provided for @deliveryFee.
  ///
  /// In en, this message translates to:
  /// **'Delivery fee'**
  String get deliveryFee;

  /// No description provided for @openNow.
  ///
  /// In en, this message translates to:
  /// **'Open now'**
  String get openNow;

  /// No description provided for @applyFilters.
  ///
  /// In en, this message translates to:
  /// **'Apply filters'**
  String get applyFilters;

  /// No description provided for @reset.
  ///
  /// In en, this message translates to:
  /// **'Reset'**
  String get reset;

  /// No description provided for @noRestaurants.
  ///
  /// In en, this message translates to:
  /// **'No restaurants available'**
  String get noRestaurants;

  /// No description provided for @noRestaurantsDescription.
  ///
  /// In en, this message translates to:
  /// **'No active restaurants are currently published by Pakhlai.'**
  String get noRestaurantsDescription;

  /// No description provided for @currentLocation.
  ///
  /// In en, this message translates to:
  /// **'Shahr-e-Naw, Kabul'**
  String get currentLocation;

  /// No description provided for @profileAction.
  ///
  /// In en, this message translates to:
  /// **'Open profile'**
  String get profileAction;

  /// No description provided for @menu.
  ///
  /// In en, this message translates to:
  /// **'Menu'**
  String get menu;

  /// No description provided for @selectBranch.
  ///
  /// In en, this message translates to:
  /// **'Select branch'**
  String get selectBranch;

  /// No description provided for @branch.
  ///
  /// In en, this message translates to:
  /// **'Branch'**
  String get branch;

  /// No description provided for @mainBranch.
  ///
  /// In en, this message translates to:
  /// **'Main branch'**
  String get mainBranch;

  /// No description provided for @selected.
  ///
  /// In en, this message translates to:
  /// **'Selected'**
  String get selected;

  /// No description provided for @open.
  ///
  /// In en, this message translates to:
  /// **'Open'**
  String get open;

  /// No description provided for @closed.
  ///
  /// In en, this message translates to:
  /// **'Closed'**
  String get closed;

  /// No description provided for @busy.
  ///
  /// In en, this message translates to:
  /// **'Busy'**
  String get busy;

  /// No description provided for @hoursUnavailable.
  ///
  /// In en, this message translates to:
  /// **'Hours not provided'**
  String get hoursUnavailable;

  /// No description provided for @minimumOrder.
  ///
  /// In en, this message translates to:
  /// **'Minimum order'**
  String get minimumOrder;

  /// No description provided for @noMenu.
  ///
  /// In en, this message translates to:
  /// **'No menu available'**
  String get noMenu;

  /// No description provided for @noMenuDescription.
  ///
  /// In en, this message translates to:
  /// **'This branch has no customer menu items yet.'**
  String get noMenuDescription;

  /// No description provided for @unavailable.
  ///
  /// In en, this message translates to:
  /// **'Unavailable'**
  String get unavailable;

  /// No description provided for @addToCart.
  ///
  /// In en, this message translates to:
  /// **'Add to cart'**
  String get addToCart;

  /// No description provided for @itemNote.
  ///
  /// In en, this message translates to:
  /// **'Item note'**
  String get itemNote;

  /// No description provided for @itemNoteHint.
  ///
  /// In en, this message translates to:
  /// **'For example: no onions or less spicy'**
  String get itemNoteHint;

  /// No description provided for @favoriteUnavailable.
  ///
  /// In en, this message translates to:
  /// **'Favorites will be available after customer accounts are connected.'**
  String get favoriteUnavailable;

  /// No description provided for @cart.
  ///
  /// In en, this message translates to:
  /// **'Cart'**
  String get cart;

  /// No description provided for @viewCart.
  ///
  /// In en, this message translates to:
  /// **'View cart'**
  String get viewCart;

  /// No description provided for @itemCount.
  ///
  /// In en, this message translates to:
  /// **'{count} items'**
  String itemCount(int count);

  /// No description provided for @startNewCartTitle.
  ///
  /// In en, this message translates to:
  /// **'Start a new cart?'**
  String get startNewCartTitle;

  /// No description provided for @startNewCartMessage.
  ///
  /// In en, this message translates to:
  /// **'Your current cart contains items from {restaurant}. Adding this item will clear your current cart.'**
  String startNewCartMessage(String restaurant);

  /// No description provided for @branchChangeTitle.
  ///
  /// In en, this message translates to:
  /// **'Change branch?'**
  String get branchChangeTitle;

  /// No description provided for @branchChangeMessage.
  ///
  /// In en, this message translates to:
  /// **'Changing branch will clear the items currently in your cart.'**
  String get branchChangeMessage;

  /// No description provided for @cancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// No description provided for @startNewCart.
  ///
  /// In en, this message translates to:
  /// **'Start new cart'**
  String get startNewCart;

  /// No description provided for @emptyCart.
  ///
  /// In en, this message translates to:
  /// **'Your cart is empty'**
  String get emptyCart;

  /// No description provided for @emptyCartDescription.
  ///
  /// In en, this message translates to:
  /// **'Add something from a restaurant menu to get started.'**
  String get emptyCartDescription;

  /// No description provided for @addMoreItems.
  ///
  /// In en, this message translates to:
  /// **'Add more items'**
  String get addMoreItems;

  /// No description provided for @orderNote.
  ///
  /// In en, this message translates to:
  /// **'Order note'**
  String get orderNote;

  /// No description provided for @addInstructions.
  ///
  /// In en, this message translates to:
  /// **'Add instructions'**
  String get addInstructions;

  /// No description provided for @edit.
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get edit;

  /// No description provided for @save.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get save;

  /// No description provided for @subtotal.
  ///
  /// In en, this message translates to:
  /// **'Subtotal'**
  String get subtotal;

  /// No description provided for @discount.
  ///
  /// In en, this message translates to:
  /// **'Discount'**
  String get discount;

  /// No description provided for @total.
  ///
  /// In en, this message translates to:
  /// **'Total'**
  String get total;

  /// No description provided for @clearCart.
  ///
  /// In en, this message translates to:
  /// **'Clear cart'**
  String get clearCart;

  /// No description provided for @removeItem.
  ///
  /// In en, this message translates to:
  /// **'Remove item'**
  String get removeItem;

  /// No description provided for @continueToCheckout.
  ///
  /// In en, this message translates to:
  /// **'Continue to checkout'**
  String get continueToCheckout;

  /// No description provided for @checkoutUnavailable.
  ///
  /// In en, this message translates to:
  /// **'Checkout will be enabled when delivery details are connected.'**
  String get checkoutUnavailable;

  /// No description provided for @addedToCart.
  ///
  /// In en, this message translates to:
  /// **'Added to cart'**
  String get addedToCart;

  /// No description provided for @ordersTitle.
  ///
  /// In en, this message translates to:
  /// **'Your orders'**
  String get ordersTitle;

  /// No description provided for @ordersGuestDescription.
  ///
  /// In en, this message translates to:
  /// **'Sign in to view live and past orders.'**
  String get ordersGuestDescription;

  /// No description provided for @ordersEmptyDescription.
  ///
  /// In en, this message translates to:
  /// **'Your active and past orders will appear here.'**
  String get ordersEmptyDescription;

  /// No description provided for @noOrders.
  ///
  /// In en, this message translates to:
  /// **'No orders yet'**
  String get noOrders;

  /// No description provided for @noOrdersDescription.
  ///
  /// In en, this message translates to:
  /// **'Your Pakhlai orders will appear here after checkout.'**
  String get noOrdersDescription;

  /// No description provided for @orderNumber.
  ///
  /// In en, this message translates to:
  /// **'Order #{id}'**
  String orderNumber(int id);

  /// No description provided for @placedOn.
  ///
  /// In en, this message translates to:
  /// **'Placed on'**
  String get placedOn;

  /// No description provided for @profileTitle.
  ///
  /// In en, this message translates to:
  /// **'Your profile'**
  String get profileTitle;

  /// No description provided for @profileGuestDescription.
  ///
  /// In en, this message translates to:
  /// **'Sign in to manage your profile, addresses, and orders.'**
  String get profileGuestDescription;

  /// No description provided for @profileReadyDescription.
  ///
  /// In en, this message translates to:
  /// **'Your customer details and preferences will appear here.'**
  String get profileReadyDescription;

  /// No description provided for @ordersCount.
  ///
  /// In en, this message translates to:
  /// **'Orders'**
  String get ordersCount;

  /// No description provided for @signOut.
  ///
  /// In en, this message translates to:
  /// **'Sign out'**
  String get signOut;

  /// No description provided for @signIn.
  ///
  /// In en, this message translates to:
  /// **'Sign in'**
  String get signIn;

  /// No description provided for @createAccount.
  ///
  /// In en, this message translates to:
  /// **'Create account'**
  String get createAccount;

  /// No description provided for @continueAsGuest.
  ///
  /// In en, this message translates to:
  /// **'Continue as guest'**
  String get continueAsGuest;

  /// No description provided for @newToPakhlai.
  ///
  /// In en, this message translates to:
  /// **'New to Pakhlai?'**
  String get newToPakhlai;

  /// No description provided for @alreadyHaveAccount.
  ///
  /// In en, this message translates to:
  /// **'Already have an account?'**
  String get alreadyHaveAccount;

  /// No description provided for @email.
  ///
  /// In en, this message translates to:
  /// **'Email address'**
  String get email;

  /// No description provided for @emailOptional.
  ///
  /// In en, this message translates to:
  /// **'Email address (optional)'**
  String get emailOptional;

  /// No description provided for @username.
  ///
  /// In en, this message translates to:
  /// **'Username'**
  String get username;

  /// No description provided for @password.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get password;

  /// No description provided for @fullName.
  ///
  /// In en, this message translates to:
  /// **'Full name'**
  String get fullName;

  /// No description provided for @phone.
  ///
  /// In en, this message translates to:
  /// **'Phone number'**
  String get phone;

  /// No description provided for @address.
  ///
  /// In en, this message translates to:
  /// **'Address'**
  String get address;

  /// No description provided for @dateOfBirth.
  ///
  /// In en, this message translates to:
  /// **'Date of birth'**
  String get dateOfBirth;

  /// No description provided for @confirmPassword.
  ///
  /// In en, this message translates to:
  /// **'Confirm password'**
  String get confirmPassword;

  /// No description provided for @forgotPassword.
  ///
  /// In en, this message translates to:
  /// **'Forgot password?'**
  String get forgotPassword;

  /// No description provided for @loginTitle.
  ///
  /// In en, this message translates to:
  /// **'Welcome back'**
  String get loginTitle;

  /// No description provided for @loginSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Sign in when you are ready to order.'**
  String get loginSubtitle;

  /// No description provided for @registerTitle.
  ///
  /// In en, this message translates to:
  /// **'Create your account'**
  String get registerTitle;

  /// No description provided for @registerSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Save addresses and keep track of your orders.'**
  String get registerSubtitle;

  /// No description provided for @forgotTitle.
  ///
  /// In en, this message translates to:
  /// **'Reset your password'**
  String get forgotTitle;

  /// No description provided for @forgotSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Customer account recovery is not exposed by the current Pakhlai API.'**
  String get forgotSubtitle;

  /// No description provided for @backToSignIn.
  ///
  /// In en, this message translates to:
  /// **'Back to sign in'**
  String get backToSignIn;

  /// No description provided for @accountCreated.
  ///
  /// In en, this message translates to:
  /// **'Account created. You can now sign in.'**
  String get accountCreated;

  /// No description provided for @passwordRecoveryUnavailable.
  ///
  /// In en, this message translates to:
  /// **'Password recovery is not available from the server yet.'**
  String get passwordRecoveryUnavailable;

  /// No description provided for @showPassword.
  ///
  /// In en, this message translates to:
  /// **'Show password'**
  String get showPassword;

  /// No description provided for @hidePassword.
  ///
  /// In en, this message translates to:
  /// **'Hide password'**
  String get hidePassword;

  /// No description provided for @requiredField.
  ///
  /// In en, this message translates to:
  /// **'This field is required.'**
  String get requiredField;

  /// No description provided for @invalidEmail.
  ///
  /// In en, this message translates to:
  /// **'Enter a valid email address.'**
  String get invalidEmail;

  /// No description provided for @passwordLength.
  ///
  /// In en, this message translates to:
  /// **'Use at least 8 characters.'**
  String get passwordLength;

  /// No description provided for @passwordMismatch.
  ///
  /// In en, this message translates to:
  /// **'Passwords do not match.'**
  String get passwordMismatch;

  /// No description provided for @retry.
  ///
  /// In en, this message translates to:
  /// **'Try again'**
  String get retry;

  /// No description provided for @somethingWentWrong.
  ///
  /// In en, this message translates to:
  /// **'Something went wrong'**
  String get somethingWentWrong;

  /// No description provided for @emptyTitle.
  ///
  /// In en, this message translates to:
  /// **'Nothing here yet'**
  String get emptyTitle;

  /// No description provided for @loading.
  ///
  /// In en, this message translates to:
  /// **'Loading'**
  String get loading;

  /// No description provided for @from.
  ///
  /// In en, this message translates to:
  /// **'From'**
  String get from;

  /// No description provided for @add.
  ///
  /// In en, this message translates to:
  /// **'Add'**
  String get add;

  /// No description provided for @remove.
  ///
  /// In en, this message translates to:
  /// **'Remove'**
  String get remove;

  /// No description provided for @checkout.
  ///
  /// In en, this message translates to:
  /// **'Checkout'**
  String get checkout;

  /// No description provided for @orderType.
  ///
  /// In en, this message translates to:
  /// **'Order type'**
  String get orderType;

  /// No description provided for @delivery.
  ///
  /// In en, this message translates to:
  /// **'Delivery'**
  String get delivery;

  /// No description provided for @takeaway.
  ///
  /// In en, this message translates to:
  /// **'Takeaway'**
  String get takeaway;

  /// No description provided for @addresses.
  ///
  /// In en, this message translates to:
  /// **'Saved addresses'**
  String get addresses;

  /// No description provided for @addAddress.
  ///
  /// In en, this message translates to:
  /// **'Add address'**
  String get addAddress;

  /// No description provided for @editAddress.
  ///
  /// In en, this message translates to:
  /// **'Edit address'**
  String get editAddress;

  /// No description provided for @deleteAddress.
  ///
  /// In en, this message translates to:
  /// **'Delete address'**
  String get deleteAddress;

  /// No description provided for @deleteAddressPrompt.
  ///
  /// In en, this message translates to:
  /// **'Remove this saved address?'**
  String get deleteAddressPrompt;

  /// No description provided for @addressLabel.
  ///
  /// In en, this message translates to:
  /// **'Label'**
  String get addressLabel;

  /// No description provided for @addressLine.
  ///
  /// In en, this message translates to:
  /// **'Street and building'**
  String get addressLine;

  /// No description provided for @area.
  ///
  /// In en, this message translates to:
  /// **'Area'**
  String get area;

  /// No description provided for @city.
  ///
  /// In en, this message translates to:
  /// **'City'**
  String get city;

  /// No description provided for @deliveryInstructions.
  ///
  /// In en, this message translates to:
  /// **'Delivery instructions'**
  String get deliveryInstructions;

  /// No description provided for @latitude.
  ///
  /// In en, this message translates to:
  /// **'Latitude'**
  String get latitude;

  /// No description provided for @longitude.
  ///
  /// In en, this message translates to:
  /// **'Longitude'**
  String get longitude;

  /// No description provided for @locationHelp.
  ///
  /// In en, this message translates to:
  /// **'Set a delivery pin, then confirm your street and building details.'**
  String get locationHelp;

  /// No description provided for @invalidCoordinate.
  ///
  /// In en, this message translates to:
  /// **'Enter a valid coordinate.'**
  String get invalidCoordinate;

  /// No description provided for @coordinatePairRequired.
  ///
  /// In en, this message translates to:
  /// **'Enter both latitude and longitude.'**
  String get coordinatePairRequired;

  /// No description provided for @defaultAddress.
  ///
  /// In en, this message translates to:
  /// **'Default address'**
  String get defaultAddress;

  /// No description provided for @setDefault.
  ///
  /// In en, this message translates to:
  /// **'Set as default'**
  String get setDefault;

  /// No description provided for @noAddresses.
  ///
  /// In en, this message translates to:
  /// **'No saved addresses'**
  String get noAddresses;

  /// No description provided for @noAddressesDescription.
  ///
  /// In en, this message translates to:
  /// **'Save your delivery details for a quicker checkout.'**
  String get noAddressesDescription;

  /// No description provided for @locationMissing.
  ///
  /// In en, this message translates to:
  /// **'Location needed for delivery'**
  String get locationMissing;

  /// No description provided for @paymentMethod.
  ///
  /// In en, this message translates to:
  /// **'Payment method'**
  String get paymentMethod;

  /// No description provided for @cashOnDelivery.
  ///
  /// In en, this message translates to:
  /// **'Cash on delivery'**
  String get cashOnDelivery;

  /// No description provided for @cashOnPickup.
  ///
  /// In en, this message translates to:
  /// **'Cash on pickup'**
  String get cashOnPickup;

  /// No description provided for @cashPaymentHelp.
  ///
  /// In en, this message translates to:
  /// **'Pay the restaurant in cash when you receive your order.'**
  String get cashPaymentHelp;

  /// No description provided for @contactDetails.
  ///
  /// In en, this message translates to:
  /// **'Contact details'**
  String get contactDetails;

  /// No description provided for @itemsSummary.
  ///
  /// In en, this message translates to:
  /// **'Your items'**
  String get itemsSummary;

  /// No description provided for @reviewTotal.
  ///
  /// In en, this message translates to:
  /// **'Review total'**
  String get reviewTotal;

  /// No description provided for @placeOrder.
  ///
  /// In en, this message translates to:
  /// **'Place order'**
  String get placeOrder;

  /// No description provided for @reviewPrices.
  ///
  /// In en, this message translates to:
  /// **'Prices have changed. Review the updated items and total before continuing.'**
  String get reviewPrices;

  /// No description provided for @reviewCartRequired.
  ///
  /// In en, this message translates to:
  /// **'Review your cart before ordering'**
  String get reviewCartRequired;

  /// No description provided for @cartRevalidated.
  ///
  /// In en, this message translates to:
  /// **'Your cart was checked against the current menu.'**
  String get cartRevalidated;

  /// No description provided for @cartUnavailableRemoved.
  ///
  /// In en, this message translates to:
  /// **'Unavailable items were removed from your cart. Please review what remains.'**
  String get cartUnavailableRemoved;

  /// No description provided for @cartEstimates.
  ///
  /// In en, this message translates to:
  /// **'These prices are estimates. Checkout confirms availability, delivery fees, and the final total.'**
  String get cartEstimates;

  /// No description provided for @checkoutReviewed.
  ///
  /// In en, this message translates to:
  /// **'Total confirmed by the restaurant'**
  String get checkoutReviewed;

  /// No description provided for @checkoutPending.
  ///
  /// In en, this message translates to:
  /// **'Review the total to confirm current prices and delivery availability.'**
  String get checkoutPending;

  /// No description provided for @orderConfirmed.
  ///
  /// In en, this message translates to:
  /// **'Order confirmed'**
  String get orderConfirmed;

  /// No description provided for @orderSent.
  ///
  /// In en, this message translates to:
  /// **'Your order has been sent to {restaurant}.'**
  String orderSent(String restaurant);

  /// No description provided for @trackOrder.
  ///
  /// In en, this message translates to:
  /// **'Track order'**
  String get trackOrder;

  /// No description provided for @backToHome.
  ///
  /// In en, this message translates to:
  /// **'Back to home'**
  String get backToHome;

  /// No description provided for @activeOrders.
  ///
  /// In en, this message translates to:
  /// **'Active'**
  String get activeOrders;

  /// No description provided for @pastOrders.
  ///
  /// In en, this message translates to:
  /// **'Past'**
  String get pastOrders;

  /// No description provided for @noActiveOrders.
  ///
  /// In en, this message translates to:
  /// **'No active orders'**
  String get noActiveOrders;

  /// No description provided for @noPastOrders.
  ///
  /// In en, this message translates to:
  /// **'No past orders'**
  String get noPastOrders;

  /// No description provided for @orderReceived.
  ///
  /// In en, this message translates to:
  /// **'Order received'**
  String get orderReceived;

  /// No description provided for @restaurantConfirmed.
  ///
  /// In en, this message translates to:
  /// **'Restaurant confirmed'**
  String get restaurantConfirmed;

  /// No description provided for @preparingFood.
  ///
  /// In en, this message translates to:
  /// **'Preparing your food'**
  String get preparingFood;

  /// No description provided for @orderReady.
  ///
  /// In en, this message translates to:
  /// **'Ready'**
  String get orderReady;

  /// No description provided for @outForDelivery.
  ///
  /// In en, this message translates to:
  /// **'Out for delivery'**
  String get outForDelivery;

  /// No description provided for @orderDelivered.
  ///
  /// In en, this message translates to:
  /// **'Delivered'**
  String get orderDelivered;

  /// No description provided for @orderPickedUp.
  ///
  /// In en, this message translates to:
  /// **'Picked up'**
  String get orderPickedUp;

  /// No description provided for @orderCompleted.
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get orderCompleted;

  /// No description provided for @orderCancelled.
  ///
  /// In en, this message translates to:
  /// **'Cancelled'**
  String get orderCancelled;

  /// No description provided for @orderStatusUnknown.
  ///
  /// In en, this message translates to:
  /// **'Order update'**
  String get orderStatusUnknown;

  /// No description provided for @orderDetails.
  ///
  /// In en, this message translates to:
  /// **'Order details'**
  String get orderDetails;

  /// No description provided for @orderProgress.
  ///
  /// In en, this message translates to:
  /// **'Order progress'**
  String get orderProgress;

  /// No description provided for @liveUpdates.
  ///
  /// In en, this message translates to:
  /// **'Live updates'**
  String get liveUpdates;

  /// No description provided for @refreshingUpdates.
  ///
  /// In en, this message translates to:
  /// **'Checking for updates'**
  String get refreshingUpdates;

  /// No description provided for @lastUpdated.
  ///
  /// In en, this message translates to:
  /// **'Last updated'**
  String get lastUpdated;

  /// No description provided for @cancelOrder.
  ///
  /// In en, this message translates to:
  /// **'Cancel order'**
  String get cancelOrder;

  /// No description provided for @cancelOrderPrompt.
  ///
  /// In en, this message translates to:
  /// **'Cancel this order? Cancellation is available briefly before preparation begins.'**
  String get cancelOrderPrompt;

  /// No description provided for @loadMore.
  ///
  /// In en, this message translates to:
  /// **'Load more'**
  String get loadMore;

  /// No description provided for @aboutPakhlai.
  ///
  /// In en, this message translates to:
  /// **'About Pakhlai'**
  String get aboutPakhlai;

  /// No description provided for @aboutPakhlaiDescription.
  ///
  /// In en, this message translates to:
  /// **'Discover local restaurants, order from the right branch, and follow your food from kitchen to doorstep.'**
  String get aboutPakhlaiDescription;

  /// No description provided for @lightAppearance.
  ///
  /// In en, this message translates to:
  /// **'Light appearance'**
  String get lightAppearance;

  /// No description provided for @sessionExpired.
  ///
  /// In en, this message translates to:
  /// **'Your session expired. Please sign in again.'**
  String get sessionExpired;

  /// No description provided for @actionFailed.
  ///
  /// In en, this message translates to:
  /// **'We could not complete that action. Please try again.'**
  String get actionFailed;

  /// No description provided for @orderSubmissionUnknown.
  ///
  /// In en, this message translates to:
  /// **'We are checking whether your order was received. Retry safely using the same order request.'**
  String get orderSubmissionUnknown;

  /// No description provided for @resumeOrder.
  ///
  /// In en, this message translates to:
  /// **'Check submitted order'**
  String get resumeOrder;

  /// No description provided for @checkingCart.
  ///
  /// In en, this message translates to:
  /// **'Checking your cart'**
  String get checkingCart;

  /// No description provided for @deliveryAddress.
  ///
  /// In en, this message translates to:
  /// **'Delivery address'**
  String get deliveryAddress;

  /// No description provided for @useCurrentLocation.
  ///
  /// In en, this message translates to:
  /// **'Use current location'**
  String get useCurrentLocation;

  /// No description provided for @chooseOnMap.
  ///
  /// In en, this message translates to:
  /// **'Choose on map'**
  String get chooseOnMap;

  /// No description provided for @chooseDeliveryLocation.
  ///
  /// In en, this message translates to:
  /// **'Set delivery location'**
  String get chooseDeliveryLocation;

  /// No description provided for @confirmLocation.
  ///
  /// In en, this message translates to:
  /// **'Confirm this location'**
  String get confirmLocation;

  /// No description provided for @movePinHelp.
  ///
  /// In en, this message translates to:
  /// **'Move the map or tap to place the pin at your entrance.'**
  String get movePinHelp;

  /// No description provided for @confirmPinHelp.
  ///
  /// In en, this message translates to:
  /// **'Check the pin before confirming. This is where your order will be delivered.'**
  String get confirmPinHelp;

  /// No description provided for @pinSelected.
  ///
  /// In en, this message translates to:
  /// **'Delivery pin selected'**
  String get pinSelected;

  /// No description provided for @pinMissing.
  ///
  /// In en, this message translates to:
  /// **'Choose a delivery pin to continue.'**
  String get pinMissing;

  /// No description provided for @locatingYou.
  ///
  /// In en, this message translates to:
  /// **'Finding your location…'**
  String get locatingYou;

  /// No description provided for @locationPermissionHelp.
  ///
  /// In en, this message translates to:
  /// **'Allow location access in your device or browser settings, or choose a point on the map.'**
  String get locationPermissionHelp;

  /// No description provided for @locationDisabledHelp.
  ///
  /// In en, this message translates to:
  /// **'Turn on location services, or choose a point on the map.'**
  String get locationDisabledHelp;

  /// No description provided for @locationTimeoutHelp.
  ///
  /// In en, this message translates to:
  /// **'Finding your location took too long. Try again or choose a point on the map.'**
  String get locationTimeoutHelp;

  /// No description provided for @locationUnavailableHelp.
  ///
  /// In en, this message translates to:
  /// **'Your location is unavailable. Choose a point on the map instead.'**
  String get locationUnavailableHelp;

  /// No description provided for @locationSecureHelp.
  ///
  /// In en, this message translates to:
  /// **'Current location needs a secure connection. You can still choose a point on the map.'**
  String get locationSecureHelp;

  /// No description provided for @approximateLocationHelp.
  ///
  /// In en, this message translates to:
  /// **'This location is approximate. Move the map to your entrance to set a precise delivery pin.'**
  String get approximateLocationHelp;

  /// No description provided for @mapLoadFailed.
  ///
  /// In en, this message translates to:
  /// **'The map could not load. Check your connection, or paste a maps link below.'**
  String get mapLoadFailed;

  /// No description provided for @retryMap.
  ///
  /// In en, this message translates to:
  /// **'Reload map'**
  String get retryMap;

  /// No description provided for @mapLink.
  ///
  /// In en, this message translates to:
  /// **'Maps link or coordinates'**
  String get mapLink;

  /// No description provided for @mapLinkHint.
  ///
  /// In en, this message translates to:
  /// **'Paste a full maps link or latitude, longitude'**
  String get mapLinkHint;

  /// No description provided for @useMapLink.
  ///
  /// In en, this message translates to:
  /// **'Use a maps link instead'**
  String get useMapLink;

  /// No description provided for @applyLocation.
  ///
  /// In en, this message translates to:
  /// **'Set pin'**
  String get applyLocation;

  /// No description provided for @invalidMapLink.
  ///
  /// In en, this message translates to:
  /// **'Paste coordinates or a full maps link containing the selected coordinates.'**
  String get invalidMapLink;

  /// No description provided for @savedForNextTime.
  ///
  /// In en, this message translates to:
  /// **'Saved securely to your account for your next order.'**
  String get savedForNextTime;

  /// No description provided for @savedAddressHelp.
  ///
  /// In en, this message translates to:
  /// **'Your addresses stay saved when you sign out or restart the app.'**
  String get savedAddressHelp;

  /// No description provided for @saveAndUseAddress.
  ///
  /// In en, this message translates to:
  /// **'Save and use address'**
  String get saveAndUseAddress;

  /// No description provided for @addressSaved.
  ///
  /// In en, this message translates to:
  /// **'Address saved to your account.'**
  String get addressSaved;

  /// No description provided for @confirmAddressDetails.
  ///
  /// In en, this message translates to:
  /// **'Confirm address details'**
  String get confirmAddressDetails;

  /// No description provided for @addressDetailsHelp.
  ///
  /// In en, this message translates to:
  /// **'Add your street, building and a nearby landmark so the restaurant can find you.'**
  String get addressDetailsHelp;

  /// No description provided for @addressLineHint.
  ///
  /// In en, this message translates to:
  /// **'Street, building or house number'**
  String get addressLineHint;

  /// No description provided for @landmarkHint.
  ///
  /// In en, this message translates to:
  /// **'Nearby landmark or neighbourhood'**
  String get landmarkHint;

  /// No description provided for @addressHome.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get addressHome;

  /// No description provided for @addressWork.
  ///
  /// In en, this message translates to:
  /// **'Work'**
  String get addressWork;

  /// No description provided for @addressOther.
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get addressOther;

  /// No description provided for @change.
  ///
  /// In en, this message translates to:
  /// **'Change'**
  String get change;

  /// No description provided for @editPin.
  ///
  /// In en, this message translates to:
  /// **'Adjust pin'**
  String get editPin;

  /// No description provided for @accountPrefilled.
  ///
  /// In en, this message translates to:
  /// **'From your Pakhlai account'**
  String get accountPrefilled;

  /// No description provided for @secureCheckout.
  ///
  /// In en, this message translates to:
  /// **'Your order, your details'**
  String get secureCheckout;

  /// No description provided for @checkoutIntro.
  ///
  /// In en, this message translates to:
  /// **'Confirm where and how you would like to receive your order.'**
  String get checkoutIntro;

  /// No description provided for @invalidPhone.
  ///
  /// In en, this message translates to:
  /// **'Enter a valid phone number (7–15 digits).'**
  String get invalidPhone;

  /// No description provided for @zoomIn.
  ///
  /// In en, this message translates to:
  /// **'Zoom in'**
  String get zoomIn;

  /// No description provided for @zoomOut.
  ///
  /// In en, this message translates to:
  /// **'Zoom out'**
  String get zoomOut;

  /// No description provided for @deliveryPin.
  ///
  /// In en, this message translates to:
  /// **'Delivery pin'**
  String get deliveryPin;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
