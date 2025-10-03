#!/bin/bash

PRODUCTION_DIR=openproduct:/home/kaja9241/public_node/

npm install # For package-lock.json as we usually use "bun"
npm run build # For build dir
npm ci --omit=dev # --production For node_modules
rsync -avpzh build package.json package-lock.json svelte.config.js $PRODUCTION_DIR
