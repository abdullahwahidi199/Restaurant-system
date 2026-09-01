import base64
import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

import websocket


DEBUG_URL = "http://127.0.0.1:9223"
PAGE_URL = "http://127.0.0.1:4173/"
OUTPUT = Path(__file__).parent / "responsive-cdp"
OUTPUT.mkdir(parents=True, exist_ok=True)


def new_target():
    target_url = f"{DEBUG_URL}/json/new?{urllib.parse.quote(PAGE_URL, safe='')}"
    request = urllib.request.Request(target_url, method="PUT")
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

    def close(self):
        self.socket.close()


def page_metrics(cdp):
    expression = """
    (() => {
      const selectors = [
        '.marketplace-navbar-inner',
        '.marketplace-hero-copy',
        '.marketplace-search-card',
        '.marketplace-hero-visual',
        '.marketplace-search-popover'
      ];
      const elements = {};
      selectors.forEach((selector) => {
        const element = document.querySelector(selector);
        if (!element) return;
        const rect = element.getBoundingClientRect();
        elements[selector] = {
          left: Math.round(rect.left * 10) / 10,
          right: Math.round(rect.right * 10) / 10,
          top: Math.round(rect.top * 10) / 10,
          bottom: Math.round(rect.bottom * 10) / 10,
          outsideViewport: rect.left < -0.5 || rect.right > window.innerWidth + 0.5
        };
      });
      return {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
        language: document.documentElement.lang,
        direction: document.documentElement.dir,
        theme: document.documentElement.dataset.theme,
        elements
      };
    })()
    """
    return cdp.call(
        "Runtime.evaluate",
        {"expression": expression, "returnByValue": True},
    )["result"]["value"]


def capture(cdp, name, width, height, mobile):
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
    cdp.call("Page.navigate", {"url": PAGE_URL})
    time.sleep(2.5)
    metrics = page_metrics(cdp)
    screenshot = cdp.call(
        "Page.captureScreenshot",
        {
            "format": "png",
            "fromSurface": True,
            "captureBeyondViewport": False,
        },
    )
    (OUTPUT / f"{name}.png").write_bytes(base64.b64decode(screenshot["data"]))
    print(f"{name}: {json.dumps(metrics, ensure_ascii=False)}")


target = new_target()
cdp = Cdp(target["webSocketDebuggerUrl"])
try:
    cdp.call("Page.enable")
    cdp.call("Runtime.enable")
    for case in (
        ("phone-320", 320, 568, True),
        ("phone-375", 375, 667, True),
        ("phone-390", 390, 844, True),
        ("phone-430", 430, 932, True),
        ("tablet", 768, 1024, True),
        ("desktop", 1440, 900, False),
    ):
        capture(cdp, *case)

    cdp.call(
        "Emulation.setDeviceMetricsOverride",
        {
            "width": 390,
            "height": 844,
            "deviceScaleFactor": 1,
            "mobile": True,
            "screenWidth": 390,
            "screenHeight": 844,
        },
    )
    cdp.call("Page.navigate", {"url": PAGE_URL})
    time.sleep(2)
    cdp.call(
        "Runtime.evaluate",
        {
            "expression": "document.getElementById('marketplace-restaurant-search')?.focus()",
        },
    )
    cdp.call("Input.insertText", {"text": "Afghan"})
    time.sleep(1)
    search_metrics = page_metrics(cdp)
    search_shot = cdp.call(
        "Page.captureScreenshot",
        {"format": "png", "fromSurface": True, "captureBeyondViewport": False},
    )
    (OUTPUT / "phone-390-search-open.png").write_bytes(
        base64.b64decode(search_shot["data"])
    )
    print(f"phone-390-search-open: {json.dumps(search_metrics, ensure_ascii=False)}")

    cdp.call(
        "Runtime.evaluate",
        {
            "expression": """
              localStorage.setItem('i18nextLng', 'fa');
              localStorage.setItem('pakhlai-theme', 'dark');
            """,
        },
    )
    capture(cdp, "phone-390-rtl-dark", 390, 844, True)
finally:
    cdp.close()
