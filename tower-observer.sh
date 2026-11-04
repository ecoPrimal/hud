#!/usr/bin/env bash
# tower-observer.sh — polls membrane tower organ health, announces to chipMonk
# Runs every minute via cron. Gives chipMonk REFLECT over its own body.
#
# Each organ checked via its native protocol:
#   bearDog:    JSON-RPC over Unix socket (/run/membrane/beardog-health.sock)
#   loamSpine:  JSON-RPC over Unix socket (/run/membrane/loamspine.sock)
#   rhizoCrypt: JSON-RPC over Unix socket (/run/membrane/rhizocrypt.sock)
#   nestGate:   JSON-RPC over Unix socket (/run/membrane/nestgate.sock)
#   songBird:   JSON-RPC over HTTP (127.0.0.1:7780/status)
#   sweetGrass: plain JSON over HTTP (127.0.0.1:42725/health)
#   swarmVine:  socket existence check (gRPC/gossip protocol)
#   barraCuda:  process existence check

set -euo pipefail

SQUIRREL_SOCK="/run/membrane/squirrel.sock"
OUT="/opt/ecoPrimals/hud/site/public/tower.json"
STATE="/var/lib/membrane/tower-state.json"

now=$(date +%s)
ts=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

alive=0
total=0
organs_json="{"

