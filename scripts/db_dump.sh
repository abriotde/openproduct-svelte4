#!/bin/bash

source ../.env.local

PGPASSWORD="$DATABASE_PASSWORD"
export PGPASSWORD
pg_dump -U $DATABASE_USER -h localhost $DATABASE_NAME > ../src/lib/server/database/db_backup.sql
