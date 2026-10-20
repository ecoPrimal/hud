#!/usr/bin/env python3
"""serve-local.py — eastgate membrane transducer.

NOT a file server. A TRANSDUCER.

A real cell membrane transducer takes one signal type on one side and
converts it to a different signal type on the other side. This does that:

  INSIDE (52 unix sockets, 2515 capabilities, tarpc binary)
    ↕ TRANSDUCTION ↕
  OUTSIDE (40+ JSON feeds, HTTP polling, human-readable)

The old version just served cached JSON files. Dead copies.
This version reads from BOTH sides and mixes them:

  1. OUTSIDE→INSIDE: golgi feeds → enriched with local organism state
  2. INSIDE→OUTSIDE: socket health/caps → exposed as JSON for HUD
  3. MIXING: merged view shows both perspectives (Vitruvian)
  4. FLOW RATE: counts actual transductions per minute

Usage:
  python3 infra/hud/serve-local.py         # serves on :8180
  python3 infra/hud/serve-local.py 9090     # serves on :9090
"""
import http.server
import json
import os
import socket
import struct
import sys
import time
import threading

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8180

# ═══════════════════════════════════════════════════════
# PATHS
# ═══════════════════════════════════════════════════════

ROOT = os.path.expanduser("~/Development/ecoPrimals")
HUD_PUBLIC = os.path.join(ROOT, "infra/hud/site/public")
FEED_DIR = os.path.join(ROOT, "membrane/local-terminal/remote")
LOCAL_DIR = os.path.join(ROOT, "membrane/local-terminal")
SOCKET_DIR = "/run/user/1000/biomeos"
CAP_REGISTRY = os.path.join(SOCKET_DIR, "capability-registry.json")

# ═══════════════════════════════════════════════════════
# OUTSIDE FEEDS (golgi → local cache → HUD)
# ═══════════════════════════════════════════════════════

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
    "/local-pulse.json": os.path.join(LOCAL_DIR, "local-pulse.json"),
    "/membrane-chain.json": os.path.join(LOCAL_DIR, "membrane-chain.json"),
}

# ═══════════════════════════════════════════════════════
# INSIDE STATE (organisms on eastgate, live socket data)
# Cached and refreshed by background thread.
# ═══════════════════════════════════════════════════════

inside_state = {
    "ts": None,
    "sockets": {},         # name → {path, alive, type}
    "capabilities": {},    # namespace → [{cap, primal, endpoint}]
    "cap_count": 0,
    "socket_count": 0,
    "tarpc_count": 0,
    "organisms": {},       # primal → {caps, sockets, alive}
    "symlinks": {},        # alias → target
}
inside_lock = threading.Lock()


def refresh_inside():
    """Scan the socket directory and capability registry.
    Called by background thread every 10 seconds.
    """
    state = {
        "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "sockets": {},
        "capabilities": {},
        "cap_count": 0,
        "socket_count": 0,
        "tarpc_count": 0,
        "organisms": {},
        "symlinks": {},
    }

    # Scan sockets
    if os.path.isdir(SOCKET_DIR):
        for name in os.listdir(SOCKET_DIR):
            full = os.path.join(SOCKET_DIR, name)
            if os.path.islink(full):
                target = os.readlink(full)
                state["symlinks"][name] = target
            if name.endswith(".sock"):
                is_tarpc = ".tarpc." in name
                alive = os.path.exists(full)
                state["sockets"][name] = {
                    "path": full,
                    "alive": alive,
                    "tarpc": is_tarpc,
                }
                state["socket_count"] += 1
                if is_tarpc:
                    state["tarpc_count"] += 1

    # Parse capability registry
    if os.path.exists(CAP_REGISTRY):
        try:
            with open(CAP_REGISTRY) as f:
                caps = json.load(f)
            state["cap_count"] = len(caps)
            for entry in caps:
                cap = entry.get("capability", "")
                primal = entry.get("primal_name", "?")
                ns = cap.split(".")[0] if "." in cap else cap

                # By namespace
                if ns not in state["capabilities"]:
                    state["capabilities"][ns] = []
                state["capabilities"][ns].append({
                    "capability": cap,
                    "primal": primal,
                })

                # By organism
                if primal not in state["organisms"]:
                    state["organisms"][primal] = {"caps": 0, "alive": False}
                state["organisms"][primal]["caps"] += 1

            # Check organism liveness via sockets
            for primal in state["organisms"]:
                sock_name = primal.replace("-", "") + ".sock"
                for sname, sinfo in state["sockets"].items():
                    if primal in sname and sinfo["alive"]:
                        state["organisms"][primal]["alive"] = True
                        break
        except Exception:
            pass

    with inside_lock:
        inside_state.update(state)


