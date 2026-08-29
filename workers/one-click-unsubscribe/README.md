# one-click-unsubscribe

A four-line Cloudflare Worker that adds an `Origin` header to the one-click
unsubscribe POST, because Vercel refuses Origin-less form POSTs and that is exactly
the shape RFC 8058 requires mail clients to send.

It holds **no secrets** and makes **no decisions**. Signature checking, the Supabase
write and the Resend opt-out all stay in `src/pages/api/unsubscribe.ts`.

## Deploy

Needs a Cloudflare token with `Workers Scripts: Edit` on the `maxguerois.com` zone.
The DNS-edit token in `~/.config/cloudflare/` is not enough; it answers
`Authentication error` on the Workers API.

```
cd workers/one-click-unsubscribe
wrangler login          # or: export CLOUDFLARE_API_TOKEN=<token with Workers Scripts:Edit>
wrangler deploy
```

## Verify it worked

Reproduce what Gmail sends. Build a signed link first (the welcome email contains one),
then POST to it with no `Origin`:

```
curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST "https://maxguerois.com/api/unsubscribe?email=<urlencoded>&sig=<hmac>" \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data 'List-Unsubscribe=One-Click'
```

- `403` with `Cross-site POST form submissions are forbidden` means the worker is not
  on the route. That is the pre-deploy state.
- `200` means one-click works. Confirm `unsubscribed_at` is set in
  `mg_subscribers`, then clear it, or you have just unsubscribed a real person.

Use a disposable `+tag` address, never a subscriber's.
