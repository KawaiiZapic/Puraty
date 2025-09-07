#!/bin/sh

rm -rf dist
mkdir dist
cp -r packages/frontend/dist dist/frontend
cp -r packages/server/dist dist/server
cp -r packages/launcher/* dist/