# Pakhlai Mobile

The official Pakhlai customer marketplace application, built with Flutter.

## Run locally

Start the existing Django backend first (PowerShell):

```sh
cd ../backend/backend
$env:DJANGO_DEBUG='True'
python manage.py migrate customers 0012_customeraddress
python manage.py migrate orders 0047_order_client_order_id
python manage.py runserver 0.0.0.0:8000
```

Then run the app in another terminal:

```sh
flutter pub get
flutter run --dart-define=APP_ENV=development
```

Development endpoints are selected for the current platform: Android emulator
uses `10.0.2.2`, while Flutter web, Windows, and iOS use the local host. For a
physical phone, override `API_BASE_URL` and `WS_BASE_URL` with the development
computer's LAN address. Restaurant discovery, search, branch menus, customer
authentication, profiles, saved addresses, and checkout use the real DRF
endpoints. The cart remains local until a reviewed checkout is submitted.
The API port must match the running backend; pass `API_BASE_URL` if you run
Django on a different port (for example `http://localhost:8001/api/`).

To run against production instead, pass:

```sh
flutter run \
  --dart-define=APP_ENV=production \
  --dart-define=API_BASE_URL=https://pakhlai.com/api/ \
  --dart-define=WS_BASE_URL=wss://pakhlai.com/ws/
```

Use production HTTPS/WSS endpoints for release builds. The centralized values
live in `lib/core/config/app_config.dart` and contain safe development defaults.

## Foundation

- Riverpod application and authentication state
- GoRouter navigation with state-preserving Home, Search, Orders, and Profile tabs
- Dio API client with secure token storage
- Material 3 light theme and reusable components
- Generated Flutter localization and AFN currency formatting

## Delivery checkout

- Signed-in account name, email, phone, and default saved address load automatically.
- Use current location or select an in-app map pin, then confirm street/building
  details. GPS sets the pin, not a reverse-geocoded postal address; customers
  confirm the written delivery details before saving.
- Home/Work/custom addresses, delivery instructions, and the default address are
  stored against the customer account in Django. Signing out hides them; signing
  back into the same account restores them, including after an app restart.
- Newly saved addresses are selected for this checkout without changing the
  default unless the customer enables that option.
- The fixed total/review button confirms current availability and server prices
  before placing an order. Uncertain submissions retry the same order key.

Stop and restart Flutter after adding these location/map plugins; hot reload
alone does not register native plugins. Location access is requested only when
the customer chooses current location. Android and Apple permission descriptions
are included; there is no background tracking. Location denial, disabled GPS,
timeouts, and approximate fixes leave manual map selection available.

Web current location requires HTTPS, except on localhost. An HTTP page served
from a LAN IP can use the map but cannot request browser GPS. Tiles require
internet connectivity. Coordinate pairs/full map links are an optional fallback;
shortened Google Maps links must be expanded first.

### Map provider

The default map uses OpenStreetMap tiles with visible attribution and native
HTTP-aware caching. Before a public launch, configure a tile provider suitable
for the expected traffic and its licensing requirements; the OSM public service
is not an unlimited commercial CDN. No offline/bulk tile downloads are enabled.
Provider URLs are compile-time settings (including any provider key in the URL):

```sh
flutter run --dart-define=APP_ENV=development --dart-define="MAP_TILE_URL=https://your-provider/{z}/{x}/{y}.png" --dart-define="MAP_ATTRIBUTION=Your provider attribution" --dart-define="MAP_ATTRIBUTION_URL=https://your-provider/attribution"
```

Keep the provider's required credits in the attribution settings. See the
[OSM tile policy](https://operations.osmfoundation.org/policies/tiles/) and
[Flutter Map caching documentation](https://docs.fleaflet.dev/layers/tile-layer/caching).

## Pakhlai logo and app icons

The in-app brand and launcher icons reuse `frontend/public/rmsFavicon.png`.
The source copy and generated square assets live in `assets/branding/`.
Android uses a white adaptive background with a safely inset logo; iOS, web,
Windows, and macOS icon resources also use the same mark. This configures their
icons, but does not create a Windows or Apple release installer.

After replacing the website logo, regenerate from `app`:

```sh
flutter pub get
dart run scripts/prepare_brand_assets.dart
dart run flutter_launcher_icons
```

Rebuild the signed APK and run `npm run publish:android` and `npm run build`
from `frontend` to update the public download. Increment the build number for
each changed APK; retain the existing private signing key for installable updates.

## Checks

```sh
flutter analyze
flutter test
flutter build web
```

Checkout widget tests use mocked account APIs, GPS, and tiles; native GPS
permission prompts still need an Android/iOS device smoke test.

## Android website download

Release APKs use a private signing key, never the Flutter debug key. To initialize
one on Windows, run once from `app`:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/create-release-key.ps1
```

Back up `android/key.properties` and `android/.signing/pakhlai-release.jks`
together in private, secure storage. Both are ignored by Git. Do not regenerate
or replace this key for future updates: Android requires the same signature.
The setup script refuses to overwrite existing signing files.

Build with the public production API so downloaded phones do not contact a
developer's localhost:

```sh
flutter build apk --release --dart-define=APP_ENV=production --dart-define=API_BASE_URL=https://pakhlai.com/api/ --dart-define=WS_BASE_URL=wss://pakhlai.com/ws/
```

Then, from `frontend`:

```sh
npm run publish:android
npm run build
```

The publisher verifies the signed APK using Android build-tools and copies a
versioned APK into `public/downloads` with `android.json`. Deploy all of
`frontend/dist` including `downloads/`; adding code locally does not upload the
APK to the live website. See `frontend/public/downloads/README.md` for hosting.
Increment the version's build number in `pubspec.yaml` for changed releases.

This is direct Android distribution, not a Play Store listing. An iPhone
download requires a separately signed iOS build and App Store/TestFlight link.
