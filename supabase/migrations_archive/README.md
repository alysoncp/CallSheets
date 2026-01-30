# Archived migrations

These migrations were used for local/incremental development. They have been superseded by a single **initial schema** migration for the remote database:

- **Active:** `supabase/migrations/20260101000000_initial_schema.sql` — full schema (tables + RLS + storage policies) for a blank remote.

Do not run the archived files; they assume tables already existed and will fail on a blank DB.
