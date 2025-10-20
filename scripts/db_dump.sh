#!/bin/bash

source ../.env.local

cd ${0/db_dump.sh/}/..

DUMP_PATH=../openproduct-db/db/data/

PGPASSWORD="$DATABASE_PASSWORD"
export PGPASSWORD

# for table in products product_relationships; do
# 	echo " - table:$table"
# 	pg_dump --data-only -U $DATABASE_USER -h localhost $DATABASE_NAME -t $table > ./$table.sql
# done

pg_dump --compatible-version=9.6 --clean --if-exists -U $DATABASE_USER -h localhost $DATABASE_NAME > $DUMP_PATH/pg_dump.sql
