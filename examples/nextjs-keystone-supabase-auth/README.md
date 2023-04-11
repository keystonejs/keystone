# Keystone in NextJS with Supabase and Supabase Auth

This is an example of using KeystoneJS with NextJS and Supabase Auth.

## Features

- KeystoneJS
- NextJS
- Supabase
- Supabase Auth

## Supabase Auth

This example uses Supabase auth to create and login the users. There is a `beforeOperation` hook on the Keystone user list to update the Supabase `app_metadata` for that user whenever a user is updated in Keystone.

# Information and Requirements

This repo using `pnpm` to get start install pnpm (https://pnpm.io/installation) and run `pnpm install` then `pnpm dev` to start. Once started go to http://localhost:3000. Use seed data or supabase to setup different users with their correct supabase `id`.

You will need to set your `DATABASE_URL` environment variable to your supabase postgres DB URL and the following will need to be set for Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_KEY` - make sure you keep your `SUPABASE_SERVICE_KEY` private as this gives Super User access to your Supabase account.
