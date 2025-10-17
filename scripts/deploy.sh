#!/bin/bash

PRODUCTION_DIR=openproduct:/home/kaja9241/public_node/

cd ${0/deploy.sh/}/..


npm install # For package-lock.json as we usually use "bun"
npm run build # For build dir
npm ci --omit=dev # --production For node_modules
rsync -avpzh build package.json package-lock.json svelte.config.js tailwind.config.js postcss.config.cjs components.json vite.config.ts tsconfig.json drizzle.config.ts $PRODUCTION_DIR
