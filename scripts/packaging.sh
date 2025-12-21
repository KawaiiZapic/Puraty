#!/bin/sh

rm -rf dist
mkdir dist
cp -r packages/client/dist dist/client
cp -r packages/server/dist dist/server
cp -r packages/launcher/* dist/