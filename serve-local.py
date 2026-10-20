#!/usr/bin/env python3
"""serve-local.py — local HUD dev server on eastgate.

Serves the HUD static files AND the membrane JSON feeds so you can
develop on the HUD without pushing to golgi.

Data flow:
  golgi (live-terminal) → local-pulse.py → membrane/local-terminal/remote/*.json
                                              ↓
  this server merges: HUD static + feed JSON → http://localhost:8080/
                                              ↓
  browser opens HUD → pi-bus.js fetches /dashboard.json etc → live data

Also proxies squirrel MCP requests through to validate message passing.

Usage:
  python3 infra/hud/serve-local.py         # serves on :8080
  python3 infra/hud/serve-local.py 9090     # serves on :9090
"""
import http.server
import json
import os
import sys
import time
import mimetypes

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080

# Paths
ROOT = os.path.expanduser("~/Development/ecoPrimals")
HUD_PUBLIC = os.path.join(ROOT, "infra/hud/site/public")
FEED_DIR = os.path.join(ROOT, "membrane/local-terminal/remote")
LOCAL_DIR = os.path.join(ROOT, "membrane/local-terminal")

# Feed files that the HUD expects (pi-bus.js subscriptions)
# Maps URL path → local file location
FEED_MAP = {
    "/dashboard.json": os.path.join(FEED_DIR, "dashboard.json"),
    "/scan_sweep_sort.json": os.path.join(FEED_DIR, "scan_sweep_sort.json"),
    "/topology.json": os.path.join(FEED_DIR, "topology.json"),
    "/campfire.json": os.path.join(FEED_DIR, "campfire.json"),
    "/braid.json": os.path.join(FEED_DIR, "braid.json"),
    "/visitor-stories.json": os.path.join(FEED_DIR, "visitor-stories.json"),
    "/pollen.json": os.path.join(FEED_DIR, "pollen.json"),
    "/chipmunk.json": os.path.join(FEED_DIR, "chipmunk.json"),
    "/immune-topology.json": os.path.join(FEED_DIR, "immune-topology.json"),
    "/campfire-culture.json": os.path.join(FEED_DIR, "campfire-culture.json"),
    "/cardiovascular.json": os.path.join(FEED_DIR, "cardiovascular.json"),
    "/passage-totality.json": os.path.join(FEED_DIR, "passage-totality.json"),
    "/neutron-cache.json": os.path.join(FEED_DIR, "neutron-cache.json"),
    # Local-only feeds
    "/local-pulse.json": os.path.join(LOCAL_DIR, "local-pulse.json"),
    "/membrane-chain.json": os.path.join(LOCAL_DIR, "membrane-chain.json"),
}

# Feeds we don't have locally — will return empty/stub
STUB_FEEDS = {
    "/human.json": {"humans": [], "note": "local-stub: pull from golgi"},
    "/negentropy.json": {"note": "local-stub: no negentropy feed on eastgate"},
    "/touches.json": {"touches": [], "note": "local-stub"},
    "/bingo-cube.json": {"note": "local-stub: no bingo-cube feed on eastgate"},
    "/dialogue.json": {"dialogues": [], "note": "local-stub"},
    "/presence.json": {"is": {"count": 1}, "nearby": {"count": 0}, "was": {"count": 0}, "note": "local-stub: you're the only human here"},
    "/mesh-ring.json": {"note": "local-stub"},
    "/commensals.json": {"note": "local-stub"},
}

# Flow rate tracking
flow_log = []
MAX_FLOW_LOG = 200


class HudHandler(http.server.SimpleHTTPRequestHandler):
    """Serves HUD static files + membrane feed JSON."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=HUD_PUBLIC, **kwargs)

    def do_GET(self):
        path = self.path.split("?")[0]  # strip query params
        ts = time.time()

        # Track flow rate
        flow_log.append(ts)
        while flow_log and flow_log[0] < ts - 60:
            flow_log.pop(0)

        # Feed JSON from local membrane cache
        if path in FEED_MAP:
            fpath = FEED_MAP[path]
            if os.path.exists(fpath):
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Cache-Control", "no-cache, max-age=5")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("X-Source", "eastgate-local")
                self.end_headers()
                with open(fpath, "rb") as f:
                    self.wfile.write(f.read())
                return
            else:
                # Feed file doesn't exist yet — return stub if we have one
                if path in STUB_FEEDS:
                    self._json_response(STUB_FEEDS[path])
                    return
                self.send_error(404, f"Feed not cached locally: {path}")
                return

        # Stub feeds
        if path in STUB_FEEDS:
            self._json_response(STUB_FEEDS[path])
            return

        # Billboard (text)
        if path == "/billboard":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            self.wfile.write("eastgate local dev - the membrane breathes here too".encode("utf-8"))
            return

        # Flow rate endpoint (for testing message passing)
        if path == "/flow-rate.json":
            rpm = len(flow_log)
            self._json_response({
                "requests_per_minute": rpm,
                "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "source": "eastgate-local",
                "feeds_cached": len([p for p in FEED_MAP.values() if os.path.exists(p)]),
                "feeds_total": len(FEED_MAP),
                "feeds_stubbed": len(STUB_FEEDS),
            })
            return

        # Fall through to static file serving
        super().do_GET()

    def _json_response(self, data, status=200):
        body = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("X-Source", "eastgate-local")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        # Compact logging
        ts = time.strftime("%H:%M:%S")
        path = args[0].split()[1] if args else "?"
        status = args[1] if len(args) > 1 else "?"
        is_feed = "F" if path.endswith(".json") else "S"
        rpm = len(flow_log)
        sys.stderr.write(f"  [{ts}] {is_feed} {status} {path}  (rpm={rpm})\n")


def main():
    cached = len([p for p in FEED_MAP.values() if os.path.exists(p)])
    total = len(FEED_MAP)

    print(f"""
╔════════════════════════════════════════════════════════╗
║  eastgate local HUD — http://localhost:{PORT}           ║
╠════════════════════════════════════════════════════════╣
║  HUD static: {HUD_PUBLIC}
║  Feed cache: {FEED_DIR}
║  Feeds: {cached}/{total} cached, {len(STUB_FEEDS)} stubbed
║  Flow rate:  /flow-rate.json
║                                                        ║
║  F = feed request, S = static file                     ║
║  northGate works from outside (golgi → signal)         ║
║  eastGate works from inside (this server → browser)    ║
╚════════════════════════════════════════════════════════╝
""")

    server = http.server.HTTPServer(("0.0.0.0", PORT), HudHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  eastgate local HUD stopped.")
        server.server_close()


if __name__ == "__main__":
    main()