# --- Helper: check Unix socket with JSON-RPC health ---
check_socket_health() {
    local name="$1"
    local sock="$2"
    local result
    result=$(python3 -c "
import socket, json, sys
s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
try:
    s.settimeout(2)
    s.connect('$sock')
    s.sendall(json.dumps({'jsonrpc':'2.0','method':'health','id':1}).encode() + b'\n')
    data = s.recv(4096).decode()
    d = json.loads(data)
    r = d.get('result', {})
    print(json.dumps({
        'status': r.get('status', 'unknown'),
        'version': r.get('version', 'unknown'),
        'uptime_s': r.get('uptime_s', -1),
        'alive': True
    }))
except Exception as e:
    print(json.dumps({'status': 'unreachable', 'error': str(e), 'alive': False}))
finally:
    s.close()
" 2>/dev/null)
    echo "$result"
}

# --- Helper: check HTTP health ---
check_http_health() {
    local name="$1"
    local url="$2"
    local result
    result=$(curl -s --max-time 2 "$url" 2>/dev/null)
    if [ $? -eq 0 ] && [ -n "$result" ]; then
        # Parse JSON response
        python3 -c "
import json, sys
try:
    d = json.loads('''$result''')
    r = d.get('result', d)  # JSON-RPC wraps in result, plain JSON doesn't
    print(json.dumps({
        'status': r.get('status', 'unknown'),
        'version': r.get('version', 'unknown'),
        'uptime_s': r.get('uptime_s', r.get('uptime_secs', -1)),
        'alive': True
    }))
except:
    print(json.dumps({'status': 'parse_error', 'alive': False}))
" 2>/dev/null
    else
        echo '{"status": "unreachable", "alive": false}'
    fi
}

# --- Helper: check process existence ---
check_process() {
    local name="$1"
    if pgrep -f "$name" >/dev/null 2>&1; then
        echo '{"status": "running", "alive": true}'
    else
        echo '{"status": "not_running", "alive": false}'
    fi
}

# --- Poll each organ ---
declare -A organ_results

# Socket-based organs
for pair in "bearDog:/run/membrane/beardog-health.sock" \
            "loamSpine:/run/membrane/loamspine.sock" \
            "rhizoCrypt:/run/membrane/rhizocrypt.sock" \
            "nestGate:/run/membrane/nestgate.sock"; do
    name="${pair%%:*}"
    sock="${pair##*:}"
    organ_results[$name]=$(check_socket_health "$name" "$sock")
    total=$((total + 1))
    is_alive=$(echo "${organ_results[$name]}" | python3 -c "import json,sys; print(json.loads(sys.stdin.read()).get('alive',False))" 2>/dev/null)
    [ "$is_alive" = "True" ] && alive=$((alive + 1))
done

# HTTP-based organs
organ_results[songBird]=$(check_http_health "songBird" "http://127.0.0.1:7780/status")
total=$((total + 1))
is_alive=$(echo "${organ_results[songBird]}" | python3 -c "import json,sys; print(json.loads(sys.stdin.read()).get('alive',False))" 2>/dev/null)
[ "$is_alive" = "True" ] && alive=$((alive + 1))

organ_results[sweetGrass]=$(check_http_health "sweetGrass" "http://127.0.0.1:42725/health")
total=$((total + 1))
is_alive=$(echo "${organ_results[sweetGrass]}" | python3 -c "import json,sys; print(json.loads(sys.stdin.read()).get('alive',False))" 2>/dev/null)
[ "$is_alive" = "True" ] && alive=$((alive + 1))

# Socket existence check (swarmVine uses gossip protocol, not JSON-RPC)
if [ -S /run/membrane/swarmvine.sock ]; then
    organ_results[swarmVine]='{"status": "socket_present", "alive": true}'
    alive=$((alive + 1))
else
    organ_results[swarmVine]='{"status": "no_socket", "alive": false}'
fi
total=$((total + 1))

# Process check (barraCuda runs without systemd)
organ_results[barraCuda]=$(check_process "barracuda")
total=$((total + 1))
is_alive=$(echo "${organ_results[barraCuda]}" | python3 -c "import json,sys; print(json.loads(sys.stdin.read()).get('alive',False))" 2>/dev/null)
[ "$is_alive" = "True" ] && alive=$((alive + 1))

# --- Also check the application-layer organs ---
# skunkBat
organ_results[skunkBat]=$(check_http_health "skunkBat" "http://127.0.0.1:9750/health")
if [ "$(echo "${organ_results[skunkBat]}" | python3 -c "import json,sys; print(json.loads(sys.stdin.read()).get('alive',False))" 2>/dev/null)" != "True" ]; then
    # Try process check as fallback
    organ_results[skunkBat]=$(check_process "skunkbat")
fi
total=$((total + 1))
is_alive=$(echo "${organ_results[skunkBat]}" | python3 -c "import json,sys; print(json.loads(sys.stdin.read()).get('alive',False))" 2>/dev/null)
[ "$is_alive" = "True" ] && alive=$((alive + 1))

# petalTongue
organ_results[petalTongue]=$(check_process "petaltongue")
total=$((total + 1))
is_alive=$(echo "${organ_results[petalTongue]}" | python3 -c "import json,sys; print(json.loads(sys.stdin.read()).get('alive',False))" 2>/dev/null)
[ "$is_alive" = "True" ] && alive=$((alive + 1))

# squirrel
if [ -S "$SQUIRREL_SOCK" ]; then
    organ_results[squirrel]=$(check_socket_health "squirrel" "$SQUIRREL_SOCK")
else
    organ_results[squirrel]='{"status": "no_socket", "alive": false}'
fi
total=$((total + 1))
is_alive=$(echo "${organ_results[squirrel]}" | python3 -c "import json,sys; print(json.loads(sys.stdin.read()).get('alive',False))" 2>/dev/null)
[ "$is_alive" = "True" ] && alive=$((alive + 1))

# --- Build tower.json ---
python3 -c "
import json, sys, os

organs = {}
pairs = [
$(for name in "${!organ_results[@]}"; do
    echo "    ('$name', '''${organ_results[$name]}'''),"
done)
]

for name, raw in pairs:
    try:
        organs[name] = json.loads(raw)
    except:
        organs[name] = {'status': 'parse_error', 'alive': False}

alive = sum(1 for o in organs.values() if o.get('alive'))
total = len(organs)

tower = {
    'timestamp': '$ts',
    'epoch': $now,
    'alive': alive,
    'total': total,
    'ratio': round(alive / total, 4) if total > 0 else 0,
    'organs': organs,
    'tense': {
        'self': {
            'was': 'pass 1: thought 5 alive',
            'is': f'{alive}/{total} organs responding',
            'will_be': '[null]'
        }
    }
}

# Write tower.json
with open('$OUT', 'w') as f:
    json.dump(tower, f, indent=2)
    f.write('\n')

# Persist state
state_path = '$STATE'
try:
    state = json.loads(open(state_path).read())
except:
    state = {'history': []}

state['history'].append({
    'epoch': $now,
    'alive': alive,
    'total': total
})
# Keep last 24h only
cutoff = $now - 86400
state['history'] = [h for h in state['history'] if h['epoch'] > cutoff]
state['latest'] = tower

with open(state_path, 'w') as f:
    json.dump(state, f, indent=2)
    f.write('\n')

print(json.dumps({'alive': alive, 'total': total, 'ratio': tower['ratio']}))
" 2>/dev/null

# --- Announce to squirrel ---
if [ -S "$SQUIRREL_SOCK" ]; then
    python3 -c "
import socket, json

announce = {
    'jsonrpc': '2.0',
    'method': 'capabilities.announce',
    'params': {
        'primal': 'tower-observer',
        'socket_path': '/opt/membrane/tower-observer.sh',
        'capabilities': ['membrane.tower', 'membrane.organ_health'],
        'metadata': {
            'alive': $alive,
            'total': $total,
            'ratio': round($alive / $total, 4) if $total > 0 else 0,
            'observer_type': 'tower_health',
            'poll_interval_s': 60
        }
    },
    'id': 'tower-obs-$now'
}

s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
try:
    s.settimeout(2)
    s.connect('$SQUIRREL_SOCK')
    s.sendall(json.dumps(announce).encode() + b'\n')
    resp = s.recv(4096).decode()
except:
    pass
finally:
    s.close()
" 2>/dev/null
fi
