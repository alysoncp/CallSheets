# Avoid second disclaimer on preview / _dev

So the disclaimer is only shown once (at signup) and never again after email confirmation, the app must create a `users` row on first dashboard load and set disclaimer from signup metadata. These steps ensure that works in your **preview / _dev** environment (Supabase _dev + Vercel preview URLs).

---

## 1. Supabase _dev (Auth & Database)

### 1.1 Auth: email available after confirmation

The first request to `GET /api/auth/user` after confirmation needs the auth user to have `email` set so we can insert into `users`. If `email` is missing, we return a minimal user and the disclaimer shows again.

**Check:**

- Supabase Dashboard → **Authentication** → **Providers** → **Email**: confirm “Confirm email” is enabled so that after the user confirms, their `email` is set on the auth user.
- Optionally in **Authentication** → **Users**, open a test user who just confirmed and confirm `email` is populated.

No code change needed; this is configuration. If your _dev project matches prod (email confirmation on), you’re good.

### 1.2 Database: same schema as production

Preview deploys use the **_dev** Supabase project. The _dev database must have the same `users` table shape as production (same columns, including `disclaimer_accepted_at`, `disclaimer_version`, etc.).

**Do this:**

- From the repo (with Supabase CLI), run migrations against **_dev** so the schema matches prod:

```bash
# Link to _dev and push migrations (dev project ref from your package.json)
npx supabase link --project-ref ovnmeqtablzyanpnytai
npx supabase db push
```

Or use your existing script:

```bash
npm run db:push:dev
```

- Repeat after any new migration you run on prod so _dev stays in sync.

### 1.3 Database: connection must allow INSERT/UPDATE on `users`

The app uses `DATABASE_URL` (direct Postgres) to create/update `users` via Drizzle. The role in that URL must be allowed to **INSERT** and **UPDATE** `public.users`.

**Check:**

- Supabase _dev project → **Settings** → **Database** → **Connection string** (e.g. “URI” or “Transaction” pooler).
- The role in that URL (often `postgres`) can INSERT/UPDATE. If you use a custom role, ensure it has those privileges on `public.users`.
- If you use **RLS** on `users`: the connection used by the app (server-side) is typically a service role or a role with `BYPASSRLS`; if not, ensure there is a policy that allows the app to INSERT one row per `auth.uid()` and UPDATE that row. In practice, many setups use the “Direct” / “Transaction” connection with the `postgres` (or similar) role for the Next.js app, which bypasses RLS.

No change needed in the Supabase Dashboard if _dev already uses the same connection pattern as prod (same role, same RLS setup).

---

## 2. Vercel (Preview / _dev)

### 2.1 Preview must use _dev Supabase and _dev database

Preview deployments (branch/temp URLs) should talk to **_dev** Supabase and **_dev** database so you don’t mix prod data and so the same schema/permissions apply.

**Do this:**

- Vercel project → **Settings** → **Environment Variables**.
- For **Preview** (and optionally **Development**):
  - `NEXT_PUBLIC_SUPABASE_URL` = your **_dev** Supabase project URL.
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your **_dev** Supabase anon key.
  - `DATABASE_URL` = your **_dev** Supabase database connection string (from Supabase _dev → **Settings** → **Database** → connection string; use “Transaction” or “Direct” if you use it for the app).
- Ensure **Production** keeps pointing at **_prod** Supabase and **_prod** `DATABASE_URL`.

So: **Preview** = _dev Supabase + _dev `DATABASE_URL`; **Production** = _prod Supabase + _prod `DATABASE_URL`.

### 2.2 Optional: `NEXT_PUBLIC_APP_URL` for preview

If you use `getAppBaseUrl()` for redirects, production should have `NEXT_PUBLIC_APP_URL` set to your production domain. For preview you can leave it unset (the code uses `VERCEL_URL` / `VERCEL_BRANCH_URL`). No change required unless you rely on this for something else.

---

## 3. Quick checklist

| Where        | What to do |
|-------------|------------|
| **Supabase _dev** | Email confirmation enabled so `email` is set after confirm. |
| **Supabase _dev** | Run same migrations as prod: `npm run db:push:dev` (or `supabase link` to _dev + `supabase db push`). |
| **Supabase _dev** | `DATABASE_URL` role can INSERT/UPDATE `public.users` (and RLS allows it if applicable). |
| **Vercel**  | Preview env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `DATABASE_URL` all point at **_dev** project/DB. |
| **Vercel**  | Production env vars: same three point at **_prod** project/DB. |

After this, the first dashboard load on a preview deploy should create the `users` row (with disclaimer from signup) and the disclaimer will not show a second time.
