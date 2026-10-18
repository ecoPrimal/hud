#!/usr/bin/env python3
"""neutron-notify-bridge — bridges ntfy notifications into neutron inbox.
Sovereign notification system: ntfy (reliable, open source) → neutron (our messaging axis).
Replaces Proton/Gmail push notifications with sovereign infrastructure.
"""

import json, time, urllib.request, subprocess

NTFY_TOPIC = "https://notify.primals.eco/membrane/json?poll=1&since=10m"
DISCUSS_API = "http://127.0.0.1:8097/api/discuss"

def fetch_ntfy():
    """Fetch recent ntfy messages."""
    try:
        req = urllib.request.Request(NTFY_TOPIC, headers={"User-Agent": "neutron-bridge/1.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            lines = resp.read().decode().strip().split("\n")
            messages = []
            for line in lines:
                if not line.strip(): continue
                try:
                    msg = json.loads(line)
                    if msg.get("event") == "message":
                        messages.append(msg)
                except:
                    pass
            return messages
    except:
        return []

def post_to_neutron(body, author="notify-bridge"):
    """Post a message to neutron inbox."""
    try:
        payload = json.dumps({
            "page": "neutron-inbox",
            "author": author,
            "body": body
        }).encode()
        req = urllib.request.Request(
            DISCUSS_API, data=payload,
            headers={"Content-Type": "application/json", "User-Agent": "neutron-bridge/1.0"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        return {"error": str(e)}

def bridge():
    """Bridge ntfy → neutron."""
    messages = fetch_ntfy()
    bridged = 0
    for msg in messages:
        title = msg.get("title", "")
        body = msg.get("message", "")
        topic = msg.get("topic", "")
        ts = msg.get("time", 0)
        
        neutron_body = ""
        if title:
            neutron_body += title + "\n"
        if body:
            neutron_body += body
        if topic and topic != "membrane":
            neutron_body += "\n[topic: " + topic + "]"
        
        if neutron_body.strip():
            result = post_to_neutron(neutron_body.strip(), author="ntfy→neutron")
            if result.get("ok"):
                bridged += 1
    
    if bridged > 0:
        print(f"bridged {bridged} ntfy → neutron")

if __name__ == "__main__":
    bridge()
