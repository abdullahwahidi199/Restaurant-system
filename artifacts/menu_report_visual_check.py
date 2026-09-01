import base64
import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

import websocket


DEBUG_URL = "http://127.0.0.1:9224"
APP_URL = "http://127.0.0.1:5173"
OUTPUT = Path(__file__).parent / "menu-report-check"
OUTPUT.mkdir(parents=True, exist_ok=True)


class Cdp:
    def __init__(self, url):
        self.socket = websocket.create_connection(url, timeout=20, suppress_origin=True)
        self.message_id = 0

    def call(self, method, params=None):
        self.message_id += 1
        current_id = self.message_id
        self.socket.send(json.dumps({"id": current_id, "method": method, "params": params or {}}))
        while True:
            message = json.loads(self.socket.recv())
            if message.get("id") == current_id:
                if "error" in message:
                    raise RuntimeError(message["error"])
                return message.get("result", {})

    def evaluate(self, expression):
        return self.call("Runtime.evaluate", {"expression": expression, "returnByValue": True, "awaitPromise": True})["result"].get("value")


def new_target():
    request = urllib.request.Request(
        f"{DEBUG_URL}/json/new?{urllib.parse.quote(APP_URL, safe='')}", method="PUT"
    )
    with urllib.request.urlopen(request, timeout=10) as response:
        return json.load(response)


def screenshot(cdp, name):
    result = cdp.call("Page.captureScreenshot", {"format": "png", "captureBeyondViewport": False})
    (OUTPUT / name).write_bytes(base64.b64decode(result["data"]))


target = new_target()
cdp = Cdp(target["webSocketDebuggerUrl"])
cdp.call("Page.enable")
cdp.call("Runtime.enable")
time.sleep(1)
cdp.evaluate(
    """
    localStorage.setItem('authTokens', JSON.stringify({access:'visual-token', refresh:'visual-refresh'}));
    localStorage.setItem('user', JSON.stringify({role:'Admin', name:'Visual Admin', active_branch:{id:1,name:'Central Branch'}}));
    localStorage.setItem('activeBranch', JSON.stringify({id:1,name:'Central Branch'}));
    localStorage.setItem('branches', JSON.stringify([{id:1,name:'Central Branch'}]));
    localStorage.setItem('i18nextLng', 'en');
    localStorage.setItem('pakhlai-theme', 'modern');
    location.href='/admin/dashboard/reports';
    """
)
for _ in range(30):
    if cdp.evaluate("Boolean(document.querySelector('#report-type'))"):
        break
    time.sleep(0.25)
selection = cdp.evaluate(
    """
    (() => {
      const select = document.querySelector('#report-type');
      if (!select) return 'missing';
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
      setter.call(select, 'menu_items');
      select.dispatchEvent(new Event('change', {bubbles:true}));
      return select.value;
    })()
    """
)
time.sleep(4)

results = {}
for width, height, name in [(1440, 1000, "desktop.png"), (768, 900, "tablet.png"), (390, 844, "mobile.png")]:
    cdp.call("Emulation.setDeviceMetricsOverride", {"width": width, "height": height, "deviceScaleFactor": 1, "mobile": width < 600})
    time.sleep(0.7)
    results[name] = cdp.evaluate(
        """
        ({
          selected: document.querySelector('#report-type')?.value,
          title: [...document.querySelectorAll('h2')].some(item => item.textContent.includes('Menu Item Sales')),
          viewport: innerWidth,
          bodyWidth: document.body.scrollWidth,
          hasTable: Boolean(document.querySelector('table')),
          hasCharts: document.querySelectorAll('.recharts-responsive-container').length >= 2,
          kpis: document.querySelectorAll('.theme-kpi-card').length
        })
        """
    )
    screenshot(cdp, name)

cdp.evaluate("document.documentElement.dataset.theme='dark'; document.querySelector('main')?.setAttribute('dir','rtl')")
time.sleep(0.5)
screenshot(cdp, "mobile-dark-rtl.png")

cdp.evaluate(
    """
    (() => {
      const buttons = [...document.querySelectorAll('button')];
      const button = buttons.find(item => item.textContent.includes('Generate PDF'));
      if (button) button.click();
    })()
    """
)
time.sleep(0.5)
results["pdf_modal"] = cdp.evaluate("Boolean(document.body.innerText.includes('Generate Menu Item Sales PDF'))")
screenshot(cdp, "mobile-pdf-modal.png")
results["selection"] = selection
print(json.dumps(results, indent=2))
