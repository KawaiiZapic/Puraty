#!/bin/sh

source /mnt/us/extensions/Puraty/data/proxy.env || true
rm -f /mnt/us/extensions/Puraty/data/browser.pid || true
mkdir -p /mnt/us/extensions/Puraty/data/logs

TJS_EXIT_CODE=1
while [ $TJS_EXIT_CODE -ne 0 ]; do
  TJS_HOME=/mnt/us/extensions/Puraty/data /mnt/us/extensions/Puraty/bin/tjs run /mnt/us/extensions/Puraty/server/index.js > /mnt/us/extensions/Puraty/data/logs/server_`date +%s`.log 2>&1
  TJS_EXIT_CODE=$?
  if [ $TJS_EXIT_CODE -ne 0 ]; then
    echo "Server crashed with code $TJS_EXIT_CODE, restarting..."
  fi
done

kill `cat /mnt/us/extensions/Puraty/data/browser.pid`
