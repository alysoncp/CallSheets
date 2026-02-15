# Supabase Email Templates

## Production (Hosted Supabase)

For hosted Supabase projects, update the email template in the Dashboard:

1. Go to **Authentication** → **Email Templates**
2. Select **Confirm signup**
3. Replace the confirmation link with the token_hash direct link (avoids PKCE code_verifier issues):

Change the link from:
```
{{ .ConfirmationURL }}
```

To:
```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard
```

Or copy the full template from `confirmation.html`.

## Local Development

The `config.toml` already references these templates for local Supabase. Run `supabase start` to use them.