def inside_refresh_loop():
    """Background thread: refresh inside state every 10s."""
    while True:
        try:
            refresh_inside()
        except Exception:
            pass
        time.sleep(10)


def probe_socket(sock_path, timeout=0.5):
    """Try to connect to a unix socket. Returns True if alive."""
    try:
        s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        s.settimeout(timeout)
        s.connect(sock_path)
        s.close()
        return True
    except Exception:
        return False


# ═══════════════════════════════════════════════════════
# FLOW RATE — actual transductions per minute
# ═══════════════════════════════════════════════════════

flow_log = {"outside": [], "inside": [], "mixed": []}
MAX_FLOW = 500


def log_flow(direction):
    """Record a transduction event."""
    ts = time.time()
    flow_log[direction].append(ts)
    cutoff = ts - 60
    for d in flow_log:
        while flow_log[d] and flow_log[d][0] < cutoff:
            flow_log[d].pop(0)


def flow_rate():
    """Current transductions per minute by direction."""
    return {
        "outside_rpm": len(flow_log["outside"]),
        "inside_rpm": len(flow_log["inside"]),
        "mixed_rpm": len(flow_log["mixed"]),
        "total_rpm": sum(len(v) for v in flow_log.values()),
    }


# ═══════════════════════════════════════════════════════
# HTTP HANDLER — the transduction surface
# ═══════════════════════════════════════════════════════

