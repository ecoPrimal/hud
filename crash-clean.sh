#!/bin/bash
# crash-clean.sh — triggered on service crash/restart
# "ALL crashes are now locks to clean"
SERVICE_NAME="${1:-unknown}"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Log the crash
echo "$TIMESTAMP CRASH-CLEAN: $SERVICE_NAME triggered cleanup" >> /var/log/membrane/crash-clean.log

# Drop filesystem caches (safe, kernel will repopulate as needed)
sync
echo 1 > /proc/sys/vm/drop_caches 2>/dev/null

# Clean old log rotations (keep last 2 only)
find /var/log/caddy -name "*.log.gz" -mtime +2 -delete 2>/dev/null
find /var/log/caddy -name "*.log.*" -not -name "*.log" -mtime +2 -delete 2>/dev/null

# Clean temp files
find /tmp -name "*.tmp" -mmin +30 -delete 2>/dev/null

# Report memory after cleanup
FREE_MB=$(free -m | awk "/Mem:/ {print \$4}")
echo "$TIMESTAMP CRASH-CLEAN: $SERVICE_NAME cleanup done, ${FREE_MB}MB free" >> /var/log/membrane/crash-clean.log
