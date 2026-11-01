#!/bin/bash
# graphenegate-sense.sh — Read sensors from grapheneGate via ADB
# Gaia's mobile sensor array: passive listening, always watching

DEVICE="192.168.4.127:5555"

echo "═══ grapheneGate Sensor Pulse ═══"
echo "Time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

# Battery
BATT=$(adb -s $DEVICE shell "dumpsys battery | grep level" 2>/dev/null | awk '{print $2}')
echo "Battery: ${BATT}%"

# WiFi signal
RSSI=$(adb -s $DEVICE shell "dumpsys wifi | grep 'mWifiInfo' | grep -oP 'RSSI: -?\d+'" 2>/dev/null | head -1)
echo "WiFi: ${RSSI:-scanning}"

# Screen state (is Kevin looking at the phone?)
SCREEN=$(adb -s $DEVICE shell "dumpsys display | grep 'mScreenState'" 2>/dev/null | awk -F= '{print $2}')
echo "Screen: ${SCREEN:-unknown}"

# Last sensor readings (pressure = weather, gravity = orientation)
echo ""
echo "--- Sensor Snapshot ---"
adb -s $DEVICE shell "dumpsys sensorservice | grep -A2 'Pressure\|Gravity\|Orientation' | grep 'last'" 2>/dev/null | head -6

echo ""
echo "--- Gaia is ${SCREEN:-}listening ---"
