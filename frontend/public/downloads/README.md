# Android downloads

The public landing page reads `android.json` and offers its versioned APK using
a normal browser download (no login or staff API). It checks the APK with HEAD
and never presents a missing file or SPA fallback page as a ready download.

Generate these files by running `npm run publish:android` from `frontend` after
building the signed Flutter release. The publisher verifies the Android package,
signature, and non-debuggable status, then copies the APK and creates a manifest
with its version, size, SHA-256 checksum, and public signing-certificate digest.
These generated artifacts are intentionally excluded from Git.

`npm run build` copies this directory into `dist/downloads`. Deploy the entire
`dist` directory, including downloads, to make the button work for public users.
On a fresh checkout/CI worker, obtain the signed APK artifact and run the
publisher before building the website. No signing keys belong in this directory.

Serve `.apk` files as `application/vnd.android.package-archive` (or binary), and
`android.json` as `application/json`. For nginx, add an exact downloads location
before the SPA fallback:

```nginx
location /downloads/ {
    try_files $uri =404;
}

location = /downloads/android.json {
    try_files $uri =404;
    add_header Cache-Control "no-cache" always;
}
```

The manifest request bypasses stale browser caches. Versioned APK URLs can use
normal static caching. Keep previous APK versions for existing links; increment
the Flutter build number before generating a changed release.

Direct APK installation is for Android only, not iPhone. The page includes a
short explanation of the Android browser-install permission prompt.

## Existing Contabo / GitHub deployment

Use the existing code commit/push and Contabo pull workflow. The APK and release
manifest are build artifacts, not Git files, so generate the website build on
the same machine where `npm run publish:android` was run. Copy the entire
`frontend/dist/` to the server's existing frontend document root, including
`downloads/`. Copying only the JS/CSS assets would leave a disabled download.

The first rollout of the marketplace checkout also needs its backend schema.
After pulling the backend changes, use the server's existing virtualenv from
`backend/backend` and run:

```sh
python manage.py migrate customers 0012_customeraddress
python manage.py migrate orders 0047_order_client_order_id
python manage.py check
```

Then restart the existing Daphne/Gunicorn services as usual. This change does
not require clearing data or restarting Redis. Verify `/api/customer/addresses/`
returns an authentication error rather than 404 when requested without a login.

If Cloudflare has a custom cache-everything rule, exclude
`/downloads/android.json` from that rule. Check HTTPS
`https://pakhlai.com/downloads/android.json` and the APK URL listed in it after
deployment; the APK must not fall back to the website's HTML page.

From this Windows development machine, you can verify the deployed download
and desktop/mobile English, Dari, and Pashto layouts without signing in:

```sh
npm run check:download -- https://pakhlai.com
```

This downloads and checks the APK's size and SHA-256, then opens an isolated
headless Chrome session. It does not change the server. Set `CHROME_PATH` if
Chrome is installed elsewhere.
