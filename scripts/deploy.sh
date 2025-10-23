#!/bin/bash

PRODUTION_HOST=openproduct
PRODUCTION_DIR=/home/kaja9241/public_node

cd ${0/deploy.sh/}/..

ENV=""
if [ -e .env.local ]; then
	echo "Developpement environment"
	ENV=dev
else if [ -e .env.production ]; then
	echo "Production environment"
	ENV=prod
else
	echo "Unknown environment => Exit"
	exit 1
fi fi


if [ $ENV == "prod" ]; then
	echo "Generate static datas"
	./scripts/generate_static.sh
	if [ $? -ne 0 ]; then
		echo "Fail generate static datas"
		exit 1
	fi
fi

bun install
bun run build
# npm ci --omit=dev # --production For node_modules

if [ $ENV == "dev" ]; then
	echo "Send to production"
	rsync -avpzh build package.json  svelte.config.js tailwind.config.js postcss.config.cjs components.json vite.config.ts tsconfig.json drizzle.config.ts $PRODUTION_HOST:$PRODUCTION_DIR/
	rsync -avpzh scripts .env.production $PRODUTION_HOST:~/
else
	echo "Copy to production"
	cp -r build package.json  svelte.config.js tailwind.config.js postcss.config.cjs components.json vite.config.ts tsconfig.json drizzle.config.ts $PRODUCTION_DIR/
fi
