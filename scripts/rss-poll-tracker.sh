#!/bin/bash
# 🔄 rss-poll-tracker.sh — RSS poll frequency → interest signal
LOG="/var/log/caddy/access.log"
OUT="/opt/connect/data/rss-poll-feedback.json"
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
[ ! -f "$LOG" ] && exit 0
tail -5000 "$LOG" | python3 -c "
import json,sys
from collections import Counter
feeds=Counter()
for line in sys.stdin:
    try:
        e=json.loads(line)
        uri=e.get('request',{}).get('uri','')
        if any(k in uri.lower() for k in ['feed','rss','atom']):
            feeds[uri]+=1
    except: pass
json.dump({'ts':'$TS','total_polls':sum(feeds.values()),'feeds':dict(feeds)},open('$OUT','w'),indent=2)
print(f'{sum(feeds.values())} RSS polls, {len(feeds)} feeds')
"
