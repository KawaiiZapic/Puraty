#!/bin/sh

APP_ID="moe.zapic.puraty"
APP_FOLDER="/mnt/us/extensions/Puraty"

if [ ! -f $APP_FOLDER/installed ]; then
  $APP_FOLDER/install.sh
fi

lipc-set-prop com.lab126.appmgrd start app://$APP_ID
