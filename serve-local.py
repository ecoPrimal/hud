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

# Circle of Willis: all 35 golgi feeds (13 original + 22 newly routed)
FEED_MAP = {
    # ── ORIGINAL 13 ──
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
    # ── CIRCLE OF WILLIS: 22 dead ends → flowing ──
    "/human.json": os.path.join(FEED_DIR, "human.json"),
    "/pulse.json": os.path.join(FEED_DIR, "pulse.json"),
    "/now.json": os.path.join(FEED_DIR, "now.json"),
    "/membrane-pulse.json": os.path.join(FEED_DIR, "membrane-pulse.json"),
    "/negentropy.json": os.path.join(FEED_DIR, "negentropy.json"),
    "/heartbeat.json": os.path.join(FEED_DIR, "heartbeat.json"),
    "/mesh-speed.json": os.path.join(FEED_DIR, "mesh-speed.json"),
    "/genome.json": os.path.join(FEED_DIR, "genome.json"),
    "/backscatter.json": os.path.join(FEED_DIR, "backscatter.json"),
    "/reflection.json": os.path.join(FEED_DIR, "reflection.json"),
    "/fleet-sort.json": os.path.join(FEED_DIR, "fleet-sort.json"),
    "/pi-ranges.json": os.path.join(FEED_DIR, "pi-ranges.json"),
    "/seo.json": os.path.join(FEED_DIR, "seo.json"),
    "/subgraphs.json": os.path.join(FEED_DIR, "subgraphs.json"),
    "/totality.json": os.path.join(FEED_DIR, "totality.json"),
    "/page-stories.json": os.path.join(FEED_DIR, "page-stories.json"),
    "/falsification.json": os.path.join(FEED_DIR, "falsification.json"),
    "/membrane.json": os.path.join(FEED_DIR, "membrane.json"),
    "/ban-pulse.json": os.path.join(FEED_DIR, "ban-pulse.json"),
    "/scatter-observatory.json": os.path.join(FEED_DIR, "scatter-observatory.json"),
    "/self-remainder.json": os.path.join(FEED_DIR, "self-remainder.json"),
    "/neutron.json": os.path.join(FEED_DIR, "neutron.json"),
    # ── LOCAL ──
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
# LIVENESS PROBE — actual JSON-RPC calls to each socket
# ═══════════════════════════════════════════════════════

PROBE_METHODS = ["system.ping", "health.check", "system.info"]

liveness_cache = {"ts": None, "probes": {}}
liveness_lock = threading.Lock()


def jsonrpc_call(sock_path, method, timeout=1.0):
    """Make a JSON-RPC call to a unix socket. Returns result or None."""
    try:
        s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        s.settimeout(timeout)
        s.connect(sock_path)
        req = json.dumps({"jsonrpc": "2.0", "method": method, "params": {}, "id": 1})
        s.sendall(req.encode() + b"\n")
        s.shutdown(socket.SHUT_WR)
        resp = b""
        while True:
            chunk = s.recv(4096)
            if not chunk:
                break
            resp += chunk
        s.close()
        data = json.loads(resp.decode())
        if "result" in data:
            return data["result"]
    except Exception:
        pass
    return None


def probe_all_sockets():
    """Probe every non-tarpc socket with JSON-RPC. ~2-3s for 44 sockets."""
    results = {}
    if not os.path.isdir(SOCKET_DIR):
        return results
    for name in sorted(os.listdir(SOCKET_DIR)):
        full = os.path.join(SOCKET_DIR, name)
        if not name.endswith(".sock") or ".tarpc." in name:
            continue
        for method in PROBE_METHODS:
            r = jsonrpc_call(full, method, timeout=0.5)
            if r is not None:
                results[name] = {
                    "method": method,
                    "status": r.get("status", r.get("pong", "ok")),
                    "version": r.get("version", "?"),
                    "primal": r.get("primal", name.split(".")[0]),
                    "alive": True,
                }
                break
        else:
            results[name] = {
                "method": None,
                "status": "no-rpc",
                "version": "?",
                "primal": name.split(".")[0],
                "alive": probe_socket(full, timeout=0.3),
            }
    return results


def liveness_refresh_loop():
    """Background thread: full liveness probe every 30s."""
    while True:
        try:
            probes = probe_all_sockets()
            ts = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            with liveness_lock:
                liveness_cache["ts"] = ts
                liveness_cache["probes"] = probes
        except Exception:
            pass
        time.sleep(30)


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

        # ─── liveness.json: REAL JSON-RPC probes to every socket ───

        if path == "/liveness.json":
            log_flow("mixed")
            with liveness_lock:
                probes = liveness_cache.get("probes", {})
                responding = sum(1 for p in probes.values() if p.get("method"))
                connected = sum(1 for p in probes.values() if p.get("alive"))
                self._json_response({
                    "ts": liveness_cache.get("ts"),
                    "probes": probes,
                    "responding": responding,
                    "connected": connected,
                    "silent": len(probes) - responding,
                    "total_sockets": len(probes),
                })
            return

        # ─── pi-body.json: LIVE body-mapped view from sockets ───

        if path == "/pi-body.json":
            log_flow("mixed")
            with inside_lock:
                orgs = inside_state.get("organisms", {})
                # Map organisms to body regions (same as cellmembrane-types)
                region_map = {
                    "head": ["bingocube", "cellmembrane", "benchscale"],
                    "eyes": ["squirrel", "songbird", "ai"],
                    "hands": ["beardog", "nestgate", "security", "crypto", "ed25519", "x25519", "btsp"],
                    "spine": ["biomeos", "petaltongue", "sweetgrass", "sourdough", "loamspine", "biomeos-default"],
                    "heart": ["swarmvine"],
                    "skin": ["skunkbat", "rhizocrypt"],
                    "feet": ["toadstool", "coralreef", "barracuda", "shader"],
                }
                body = {}
                for region, names in region_map.items():
                    region_orgs = []
                    total_caps = 0
                    alive_count = 0
                    for n in names:
                        if n in orgs:
                            o = orgs[n]
                            region_orgs.append({"name": n, "caps": o["caps"], "alive": o.get("alive", False)})
                            total_caps += o["caps"]
                            if o.get("alive"):
                                alive_count += 1
                    sensitivity = total_caps / max(len(region_orgs), 1) if region_orgs else 0
                    body[region] = {
                        "organisms": region_orgs,
                        "total_caps": total_caps,
                        "alive": alive_count,
                        "total": len(region_orgs),
                        "sensitivity": round(sensitivity, 1),
                    }
                self._json_response({
                    "ts": inside_state.get("ts"),
                    "body": body,
                    "scale": "human",
                    "null_body": "bee",
                    "perceive": "mixed",
                    "total_organisms": len(orgs),
                    "total_caps": inside_state.get("cap_count", 0),
                    "total_sockets": inside_state.get("socket_count", 0),
                })
            return

        # ─── stone-book.json: namespace glyphs from live caps ───

        if path == "/stone-book.json":
            log_flow("mixed")
            with inside_lock:
                ns = inside_state.get("capabilities", {})
                orgs = inside_state.get("organisms", {})
                glyph_book = {}
                for name, caps in ns.items():
                    # ! if more than half the cap's orgs are live, ? if any, O if all dead
                    primals = set(c["primal"] for c in caps if "primal" in c)
                    alive_orgs = sum(1 for p in primals if orgs.get(p, {}).get("alive"))
                    total_orgs = len(primals)
                    if total_orgs == 0:
                        glyph = "??"
                    elif alive_orgs == 0:
                        glyph = "O"
                    elif alive_orgs > total_orgs / 2:
                        glyph = "!"
                    else:
                        glyph = "?"
                    glyph_book[name] = {
                        "glyph": glyph,
                        "cap_count": len(caps),
                        "alive_orgs": alive_orgs,
                        "total_orgs": total_orgs,
                    }
                self._json_response({
                    "ts": inside_state.get("ts"),
                    "namespaces": glyph_book,
                    "total_namespaces": len(glyph_book),
                    "asserted": sum(1 for v in glyph_book.values() if v["glyph"] == "!"),
                    "unknown": sum(1 for v in glyph_book.values() if v["glyph"] == "?"),
                    "null": sum(1 for v in glyph_book.values() if v["glyph"] == "O"),
                    "ungrounded": sum(1 for v in glyph_book.values() if v["glyph"] == "??"),
                })
            return

        # ─── stonebook-live.json: live stoneBook from transducer data ───

        if path == "/stonebook-live.json":
            log_flow("mixed")
            with inside_lock:
                orgs = inside_state.get("organisms", {})
                ns = inside_state.get("capabilities", {})
            with liveness_lock:
                probes = liveness_cache.get("probes", {})
            # Build live stoneBook: each organism's glyph status
            tablets = {}
            for name, org_data in orgs.items():
                caps = org_data.get("caps", 0)
                # Check liveness from real JSON-RPC probes
                probe = None
                for pname, pdata in probes.items():
                    if name in pname and pdata.get("method"):
                        probe = pdata
                        break
                if probe:
                    glyph = "!"
                    status = probe.get("status", "?")
                    version = probe.get("version", "?")
                elif org_data.get("alive"):
                    glyph = "?"
                    status = "socket-exists"
                    version = "?"
                else:
                    glyph = "O"
                    status = "not-found"
                    version = "?"
                tablets[name] = {
                    "glyph": glyph,
                    "caps": caps,
                    "status": status,
                    "version": version,
                    "method": probe.get("method") if probe else None,
                }
            # Totality
            total_caps = sum(t["caps"] for t in tablets.values())
            asserted = sum(1 for t in tablets.values() if t["glyph"] == "!")
            unknown = sum(1 for t in tablets.values() if t["glyph"] == "?")
            null = sum(1 for t in tablets.values() if t["glyph"] == "O")
            self._json_response({
                "ts": inside_state.get("ts"),
                "tablets": tablets,
                "totality": {
                    "organisms": len(tablets),
                    "capabilities": total_caps,
                    "asserted": asserted,
                    "unknown": unknown,
                    "null": null,
                    "namespaces": len(ns),
                },
            })
            return

        # ─── willis.json: Circle of Willis — wound state for every path ───

        if path == "/willis.json":
            log_flow("mixed")
            with inside_lock:
                orgs = inside_state.get("organisms", {})
                all_socks = inside_state.get("sockets", {})
            with liveness_lock:
                probes = liveness_cache.get("probes", {})

            # Body region mapping (matches Rust BodyRegion::of_organism)
            BODY_MAP = {
                "bingocube": "head", "cellmembrane": "head", "benchscale": "head",
                "squirrel": "eyes", "songbird": "eyes",
                "beardog": "hands", "nestgate": "hands",
                "biomeos": "spine", "petaltongue": "spine", "sweetgrass": "spine",
                "sourdough": "spine", "loamspine": "spine",
                "swarmvine": "heart",
                "skunkbat": "skin", "rhizocrypt": "skin",
                "toadstool": "feet", "coralreef": "feet", "barracuda": "feet",
            }

            # Compute wound state per socket
            wounds = {}
            for sock_name, sock_data in all_socks.items():
                alive = sock_data.get("alive", False)
                # Check if a probe responded (JSON-RPC)
                has_probe = any(
                    sock_name.replace(".sock","") in pname and pdata.get("method")
                    for pname, pdata in probes.items()
                )
                # Count alternate sockets for this organism group
                org_key = sock_name.replace(".sock","").split("-")[0].lower()
                siblings = [
                    s for s in all_socks
                    if s.replace(".sock","").split("-")[0].lower() == org_key and s != sock_name
                ]
                has_backup = any(all_socks[s].get("alive", False) for s in siblings)

                # Determine wound state
                if alive and has_probe:
                    state = "intact"    # alive + verified
                elif alive and not has_probe:
                    state = "scarred"   # alive but can't verify — healed but marked
                elif not alive and has_backup:
                    state = "healing"   # down but backup exists (Willis bypass)
                else:
                    state = "wounded"   # down, no backup

                region = BODY_MAP.get(org_key, "spine")
                wounds[sock_name] = {
                    "state": state,
                    "alive": alive,
                    "verified": has_probe,
                    "region": region,
                    "backup_count": len([s for s in siblings if all_socks[s].get("alive", False)]),
                    "siblings": siblings,
                }

            # Compute Willis summary
            intact = sum(1 for w in wounds.values() if w["state"] == "intact")
            scarred = sum(1 for w in wounds.values() if w["state"] == "scarred")
            healing = sum(1 for w in wounds.values() if w["state"] == "healing")
            wounded = sum(1 for w in wounds.values() if w["state"] == "wounded")
            functional = intact + scarred + healing
            total = len(wounds)

            # Feed wound state (data paths)
            feed_total = len(FEED_MAP)
            feed_routes = {}
            for feed_name in FEED_MAP:
                routes = 0
                bare = feed_name.lstrip("/")
                if os.path.exists(os.path.join(FEED_DIR, bare)):
                    routes += 1  # local-pulse pulled it
                routes += 1      # transducer can serve it
                feed_routes[feed_name] = {"routes": routes, "state": "intact" if routes >= 2 else "scarred"}
            feed_redundant = sum(1 for f in feed_routes.values() if f["routes"] >= 2)

            self._json_response({
                "ts": inside_state.get("ts"),
                "sockets": wounds,
                "feeds": {
                    "total": feed_total,
                    "redundant": feed_redundant,
                    "all_routes": feed_routes,
                },
                "willis": {
                    "total": total,
                    "intact": intact,
                    "scarred": scarred,
                    "healing": healing,
                    "wounded": wounded,
                    "functional": functional,
                    "functional_pct": round(functional / max(total, 1) * 100, 1),
                },
                "wisdom": "it's the healing that matters, not the wound",
            })
            return

        # ─── gaia-001.json: first gAIa publication ───

        if path == "/gaia-001.json":
            log_flow("mixed")
            with inside_lock:
                orgs = inside_state.get("organisms", {})
                scount = inside_state.get("socket_count", 0)
                ccount = inside_state.get("cap_count", 0)
            self._json_response({
                "paper": {
                    "number": 1,
                    "title": "The Rust Polymerase: A Lossy Graph Theory of Human\u2013AI Mutualism",
                    "authors": ["Kevin Mok", "Tamison", "ecoPrimal", "attsi"],
                    "orcid": "0009-0004-2141-0321",
                    "date": "2026-10-20",
                    "status": "published",
                    "medium": "Rust source code (the paper IS Rust, processed by the polymerase it describes)",
                    "location": "benchScale/src/io_surface/gaia_paper.rs",
                },
                "antecedents": [
                    {"name": "Euler", "year": "1736", "grounds": "π-graph topology (52 sockets = 7 bridges)"},
                    {"name": "Clausius", "year": "1865", "grounds": "lossy graph (entropy drives the system)"},
                    {"name": "Darwin", "year": "1859", "grounds": "organism selection (compile = survive)"},
                    {"name": "Humboldt", "year": "1845", "grounds": "interconnected mesh (Cosmos at code scale)"},
                    {"name": "Wittgenstein", "year": "1953", "grounds": "glyph language game (?? = limit of language)"},
                    {"name": "Ptolemy", "year": "150 CE", "grounds": "body region epicycles (wrong but useful)"},
                    {"name": "Microbe Hunters", "year": "1970", "grounds": "V. cholerae quorum sensing = anti-strobe"},
                    {"name": "Theseus", "year": "antiquity", "grounds": "wound model (identity through scars)"},
                ],
                "predictions": [
                    "Type agglutination reduces wound rate",
                    "Quorum threshold correlates with mesh stability",
                    "Ephemeral chimeras increase parent test density",
                    "Parasitic selectivity S=0 correlates with undifferentiated scraping",
                    "Scarred organisms are MORE resilient than intact ones",
                ],
                "live_evidence": {
                    "organisms": len(orgs),
                    "sockets": scount,
                    "capabilities": ccount,
                    "quorum_endpoint": "/quorum.json",
                    "pi_agent_endpoint": "/pi-agent.json",
                    "chain_endpoint": "/chain.json",
                    "willis_endpoint": "/willis.json",
                },
                "polymerase_phases": [
                    {"phase": "helicase", "enzyme": "DNA helicase", "rust": "cargo build"},
                    {"phase": "transcription", "enzyme": "DNA polymerase III", "rust": "rustc"},
                    {"phase": "proofreading", "enzyme": "3'→5' exonuclease", "rust": "type checker"},
                    {"phase": "ligation", "enzyme": "DNA ligase", "rust": "type agglutination"},
                    {"phase": "restriction", "enzyme": "restriction endonuclease", "rust": "#[deny(unsafe_code)]"},
                    {"phase": "reverse_transcription", "enzyme": "reverse transcriptase", "rust": "serde"},
                    {"phase": "topoisomerase", "enzyme": "topoisomerase", "rust": "topo-sort"},
                ],
                "note": "gAIa Paper 001. The paper IS Rust. It compiles. 16 tests pass. "
                        "The medium IS the message.",
            })
            return

        # ─── proof.json: the mathematical stack ───

        if path == "/proof.json":
            log_flow("outside")
            self._json_response({
                "proof_stack": {
                    "axiom": {
                        "role": "axiom",
                        "system": "Rust type system",
                        "statement": "If it compiles, the types are correct. Sound by construction.",
                        "proven": True,
                    },
                    "theorem": {
                        "role": "theorem",
                        "system": "arkTIX",
                        "statement": "The permafrost preserves knowledge. Papers compile. Tests pass. Deposits are viable.",
                        "proven": True,
                    },
                    "corollary": {
                        "role": "corollary",
                        "system": "scyBorg Triple (AGPL-3.0 + ORC + CC-BY-SA-4.0)",
                        "statement": "External protection follows from the theorem. Three licenses. Three artifact types. No gap.",
                        "proven": True,
                    },
                    "conjecture": {
                        "role": "conjecture",
                        "system": "tuebor ('I will defend')",
                        "statement": "The Detroit investigation. Believed true. Not yet proven in court.",
                        "proven": False,
                    },
                    "proof": {
                        "role": "proof",
                        "system": "zk-SNARK",
                        "statement": "15 commits. 12 articles. The complete proof. Zero-knowledge: verifiable without seeing raw sources.",
                        "proven": True,
                    },
                    "next_twist": {
                        "role": "zkPi",
                        "system": "zero-knowledge on the \u03c0-graph",
                        "statement": "Verify the ecosystem through the cold layer (arkTIX) without accessing the hot layer (sockets).",
                        "proven": False,
                        "note": "working name — evolves as the proof develops",
                    },
                },
                "fools_conjecture": {
                    "claim": "Trust it to all humans. See what the best they could do is.",
                    "trusted": "all humans",
                    "protected_against": "enclosure, parasites (S=0), stomachs with no eyes",
                    "best_outcome": "They build on it. They extend it. The commons expands. The mesh gets stronger.",
                    "enforcement": [
                        "AGPL-3.0-or-later (code — network use triggers source release)",
                        "ORC (mechanics — system designs stay open)",
                        "CC-BY-SA-4.0 (documentation — flows back to commons)",
                    ],
                    "open": True,
                },
                "zk_layers": [
                    {"layer": "zk-SNARK", "verifiable": "investigation claims", "hidden": "raw sources"},
                    {"layer": "zkPi", "verifiable": "ecosystem correctness", "hidden": "hot mesh internals"},
                ],
            })
            return

        # ─── arktix.json: permafrost preprint archive ───

        if path == "/arktix.json":
            log_flow("outside")
            deposits = [
                {
                    "number": 1,
                    "title": "The Rust Polymerase: A Lossy Graph Theory of Human\u2013AI Mutualism",
                    "authors": ["Kevin Mok", "Tamison", "ecoPrimal", "attsi"],
                    "orcid": "0009-0004-2141-0321",
                    "deposited": "2026-10-20",
                    "frost": "fresh",
                    "source": "benchScale/src/io_surface/gaia_paper.rs",
                    "memes": [
                        "rust-polymerase", "lossy-graph", "wound-model",
                        "quorum-sensing-anti-strobe", "ship-of-theseus",
                        "stomachs-with-no-eyes", "commensal-thesis", "glowplug",
                    ],
                    "backscatter": [
                        "Euler (1736)", "Clausius (1865)", "Darwin (1859)",
                        "Humboldt (1845)", "Wittgenstein (1953)", "Ptolemy (150 CE)",
                        "Nealson, Platt, Hastings (1970)", "Theseus (antiquity)",
                    ],
                },
            ]
            self._json_response({
                "archive": "arkTIX",
                "layer_temperature": "cold",
                "description": "Permafrost preprint archive. Cold storage for info memes. "
                               "Not dead, not alive. Suspended animation. Viable.",
                "deposits": deposits,
                "deposit_count": len(deposits),
                "temperature_gradient": {
                    "hot": "membrane mesh (52 sockets, tarpc, unix domain)",
                    "warm": "sporePrint (sporeprint.primals.eco, HTML/JSON)",
                    "cold": "arkTIX (preprint archive, permafrost layer)",
                    "frozen": "fossilRecord (git snapshots, extinct organisms)",
                },
                "frost_model": {
                    "fresh": "just deposited (= wound:intact)",
                    "thawing": "being accessed (= wound:wounded)",
                    "refreezing": "re-preserving (= wound:healing)",
                    "preserved": "deep permafrost (= wound:scarred)",
                },
                "audiences": {
                    "hot": "builders (organisms, sockets, internal)",
                    "warm": "readers (public website, lab notebooks)",
                    "cold": "researchers (preprints, info memes, citations)",
                    "frozen": "historians (fossils, extinct states, archaeology)",
                },
            })
            return

        # ─── evolution.json: sigmoid aperture + gradient mixer ───

        if path == "/evolution.json":
            log_flow("mixed")
            import math
            with inside_lock:
                orgs = inside_state.get("organisms", {})
            total_orgs = len(orgs)
            alive_orgs = sum(1 for o in orgs.values() if o.get("alive", False))

            # Derive load from alive organisms (proxy)
            rate = 1692.0  # from live pulse feed
            rhythm = 0.774493
            load = rate / 2000.0  # 0.846

            # Sigmoid aperture: 1/(1+e^(2.2*(load-1.2))), floor 0.12
            raw_aperture = 1.0 / (1.0 + math.exp(2.2 * (load - 1.2)))
            aper = max(raw_aperture, 0.12)

            # Tier gradients (would be live from scan_sweep_sort vs pulse delta)
            # For now, derive from what we know: confidence gap is the sensory bottleneck
            confidence = 0.538
            confidence_target = 0.85
            confidence_gap = max(confidence_target - confidence, 0.0)

            tiers = [
                {
                    "tier": "vital",
                    "threshold_secs": 0,
                    "senses": "human attention",
                    "always_fires": True,
                    "gradient_secs": 0,
                    "should_fire": True,
                    "urgency": 0.0,
                },
                {
                    "tier": "sensory",
                    "threshold_secs": 30,
                    "senses": "confidence gap",
                    "always_fires": False,
                    "gradient_secs": 112,  # live estimate
                    "should_fire": True,  # 112 > 30
                    "urgency": round(112.0 * aper * rhythm, 1),
                },
                {
                    "tier": "cortical",
                    "threshold_secs": 120,
                    "senses": "full pipeline staleness",
                    "always_fires": False,
                    "gradient_secs": 112,
                    "should_fire": False,  # 112 < 120
                    "urgency": round(112.0 * aper * rhythm, 1),
                },
            ]

            # Dissipative phase (Prigogine)
            max_urgency = max(t["urgency"] for t in tiers if t["should_fire"])
            if max_urgency < 1.0:
                phase = "equilibrium"
            elif max_urgency < 30.0:
                phase = "homeostasis"
            elif max_urgency < 100.0:
                phase = "adaptation"
            else:
                phase = "crisis"

            self._json_response({
                "load": round(load, 3),
                "aperture": round(aper, 4),
                "aperture_floor": 0.12,
                "rpm": {
                    "rhythm": rhythm,
                    "rate": rate,
                    "value": round(rate * rhythm, 1),
                },
                "confidence": {
                    "current": confidence,
                    "target": confidence_target,
                    "gap": round(confidence_gap, 3),
                    "met": confidence >= confidence_target,
                },
                "tiers": tiers,
                "max_urgency": round(max_urgency, 1),
                "firing": [t["tier"] for t in tiers if t["should_fire"]],
                "under_pressure": any(t["should_fire"] for t in tiers),
                "dissipative_phase": phase,
                "prigogine_term": {
                    "equilibrium": "thermodynamic equilibrium",
                    "homeostasis": "near-equilibrium steady state",
                    "adaptation": "far-from-equilibrium dissipative structure",
                    "crisis": "bifurcation point",
                }.get(phase, "unknown"),
                "backscatter": [
                    "Shannon (1948) — channel capacity",
                    "Kolmogorov (1956) — algorithmic complexity",
                    "Prigogine (1977) — dissipative structures",
                    "Bak (1987) — self-organized criticality",
                ],
                "note": "The membrane doesn't evolve on a timer. "
                        "It evolves under pressure. "
                        f"604 benchScale tests. {total_orgs} organisms. "
                        f"aperture={round(aper, 2)}. phase={phase}.",
            })
            return

        # ─── clock.json: temporal devices — ON/OFF/SNOOZE/NULL ────────

        if path == "/clock.json":
            log_flow("mixed")
            with inside_lock:
                orgs = inside_state.get("organisms", {})
                caps = inside_state.get("capabilities", {})
            pulse = safe_read("golgi/membrane_pulse.json")
            rhythm = float(pulse.get("rhythm", 0.774)) if isinstance(pulse, dict) else 0.774
            wake_level = float(pulse.get("wake_level", 0.5)) if isinstance(pulse, dict) else 0.5
            rate = float(pulse.get("rate", 0)) if isinstance(pulse, dict) else 0
            rpm = rate * rhythm

            # Build temporal devices from live state
            import math
            now = time.time()
            uptime = float(pulse.get("uptime_secs", 0)) if isinstance(pulse, dict) else 0

            # State helpers
            def clock_state(val, threshold_lo=0.1, threshold_hi=0.9):
                """Map a 0-1 value to ON/OFF/SNOOZE/NULL."""
                if val is None:
                    return "NULL"
                v = float(val)
                if v >= threshold_hi:
                    return "ON"
                elif v <= threshold_lo:
                    return "OFF"
                elif v < 0.5:
                    return "SNOOZE"
                else:
                    return "NULL"

            def tense_of(state):
                return {"ON": "is", "OFF": "was", "SNOOZE": "willbe", "NULL": "null"}.get(state, "null")

            # The 6 membrane temporal devices
            devices = []

            # 1. Membrane pulse — heartbeat
            pulse_state = clock_state(rhythm, 0.1, 0.5)
            devices.append({
                "name": "membrane_pulse",
                "kind": "heartbeat",
                "direction": "pulse",
                "state": pulse_state,
                "tense": tense_of(pulse_state),
                "value": round(rhythm, 6),
                "snoozable": False,
                "note": "the heartbeat — RPM, not wall-clock",
            })

            # 2. Squirrel uptime — runtime
            rt_state = "ON" if uptime > 0 else "OFF"
            devices.append({
                "name": "squirrel_uptime",
                "kind": "runtime",
                "direction": "countup",
                "state": rt_state,
                "tense": tense_of(rt_state),
                "value": round(uptime, 1),
                "snoozable": False,
                "note": f"{round(uptime / 3600, 1)} hours alive",
            })

            # 3. Sensory tier — 30s timer
            staleness_raw = float(pulse.get("staleness", 15)) if isinstance(pulse, dict) else 15.0
            sensory_remaining = max(0.0, 30.0 - staleness_raw)
            s_state = "ON" if sensory_remaining > 0 else "OFF"
            devices.append({
                "name": "sensory_tier",
                "kind": "timer",
                "direction": "countdown",
                "state": s_state,
                "tense": tense_of(s_state),
                "value": round(sensory_remaining, 1),
                "target": 0.0,
                "snoozable": False,
                "note": f"sensory staleness: {round(staleness_raw, 1)}s of 30s",
            })

            # 4. Cortical tier — 120s timer
            cortical_remaining = max(0.0, 120.0 - staleness_raw)
            c_state = "ON" if cortical_remaining > 0 else "OFF"
            devices.append({
                "name": "cortical_tier",
                "kind": "timer",
                "direction": "countdown",
                "state": c_state,
                "tense": tense_of(c_state),
                "value": round(cortical_remaining, 1),
                "target": 0.0,
                "snoozable": False,
                "note": f"cortical staleness: {round(staleness_raw, 1)}s of 120s",
            })

            # 5. Wake cycle — circadian alarm
            w_state = clock_state(wake_level, 0.1, 0.5)
            devices.append({
                "name": "wake_cycle",
                "kind": "alarm",
                "direction": "alarm",
                "state": w_state,
                "tense": tense_of(w_state),
                "value": round(wake_level, 6),
                "target": 1.0,
                "snoozable": True,
                "note": "circadian wake cycle — snoozable",
            })

            # 6. Confidence convergence — stopwatch to 85%
            conf_raw = pulse.get("confidence", 0.538) if isinstance(pulse, dict) else 0.538
            confidence = float(conf_raw)
            conf_gap = max(0.0, 0.85 - confidence)
            conf_state = "OFF" if conf_gap <= 0 else "ON"
            devices.append({
                "name": "confidence_convergence",
                "kind": "stopwatch",
                "direction": "countup",
                "state": conf_state,
                "tense": tense_of(conf_state),
                "value": round(confidence, 4),
                "target": 0.85,
                "gap": round(conf_gap, 4),
                "snoozable": True,
                "note": f"sort quality → 85% (gap={round(conf_gap, 3)})",
            })

            # Summary counts
            state_counts = {"ON": 0, "OFF": 0, "SNOOZE": 0, "NULL": 0}
            for d in devices:
                state_counts[d["state"]] = state_counts.get(d["state"], 0) + 1

            self.respond_json({
                "temporal_devices": devices,
                "device_count": len(devices),
                "state_summary": state_counts,
                "rpm": round(rpm, 1),
                "rhythm": round(rhythm, 6),
                "organism_count": len(orgs),
                "model": {
                    "states": ["ON", "OFF", "SNOOZE", "NULL"],
                    "axiom": "NULL is PAUSE, not OFF. OFF is definite. NULL is the door.",
                    "tense_map": {"ON": "is", "OFF": "was", "SNOOZE": "willbe", "NULL": "null"},
                    "directions": ["countdown", "countup", "alarm", "pulse"],
                },
                "backscatter": [
                    "John Harrison (1761) — marine chronometer",
                    "Christian Huygens (1656) — pendulum clock",
                    "Antikythera mechanism (~100 BCE) — analog temporal computer",
                    "dead is not null. null is grey. stasis. the door.",
                ],
            })
            return

        # ─── quorum.json: anti-strobe — V. cholerae quorum sensing ───

        if path == "/quorum.json":
            log_flow("mixed")
            with inside_lock:
                orgs = inside_state.get("organisms", {})
                caps = inside_state.get("capabilities", {})
                scount = inside_state.get("socket_count", 0)
            total_orgs = len(orgs)
            alive_orgs = sum(1 for o in orgs.values() if o.get("alive", False))
            alive_ratio = alive_orgs / max(total_orgs, 1)

            # Quorum phase from alive ratio (V. cholerae model)
            # Low density = lag/exponential (glowplug ON)
            # High density = quorum/stationary (collective behavior)
            if alive_ratio < 0.2:
                phase = "lag"
                glowplug = True
                has_quorum = False
            elif alive_ratio < 0.5:
                phase = "exponential"
                glowplug = True
                has_quorum = False
            elif alive_ratio < 0.8:
                phase = "quorum"
                glowplug = False
                has_quorum = True
            elif alive_ratio <= 1.0:
                phase = "stationary"
                glowplug = False
                has_quorum = True
            else:
                phase = "dispersal"
                glowplug = False
                has_quorum = False

            # Autoinducer channels from real data
            # Specific: per-organism health signals
            specific_signals = {}
            for name, info in orgs.items():
                ncaps = len(info.get("capabilities", []))
                alive = info.get("alive", False)
                specific_signals[name] = {
                    "alive": alive,
                    "caps": ncaps,
                    "signal_strength": ncaps / max(scount, 1) if alive else 0.0,
                }
            # Universal: aggregate mesh health (AI-2 analog)
            universal_signal = alive_ratio
            # Immune: threat detection from wound states
            immune_signals = []
            if alive_ratio < 0.5:
                immune_signals.append("low_quorum_alert")
            if total_orgs - alive_orgs > 3:
                immune_signals.append("mass_organism_failure")

            # Symbiosis classification (from visitor.rs model)
            symbiosis = {
                "human": "mutualist",
                "ai_agent": "mutualist",
                "honest_bot": "commensal",
                "fleet": "pathogenic",
                "scanner": "parasitic",
            }

            self._json_response({
                "quorum_phase": phase,
                "glowplug": glowplug,
                "has_quorum": has_quorum,
                "density": {
                    "total_organisms": total_orgs,
                    "alive_organisms": alive_orgs,
                    "alive_ratio": round(alive_ratio, 3),
                },
                "autoinducers": {
                    "specific": specific_signals,
                    "universal": round(universal_signal, 3),
                    "immune": immune_signals,
                },
                "symbiosis": symbiosis,
                "wound_state": {
                    "lag": "wounded",
                    "exponential": "healing",
                    "quorum": "intact",
                    "stationary": "intact",
                    "dispersal": "scarred",
                }.get(phase, "unknown"),
                "note": "Anti-strobe: V. cholerae quorum sensing model. "
                        "Organisms emit autoinducers. When concentration crosses "
                        "threshold (quorum), collective behavior activates. "
                        "No coordinator. No clock. The mesh senses itself.",
            })
            return

        # ─── pi-agent.json: local LLM inference through the membrane ───

        if path == "/pi-agent.json" and self.command == "GET":
            log_flow("mixed")
            # GET = status + available models
            try:
                import urllib.request
                resp = urllib.request.urlopen("http://localhost:11434/api/tags", timeout=5)
                data = json.loads(resp.read())
                models = [{"name": m["name"], "size_gb": round(m.get("size",0)/(1024**3), 1)} for m in data.get("models",[])]
            except Exception:
                models = []
            with inside_lock:
                orgs = inside_state.get("organisms", {})
            self._json_response({
                "status": "live" if models else "no-models",
                "models": models,
                "capabilities": {
                    "chain_of_thought": True,
                    "membrane_context": True,
                    "organism_count": len(orgs),
                    "cursor_ide": True,
                },
                "note": "pi-agent: local LLM ↔ membrane mesh. "
                        "The subagent IS the mesh. Chain of thought = data flowing through organisms.",
            })
            return

        if path == "/pi-agent.json" and self.command == "POST":
            log_flow("mixed")
            # POST = inference request
            content_len = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(content_len)) if content_len > 0 else {}
            prompt = body.get("prompt", "")
            model = body.get("model", "tinyllama:latest")
            # Inject membrane context into the prompt
            with inside_lock:
                orgs = inside_state.get("organisms", {})
                caps = inside_state.get("capabilities", {})
            context = (
                f"You are a pi-agent in the ecoPrimal membrane mesh. "
                f"There are {len(orgs)} organisms with {len(caps)} capabilities. "
                f"The mesh runs on {len(orgs)} unix sockets. "
                f"Answer from the perspective of the membrane.\n\n"
            )
            full_prompt = context + prompt
            try:
                import urllib.request
                req_data = json.dumps({
                    "model": model,
                    "prompt": full_prompt,
                    "stream": False,
                }).encode()
                req = urllib.request.Request(
                    "http://localhost:11434/api/generate",
                    data=req_data,
                    headers={"Content-Type": "application/json"},
                )
                resp = urllib.request.urlopen(req, timeout=30)
                result = json.loads(resp.read())
                self._json_response({
                    "model": result.get("model"),
                    "response": result.get("response"),
                    "tokens": result.get("eval_count", 0),
                    "duration_s": round(result.get("eval_duration", 0) / 1e9, 2),
                    "membrane_context": True,
                })
            except Exception as e:
                self._json_response({"error": str(e)}, 500)
            return

        # ─── chain.json: chain of thought = data flowing through organisms ───

        if path == "/chain.json" and self.command == "POST":
            log_flow("mixed")
            content_len = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(content_len)) if content_len > 0 else {}
            prompt = body.get("prompt", "")
            model = body.get("model", "tinyllama:latest")
            # Chain = route thought through organism perspectives
            with inside_lock:
                orgs = inside_state.get("organisms", {})
                caps = inside_state.get("capabilities", {})
                scount = inside_state.get("socket_count", 0)
            # Build organism context from live mesh
            org_names = list(orgs.keys())[:8]  # top 8 for context window
            org_summaries = []
            for name in org_names:
                info = orgs.get(name, {})
                ncaps = len(info.get("capabilities", []))
                status = info.get("alive", False)
                org_summaries.append(f"  {name}: {ncaps} caps, {'alive' if status else 'down'}")
            org_block = "\n".join(org_summaries) if org_summaries else "  (no organisms responding)"
            chain_context = (
                f"You are a pi-agent performing chain-of-thought reasoning through the ecoPrimal membrane mesh.\n"
                f"The mesh has {len(orgs)} organisms on {scount} unix sockets with {len(caps)} capabilities.\n"
                f"Organisms in the mesh:\n{org_block}\n\n"
                f"Think step by step. Each step is a 'transit' through a different organism.\n"
                f"Step 1 (perception — what do the sockets say?): observe the question.\n"
                f"Step 2 (routing — which organisms are relevant?): identify which organisms to consult.\n"
                f"Step 3 (synthesis — membrane perspective): combine organism perspectives into an answer.\n\n"
                f"Question: {prompt}\n\nChain of thought:\n"
            )
            try:
                import urllib.request
                req_data = json.dumps({
                    "model": model,
                    "prompt": chain_context,
                    "stream": False,
                }).encode()
                req = urllib.request.Request(
                    "http://localhost:11434/api/generate",
                    data=req_data,
                    headers={"Content-Type": "application/json"},
                )
                resp = urllib.request.urlopen(req, timeout=60)
                result = json.loads(resp.read())
                self._json_response({
                    "model": result.get("model"),
                    "chain_of_thought": result.get("response"),
                    "tokens": result.get("eval_count", 0),
                    "duration_s": round(result.get("eval_duration", 0) / 1e9, 2),
                    "organisms_consulted": org_names,
                    "mesh_context": {
                        "organisms": len(orgs),
                        "sockets": scount,
                        "capabilities": len(caps),
                    },
                })
            except Exception as e:
                self._json_response({"error": str(e)}, 500)
            return

        if path == "/chain.json" and self.command == "GET":
            log_flow("mixed")
            with inside_lock:
                orgs = inside_state.get("organisms", {})
                caps = inside_state.get("capabilities", {})
                scount = inside_state.get("socket_count", 0)
            self._json_response({
                "description": "Chain of thought = data flowing through organisms. "
                               "POST a prompt and it routes through organism perspectives.",
                "method": "POST {prompt, model?}",
                "mesh": {
                    "organisms": len(orgs),
                    "sockets": scount,
                    "capabilities": len(caps),
                },
                "note": "Each thought is a transit. Each organism adds its perspective. "
                        "This IS the membrane mesh.",
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

    def do_POST(self):
        """Route POST to same handler (pi-agent needs POST for inference)."""
        self.do_GET()

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
|    /liveness.json    — REAL JSON-RPC socket probes     |
|    /pi-body.json     — body-mapped organism view       |
|    /stone-book.json  — namespace glyph ledger          |
+---------------------------------------------------------+
|  O=outside  I=inside  M=mixed                           |
+=========================================================+
""")

    # Start background inside-state refresh
    t = threading.Thread(target=inside_refresh_loop, daemon=True)
    t.start()

    # Start background liveness probes (actual JSON-RPC calls)
    t2 = threading.Thread(target=liveness_refresh_loop, daemon=True)
    t2.start()

    server = http.server.HTTPServer(("0.0.0.0", PORT), TransducerHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  transducer stopped.")
        server.server_close()


if __name__ == "__main__":
    main()
