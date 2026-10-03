Setup (sibling Cloudflare account):
1. wrangler d1 create assesscheck-subs ; wrangler d1 execute assesscheck-subs --remote --file=schema.sql
2. Pages project "assesscheck" > Settings > Bindings: D1 binding name DB -> assesscheck-subs
3. Variables: SENDER_EMAIL (Brevo-validated sender), SITE_URL (public site origin)
4. Secret: BREVO_API_KEY (typed via vault fill in dashboard, never via chat)
5. In check.js set window.__gate=true, redeploy.
