/**
 * Reverse proxy for PostHog, served from e.maxguerois.com.
 *
 * WHY. Measured on 2026-08-30 over the same two full days, 28 and 29 August:
 *
 *                             GA4    PostHog   PostHog sees
 *     pageviews, whole site   162      40         25%
 *     newsletter pageviews     82      19         23%
 *
 * PostHog was seeing a quarter of the traffic. `eu.i.posthog.com` and
 * `eu-assets.i.posthog.com` are in the default uBlock and Brave blocklists, so
 * three visitors in four never reached it. Serving the same endpoints from a
 * first-party subdomain takes them off those lists.
 *
 * THE SUBDOMAIN NAME IS PART OF THE FIX, not decoration. PostHog's own docs say
 * to avoid `analytics`, `tracking`, `telemetry`, `posthog` and `ph`, because the
 * blocklists match on those words too. The first proposal here was
 * `ph.maxguerois.com`, which would have been blocked exactly like the host it
 * was meant to replace. A single neutral letter has nothing to match on.
 *
 * TWO UPSTREAMS, and getting them backwards breaks different things. The asset
 * host serves the remote config and the lazy modules the browser fetches after
 * init (`/array/<key>/config.js`, `/static/1.421.1/posthog-recorder.js`,
 * surveys, dead-clicks, web-vitals). Everything else is ingestion. Sending
 * `/static/` to the ingestion host answers 404 and the recorder never loads;
 * sending `/capture` to the asset host loses events silently.
 *
 *     browser ──▶ e.maxguerois.com ─┬─ /static/, /array/ ──▶ eu-assets.i.posthog.com
 *                  (this worker)    └─ everything else ────▶ eu.i.posthog.com
 *
 * The posthog-js core itself is NOT proxied and does not need to be: it is
 * bundled into the site's own `/_astro/` chunk by a dynamic import, so it was
 * already first-party and was never the blocked part.
 */

const API_HOST = 'eu.i.posthog.com';
const ASSET_HOST = 'eu-assets.i.posthog.com';

/** Paths the ASSET host owns. Everything else is ingestion. */
function isAsset(pathname) {
    return pathname.startsWith('/static/') || pathname.startsWith('/array/');
}

async function forward(request, host, pathWithParams) {
    const headers = new Headers(request.headers);
    // The upstream routes on Host. Without this it answers for the wrong site.
    headers.set('host', host);
    return fetch(`https://${host}${pathWithParams}`, {
        method: request.method,
        headers,
        body: request.body,
        // Required by the Workers runtime whenever a body is streamed.
        ...(request.body ? { duplex: 'half' } : {}),
    });
}

async function serveAsset(request, pathWithParams, ctx) {
    // Cache the lazy modules at our edge. They are versioned by URL
    // (/static/1.421.1/...), so a stale entry is impossible: a new posthog-js
    // version changes the path. This is the one part of the proxy that makes
    // the site FASTER than talking to PostHog directly.
    const cache = caches.default;
    const key = new Request(new URL(request.url).toString(), request);
    const hit = await cache.match(key);
    if (hit) return hit;

    const res = await forward(request, ASSET_HOST, pathWithParams);
    const out = new Response(res.body, res);
    out.headers.set('cache-control', 'public, max-age=86400');
    // Do not make the visitor wait on the cache write.
    ctx.waitUntil(cache.put(key, out.clone()));
    return out;
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const pathWithParams = url.pathname + url.search;
        return isAsset(url.pathname)
            ? serveAsset(request, pathWithParams, ctx)
            : forward(request, API_HOST, pathWithParams);
    },
};