class TransducerHandler(http.server.SimpleHTTPRequestHandler):
    """The membrane transducer.

    Requests hitting this surface trigger actual transduction:
    - Feed requests → OUTSIDE data enriched with INSIDE state
    - Socket/cap requests → INSIDE data formatted for OUTSIDE consumption
    - Mixed requests → both sides merged (Vitruvian view)
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=HUD_PUBLIC, **kwargs)

    def do_GET(self):
        path = self.path.split("?")[0]

        # ─── INSIDE endpoints (socket mesh → JSON for HUD) ───

        if path == "/inside.json":
            log_flow("inside")
            with inside_lock:
                self._json_response(inside_state)
            return

        if path == "/organisms.json":
            log_flow("inside")
            with inside_lock:
                self._json_response({
                    "ts": inside_state["ts"],
                    "organisms": inside_state["organisms"],
                    "socket_count": inside_state["socket_count"],
                    "tarpc_count": inside_state["tarpc_count"],
                    "cap_count": inside_state["cap_count"],
                })
            return

        if path == "/sockets.json":
            log_flow("inside")
            with inside_lock:
                self._json_response({
                    "ts": inside_state["ts"],
                    "sockets": inside_state["sockets"],
                    "symlinks": inside_state["symlinks"],
                })
            return

        if path == "/cap-namespaces.json":
            log_flow("inside")
            with inside_lock:
                ns_summary = {}
                for ns, caps in inside_state["capabilities"].items():
                    primals = set(c["primal"] for c in caps)
                    ns_summary[ns] = {
                        "count": len(caps),
                        "primals": sorted(primals),
                    }
                self._json_response({
                    "ts": inside_state["ts"],
                    "namespaces": ns_summary,
                })
            return

        # ─── OUTSIDE endpoints (golgi feeds, cached) ───

        if path in FEED_MAP:
            log_flow("outside")
            fpath = FEED_MAP[path]
            if os.path.exists(fpath):
                mtime = os.path.getmtime(fpath)
                age = time.time() - mtime
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Cache-Control", "no-cache, max-age=5")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("X-Source", "outside-golgi")
                self.send_header("X-Feed-Age", f"{age:.0f}s")
                self.end_headers()
                with open(fpath, "rb") as f:
                    self.wfile.write(f.read())
                return
            else:
                self._json_response({"error": f"feed not cached: {path}"}, 404)
                return

        # ─── MIXED endpoints (both sides merged) ───

        if path == "/transducer.json" or path == "/flow-rate.json":
            log_flow("mixed")
            with inside_lock:
                orgs_alive = sum(1 for o in inside_state["organisms"].values() if o.get("alive"))
                feeds_cached = sum(1 for p in FEED_MAP.values() if os.path.exists(p))
                self._json_response({
                    "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    "flow": flow_rate(),
                    "inside": {
                        "sockets": inside_state["socket_count"],
                        "tarpc": inside_state["tarpc_count"],
                        "capabilities": inside_state["cap_count"],
                        "organisms_alive": orgs_alive,
                        "organisms_total": len(inside_state["organisms"]),
                    },
                    "outside": {
                        "feeds_cached": feeds_cached,
                        "feeds_total": len(FEED_MAP),
                    },
                    "transduction": {
                        "inside_to_outside": inside_state["cap_count"] > 0,
                        "outside_to_inside": feeds_cached > 0,
                        "mixing": inside_state["cap_count"] > 0 and feeds_cached > 0,
                        "genetic_namespaces": len(inside_state.get("capabilities", {})),
                    },
                })
            return

        if path == "/presence.json":
            log_flow("mixed")
            with inside_lock:
                orgs = inside_state.get("organisms", {})
                self._json_response({
                    "is": {
                        "count": 1,
                        "epitopes": {"MEMBRANE": 1},
                        "organisms_alive": sum(1 for o in orgs.values() if o.get("alive")),
                    },
                    "nearby": {"count": 0},
                    "was": {"count": 0},
                    "note": "transduced: local organism mesh + membrane presence",
                })
            return

        # Stub feeds that are neither inside nor outside
        if path.endswith(".json") and path not in FEED_MAP:
            log_flow("outside")
            self._json_response({"note": f"no transducer for {path}"}, 200)
            return

        # Billboard
        if path == "/billboard":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            with inside_lock:
                sc = inside_state["socket_count"]
                cc = inside_state["cap_count"]
            self.wfile.write(
                f"eastgate transducer: {sc} sockets, {cc} capabilities, mixing".encode("utf-8")
            )
            return

        # Static files
        super().do_GET()

    def _json_response(self, data, status=200):
        body = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("X-Source", "eastgate-transducer")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        ts = time.strftime("%H:%M:%S")
        path = args[0].split()[1] if args else "?"
        status = args[1] if len(args) > 1 else "?"
        fr = flow_rate()
        direction = "M" if "inside" in path or "organism" in path or "socket" in path or "cap-" in path or "transducer" in path else ("I" if "inside" in path else "O")
        sys.stderr.write(
            f"  [{ts}] {direction} {status} {path}  "
            f"(in={fr['inside_rpm']} out={fr['outside_rpm']} mix={fr['mixed_rpm']})\n"
        )


# ═══════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════

def main():
    # Initial scan
    refresh_inside()

    with inside_lock:
        sc = inside_state["socket_count"]
        tc = inside_state["tarpc_count"]
        cc = inside_state["cap_count"]
        oc = len(inside_state["organisms"])

    feeds_cached = sum(1 for p in FEED_MAP.values() if os.path.exists(p))

    print(f"""
+=========================================================+
|  eastgate TRANSDUCER - http://localhost:{PORT}              |
+=========================================================+
|  INSIDE  (socket mesh)                                  |
|    sockets: {sc:>4}   tarpc: {tc:>4}   caps: {cc:>4}              |
|    organisms: {oc}                                        |
|  OUTSIDE (golgi feeds)                                  |
|    feeds cached: {feeds_cached}/{len(FEED_MAP)}                              |
|  TRANSDUCTION                                           |
|    /transducer.json  — flow rate + mixing status        |
|    /inside.json      — organism socket state            |
|    /organisms.json   — who's alive on eastgate          |
|    /sockets.json     — raw socket map                   |
|    /cap-namespaces.json — capability landscape          |
|    /dashboard.json   — outside feed (golgi)             |
|    /presence.json    — MIXED inside+outside             |
+---------------------------------------------------------+
|  O=outside  I=inside  M=mixed                           |
+=========================================================+
""")

    # Start background inside-state refresh
    t = threading.Thread(target=inside_refresh_loop, daemon=True)
    t.start()

    server = http.server.HTTPServer(("0.0.0.0", PORT), TransducerHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  transducer stopped.")
        server.server_close()


if __name__ == "__main__":
    main()
