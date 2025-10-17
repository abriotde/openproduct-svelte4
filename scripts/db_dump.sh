#!/bin/bash

source ../.env.local

cd ${0/db_dump.sh/}/..

PGPASSWORD="$DATABASE_PASSWORD"
export PGPASSWORD
pg_dump --compatible-version=9.6 --clean --if-exists -U $DATABASE_USER -h localhost $DATABASE_NAME > ./src/lib/server/database/db_backup.sql

