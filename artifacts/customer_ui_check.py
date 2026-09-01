import base64
import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

import websocket


DEBUG_URL = "http://127.0.0.1:9223"
APP_URL = "http://127.0.0.1:5173"
OUTPUT = Path(__file__).parent / "customer-ui"
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
        result = self.call(
            "Runtime.evaluate",
            {
                "expression": expression,
                "returnByValue": True,
                "awaitPromise": True,
            },
        )
        return result["result"].get("value")

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
    time.sleep(2.2)


def set_session(cdp, logged_in):
    navigate(cdp, "/")
    if logged_in:
        cdp.evaluate(
            "localStorage.setItem('access_token', 'visual-check-token');"
            "localStorage.setItem('customer', JSON.stringify({"
            "id: 1, username: 'Nadia', email: 'nadia@example.com', "
            "phone: '0700123456', address: 'Kabul'}));"
        )
    else:
        cdp.evaluate(
            "localStorage.removeItem('access_token');"
            "localStorage.removeItem('refresh_token');"
            "localStorage.removeItem('customer');"
        )


def page_metrics(cdp):
    return cdp.evaluate(
        r"""
        (() => {
          const root = document.documentElement;
          const main = document.querySelector('main');
          const account = document.querySelector('[aria-haspopup="menu"]');
          const dropdown = document.querySelector('[role="menu"]');
          const visibleElements = [...document.querySelectorAll('header, nav, section, article, [role="menu"]')]
            .filter((element) => {
              const style = getComputedStyle(element);
              const rect = element.getBoundingClientRect();
              return style.display !== 'none' && rect.width > 0 && rect.height > 0;
            });
          const outside = visibleElements.filter((element) => {
            const rect = element.getBoundingClientRect();
            return rect.left < -1 || rect.right > innerWidth + 1;
          }).map((element) => ({
            tag: element.tagName,
            className: String(element.className).slice(0, 100),
            left: +element.getBoundingClientRect().left.toFixed(1),
            right: +element.getBoundingClientRect().right.toFixed(1)
          })).slice(0, 8);
          return {
            path: location.pathname,
            viewport: { width: innerWidth, height: innerHeight },
            documentWidth: root.scrollWidth,
            mainWidth: main?.scrollWidth,
            horizontalOverflow:
              root.scrollWidth > innerWidth ||
              (main && main.scrollWidth > main.clientWidth),
            h1: document.querySelector('h1')?.innerText || '',
            accountVisible: Boolean(account),
            accountExpanded: account?.getAttribute('aria-expanded') || null,
            dropdownVisible: Boolean(dropdown),
            loginLinks: document.querySelectorAll('a[href="/login"]').length,
            signupLinks: document.querySelectorAll('a[href="/signup"]').length,
            branchCards: document.querySelectorAll('article').length,
            menuItemCards: document.querySelectorAll('[class*="cursor-pointer"]').length,
            runtimeErrors: window.__pakhlaiRuntimeErrors || [],
            outside
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


def capture(cdp, name, path, width, height, logged_in, open_account=False):
    set_viewport(cdp, width, height, width < 900)
    set_session(cdp, logged_in)
    navigate(cdp, path)
    if open_account:
        cdp.evaluate("document.querySelector('[aria-haspopup=\"menu\"]')?.click()")
        time.sleep(0.5)
    result = page_metrics(cdp)
    screenshot(cdp, name)
    print(f"{name}: {json.dumps(result, ensure_ascii=True)}", flush=True)
    return result


target = new_target()
cdp = Cdp(target["webSocketDebuggerUrl"])
results = {}
try:
    cdp.call("Page.enable")
    cdp.call("Runtime.enable")
    cdp.call(
        "Page.addScriptToEvaluateOnNewDocument",
        {
            "source": """
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
    cases = (
        ("landing-guest-390", "/", 390, 844, False, False),
        ("landing-account-390", "/", 390, 844, True, True),
        ("branches-account-390", "/afiat", 390, 844, True, True),
        ("branches-account-desktop", "/afiat", 1440, 900, True, False),
        ("menu-account-390", "/afiat/main-branch", 390, 844, True, True),
        ("menu-account-desktop", "/afiat/main-branch", 1440, 900, True, False),
    )
    for case in cases:
        results[case[0]] = capture(cdp, *case)

    failures = {
        name: result
        for name, result in results.items()
        if result["horizontalOverflow"]
        or result["runtimeErrors"]
        or result["outside"]
        or ("account" in name and not result["accountVisible"])
        or ("account-390" in name and not result["dropdownVisible"])
    }
    print(f"FAILURES: {json.dumps(failures, ensure_ascii=True)}", flush=True)
finally:
    cdp.close()
