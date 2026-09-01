import base64
import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

import websocket


DEBUG_URL = "http://127.0.0.1:9223"
APP_URL = "http://127.0.0.1:4173"
OUTPUT = Path(__file__).parent / "final"
OUTPUT.mkdir(parents=True, exist_ok=True)


def new_target():
    request = urllib.request.Request(
        f"{DEBUG_URL}/json/new?{urllib.parse.quote(APP_URL, safe='')}",
        method="PUT",
    )
    with urllib.request.urlopen(request, timeout=10) as response:
        return json.load(response)


class Cdp:
    def __init__(self, websocket_url):
        self.socket = websocket.create_connection(
            websocket_url,
            timeout=15,
            suppress_origin=True,
        )
        self.message_id = 0

    def call(self, method, params=None):
        self.message_id += 1
        current_id = self.message_id
        self.socket.send(
            json.dumps(
                {
                    "id": current_id,
                    "method": method,
                    "params": params or {},
                }
            )
        )
        while True:
            message = json.loads(self.socket.recv())
            if message.get("id") == current_id:
                if "error" in message:
                    raise RuntimeError(message["error"])
                return message.get("result", {})

    def evaluate(self, expression):
        return self.call(
            "Runtime.evaluate",
            {"expression": expression, "returnByValue": True, "awaitPromise": True},
        )["result"].get("value")

    def close(self):
        self.socket.close()


def set_viewport(cdp, width, height, mobile):
    cdp.call(
        "Emulation.setDeviceMetricsOverride",
        {
            "width": width,
            "height": height,
            "deviceScaleFactor": 1,
            "mobile": mobile,
            "screenWidth": width,
            "screenHeight": height,
        },
    )


def navigate(cdp, path):
    cdp.call("Page.navigate", {"url": f"{APP_URL}{path}"})
    time.sleep(1.3)


def metrics(cdp):
    return cdp.evaluate(
        r"""
        (() => {
          const root = document.documentElement;
          const main = document.querySelector('main');
          const selectors = [
            '.marketplace-navbar-inner',
            '.marketplace-search-card',
            '.marketplace-search-popover',
            '.marketplace-location-panel',
            '.marketplace-mobile-menu',
            '.customer-auth-header',
            '.customer-auth-stage',
            '.customer-auth-panel-inner'
          ];
          const elements = {};
          for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (!element) continue;
            const rect = element.getBoundingClientRect();
            elements[selector] = {
              left: +rect.left.toFixed(1),
              right: +rect.right.toFixed(1),
              top: +rect.top.toFixed(1),
              bottom: +rect.bottom.toFixed(1),
              width: +rect.width.toFixed(1),
              height: +rect.height.toFixed(1),
              outside: rect.left < -0.5 || rect.right > innerWidth + 0.5
            };
          }
          const searchTargets = [...document.querySelectorAll(
            '.marketplace-search-card input, .marketplace-search-card button, .marketplace-location-panel input, .marketplace-location-panel button'
          )].map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              tag: element.tagName,
              id: element.id,
              width: +rect.width.toFixed(1),
              height: +rect.height.toFixed(1),
              tooSmall: rect.width < 43.5 || rect.height < 43.5
            };
          });
          return {
            path: location.pathname,
            title: document.title,
            lang: root.lang,
            dir: root.dir,
            theme: root.dataset.theme,
            viewport: { width: innerWidth, height: innerHeight },
            documentWidth: root.scrollWidth,
            mainWidth: main?.scrollWidth,
            mainClientWidth: main?.clientWidth,
            horizontalOverflow:
              root.scrollWidth > innerWidth ||
              (main && main.scrollWidth > main.clientWidth),
            h1: document.querySelector('h1')?.innerText || '',
            registerLinks: [...document.querySelectorAll('a[href="/signup"]')].length,
            authInputs: document.querySelectorAll('.customer-auth-input').length,
            runtimeErrors: window.__pakhlaiRuntimeErrors || [],
            elements,
            searchTargets
          };
        })()
        """
    )


def screenshot(cdp, name):
    result = cdp.call(
        "Page.captureScreenshot",
        {"format": "png", "fromSurface": True, "captureBeyondViewport": False},
    )
    (OUTPUT / f"{name}.png").write_bytes(base64.b64decode(result["data"]))


def capture(cdp, name, path, width, height, mobile=True, action=None):
    set_viewport(cdp, width, height, mobile)
    navigate(cdp, path)
    if action:
        cdp.evaluate(action)
        time.sleep(0.8)
    result = metrics(cdp)
    screenshot(cdp, name)
    print(f"{name}: {json.dumps(result, ensure_ascii=False)}")
    return result


target = new_target()
cdp = Cdp(target["webSocketDebuggerUrl"])
all_results = {}
try:
    cdp.call("Page.enable")
    cdp.call("Runtime.enable")
    cdp.call(
        "Page.addScriptToEvaluateOnNewDocument",
        {
            "source": r"""
              window.__pakhlaiRuntimeErrors = [];
              window.addEventListener('error', (event) => {
                window.__pakhlaiRuntimeErrors.push(String(event.error || event.message));
              });
              window.addEventListener('unhandledrejection', (event) => {
                window.__pakhlaiRuntimeErrors.push(String(event.reason));
              });
            """
        },
    )
    navigate(cdp, "/")
    cdp.evaluate(
        "localStorage.setItem('i18nextLng', 'en');"
        "localStorage.setItem('pakhlai-theme', 'modern');"
        "localStorage.removeItem('pakhlai_delivery_location');"
    )

    for case in (
        ("landing-320", "/", 320, 568, True),
        ("landing-375", "/", 375, 667, True),
        ("landing-390", "/", 390, 844, True),
        ("landing-430", "/", 430, 932, True),
        ("landing-tablet", "/", 768, 1024, True),
        ("landing-desktop", "/", 1440, 900, False),
        ("login-320", "/login", 320, 568, True),
        ("login-390", "/login", 390, 844, True),
        ("login-desktop", "/login", 1440, 900, False),
        ("signup-320", "/signup", 320, 844, True),
        ("signup-390", "/signup", 390, 844, True),
        ("signup-tablet", "/signup", 768, 1024, True),
        ("signup-desktop", "/signup", 1440, 1000, False),
    ):
        name = case[0]
        all_results[name] = capture(cdp, *case)

    all_results["search-390-short"] = capture(
        cdp,
        "search-390-short",
        "/",
        390,
        500,
        True,
        "document.getElementById('marketplace-restaurant-search')?.focus();"
        "document.getElementById('marketplace-restaurant-search')?.dispatchEvent(new Event('input', {bubbles:true}));",
    )
    all_results["location-320"] = capture(
        cdp,
        "location-320",
        "/",
        320,
        568,
        True,
        "document.querySelector('.marketplace-location-trigger')?.click()",
    )
    all_results["mobile-menu-320"] = capture(
        cdp,
        "mobile-menu-320",
        "/",
        320,
        568,
        True,
        "document.querySelector('[aria-controls=\"marketplace-mobile-navigation\"]')?.click()",
    )
    all_results["signup-320-bottom"] = capture(
        cdp,
        "signup-320-bottom",
        "/signup",
        320,
        844,
        True,
        "document.querySelector('main').scrollTop = document.querySelector('main').scrollHeight",
    )

    failures = {
        name: result
        for name, result in all_results.items()
        if result["horizontalOverflow"] or result["runtimeErrors"]
    }
    print(f"FAILURES: {json.dumps(failures, ensure_ascii=False)}")
finally:
    cdp.close()
