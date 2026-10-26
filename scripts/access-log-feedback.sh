#!/bin/bash
# 🔄 access-log-feedback.sh — caddy logs → ant trail reinforcement
LOG="/var/log/caddy/access.log"
OUT="/opt/connect/data/ant-trail-feedback.json"
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
[ ! -f "$LOG" ] && exit 0
tail -1000 "$LOG" | python3 -c "
import json,sys
from collections import Counter
paths,agents=Counter(),Counter()
for line in sys.stdin:
    try:
        e=json.loads(line)
        paths[e.get('request',{}).get('uri','/')]+=1
        ua=e.get('request',{}).get('headers',{}).get('User-Agent',[''])[0].lower()
        agents['crawler' if 'bot' in ua else 'human' if 'mozilla' in ua else 'agent']+=1
    except: pass
json.dump({'ts':'$TS','total':sum(paths.values()),'paths':dict(paths.most_common(50)),'visitors':dict(agents)},open('$OUT','w'),indent=2)
print(f'{sum(paths.values())} req, {len(paths)} paths')
"
