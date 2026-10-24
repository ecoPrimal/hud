#!/usr/bin/env python3
"""Insert beacon + pulse routes into signal block of Caddyfile."""

INSERT_AFTER = "\thandle @signal {"

NEW_ROUTES = """		handle /beacon {
			reverse_proxy https://ntfy.sh {
				header_up Host ntfy.sh
				rewrite /primals-membrane-inbox/sse
			}
			header Access-Control-Allow-Origin *
			header Cache-Control no-store
			header X-Klein-Fold beacon
		}
		handle /beacon.xml {
			root * /opt/signal
			rewrite * /beacon.xml
			file_server
			header Content-Type "application/atom+xml; charset=utf-8"
		}
		handle /api/membrane-pulse.json {
			root * /opt/membrane/live-terminal
			rewrite * /membrane-pulse.json
			file_server
			header Content-Type application/json
			header Access-Control-Allow-Origin *
			header Cache-Control "max-age=30"
		}"""

with open("/etc/caddy/Caddyfile", "r") as f:
    lines = f.readlines()

new_lines = []
inserted = False
for line in lines:
    new_lines.append(line)
    if not inserted and line.strip() == "handle @signal {":
        new_lines.append(NEW_ROUTES + "\n")
        inserted = True

if inserted:
    with open("/etc/caddy/Caddyfile", "w") as f:
        f.writelines(new_lines)
    print(f"Inserted beacon+pulse routes after line containing 'handle @signal'")
else:
    print("ERROR: could not find 'handle @signal' line")
