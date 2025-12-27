#!/bin/bash

# Start the services defined in the docker-compose.yml file
docker compose -p nightout up -d

sleep 5

# Open application in browser (80)
URL="http://localhost"

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "$URL"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    open "$URL"
elif [[ "$OSTYPE" == "cygwin" || "$OSTYPE" == "msys" ]]; then
    start "" "$URL"
elif [[ "$OSTYPE" == "linux-android" ]]; then
    termux-open-url "$URL"
else
    echo "Unsupported OS"
fi