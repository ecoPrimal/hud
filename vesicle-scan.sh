#!/bin/bash
for ip in 2.28.141.35 202.182.107.135 40.160.96.29 172.232.85.202; do
  echo "=== $ip ==="
  echo "Ports:"
  for p in 22 25 53 80 443 8314 8080 21116 51820; do
    timeout 2 bash -c "echo >/dev/tcp/$ip/$p" 2>/dev/null && echo "  $p OPEN"
  done
  echo "HTTP:"
  curl -sI --connect-timeout 3 "http://$ip/" 2>/dev/null | head -3
  echo "HTTPS:"
  curl -skI --connect-timeout 3 "https://$ip/" 2>/dev/null | head -3
  echo ""
done
