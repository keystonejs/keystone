#!/usr/bin/env bash

# Create or recreate and setup the Keystone test Postgres DB from scratch
# Will distroy any existing data, etc.
# When Keystone starts the knex adapter will recreate the structure

KS_DB_NAME="keystone"
KS_USER_NAME="keystone5"
KS_USER_PASS="change_me_plz"

# On MacOS the super use is the current username, no password
SUPER_USER="${USER}"

# Our queries
DROP_CONNECTIONS_SQL="
  SELECT pg_terminate_backend(pg_stat_activity.pid)
  FROM pg_stat_activity
  WHERE pg_stat_activity.datname = '${KS_DB_NAME}'
  AND pid <> pg_backend_pid();
"
DROP_DB_SQL="
  DROP DATABASE IF EXISTS \"${KS_DB_NAME}\";
"
CREATE_DB_SQL="
  CREATE DATABASE \"${KS_DB_NAME}\";
"
RECREATE_ROLE_SQL="
  DROP USER IF EXISTS \"${KS_USER_NAME}\";
  CREATE USER \"${KS_USER_NAME}\" PASSWORD '${KS_USER_PASS}';
"

# Needed for `gen_random_uuid()` function, used by UUIDs
SETUP_UUIDS="
  CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";
"

# Run outside the KS DB (in template1)
psql template1 -U "${SUPER_USER}" -c "${DROP_CONNECTIONS_SQL}"
psql template1 -U "${SUPER_USER}" -c "${DROP_DB_SQL}"
psql template1 -U "${SUPER_USER}" -c "${CREATE_DB_SQL}"
psql template1 -U "${SUPER_USER}" -c "${RECREATE_ROLE_SQL}"

# Run in the new DB
psql "${KS_DB_NAME}" -U "${SUPER_USER}" -c "${SETUP_UUIDS}"
