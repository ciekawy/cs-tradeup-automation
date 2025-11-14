#!/bin/bash
set -e

echo "=== Goldberg Steam Emulator Docker Container ==="
echo "Setting up emulator environment..."

# Create steam_settings directory
mkdir -p /goldberg/steam_settings

# Set up steam_appid.txt (CS2/CSGO app ID)
echo "730" > /goldberg/steam_appid.txt

# Copy items configuration if mounted from fixtures
if [ -d "/goldberg/fixtures" ]; then
    echo "Copying configuration from fixtures..."
    if [ -f "/goldberg/fixtures/items.json" ]; then
        cp /goldberg/fixtures/items.json /goldberg/steam_settings/items.json
    fi
    if [ -f "/goldberg/fixtures/default_items.json" ]; then
        cp /goldberg/fixtures/default_items.json /goldberg/steam_settings/default_items.json
    fi
fi

# Create account configuration
mkdir -p /goldberg/settings
echo "TestAccount" > /goldberg/settings/account_name.txt
echo "76561198000000000" > /goldberg/settings/user_steam_id.txt
echo "27017" > /goldberg/settings/listen_port.txt

echo "Goldberg emulator environment configured"
echo "Steam App ID: 730 (CS2)"
echo "Listen Port: 27017"
echo ""
echo "Container ready for connections"
echo "Press Ctrl+C to stop"

# Keep container running
tail -f /dev/null
