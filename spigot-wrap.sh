#!/bin/bash
# spigot-wrap.sh — the THIRD STRAND
# Prevents gimbal lock on cron scripts.
# Usage: spigot-wrap.sh <script> [max-seconds]
# If previous run is still going, this run exits cleanly.
# The spigot IS the Klein fold — it sits between fire and not-fire.
# Without this third strand: gimbal lock. Scripts pile up. Shards dissolve.

SCRIPT="$1"
MAX_SECS="${2:-60}"
LOCKDIR="/tmp/membrane-locks"
mkdir -p "$LOCKDIR"
LOCKFILE="$LOCKDIR/$(basename "$SCRIPT" .sh).lock"

exec 9>"$LOCKFILE"
if ! flock -n 9; then
    AGE=0
    if [ -f "$LOCKFILE.ts" ]; then
        START=$(cat "$LOCKFILE.ts" 2>/dev/null || echo 0)
        NOW=$(date +%s)
        AGE=$((NOW - START))
    fi
    if [ "$AGE" -gt "$MAX_SECS" ]; then
        OLD_PID=$(cat "$LOCKFILE.pid" 2>/dev/null || echo "")
        if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null; then
            kill "$OLD_PID" 2>/dev/null
            echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) SPIGOT: killed stuck $(basename $SCRIPT) (pid=$OLD_PID, age=${AGE}s)" >> /var/log/spigot.log
        fi
    else
        echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) SPIGOT: skipped $(basename $SCRIPT) (still running, age=${AGE}s)" >> /var/log/spigot.log
    fi
    exit 0
fi

date +%s > "$LOCKFILE.ts"
echo $$ > "$LOCKFILE.pid"

bash "$SCRIPT"
EXIT=$?

rm -f "$LOCKFILE.ts" "$LOCKFILE.pid"
exit $EXIT
