#!/bin/bash

SUBDOMAIN="aki-tool"
PORT=3000

cleanup() {
    echo "Cleaning up..."
    pkill -f "lt --port $PORT --subdomain $SUBDOMAIN"
    exit 0
}

trap cleanup SIGINT SIGTERM

while true; do
    # Start localtunnel
    lt --port $PORT --subdomain $SUBDOMAIN &
    LT_PID=$!

    # Wait for localtunnel to start
    sleep 5

    # Check if localtunnel is running every 10 seconds
    while kill -0 $LT_PID 2>/dev/null; do
        sleep 10
    done

    echo "Localtunnel died. Restarting..."
    
    # Kill any remaining lt processes
    pkill -f "lt --port $PORT --subdomain $SUBDOMAIN"

    # Wait a bit before restarting
    sleep 5
done