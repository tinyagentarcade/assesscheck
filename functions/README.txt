Capture-only email list. Sends nothing.
1. wrangler d1 create assesscheck-subs ; wrangler d1 execute assesscheck-subs --remote --file=schema.sql
2. Pages project "assesscheck" > Settings > Bindings: D1 binding name DB -> assesscheck-subs
3. No secrets or variables needed.
4. In check.js set window.__gate=true, redeploy.
Removal requests: handled by hand via the corrections email.
