import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Tests for the site's one server route.
 *
 * The Supabase client is faked rather than mocked call-by-call, because the route
 * uses the builder chain (`.from().select().eq().gte()` awaited as a promise) and a
 * per-method mock ends up asserting the shape of the library instead of the shape of
 * our logic. `db` below lets each test say what the DATABASE answers and then read
 * back what the route actually sent.
 *
 *   test ──sets──> db.rateLimitCount / db.errors ──> fake client ──> route
 *   test <──reads── db.calls  (every table op, in order, with its payload)
 */

type Op = { table: string; op: string; payload?: unknown; options?: unknown };

const db = {
  calls: [] as Op[],
  rateLimitCount: 0,
  errors: {} as Record<string, unknown>,
  reset() {
    this.calls = [];
    this.rateLimitCount = 0;
    this.errors = {};
  },
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from(table: string) {
      const record = (op: string, payload?: unknown, options?: unknown) => {
        db.calls.push({ table, op, payload, options });
      };
      // Every builder method returns `this`, and the object is thenable, so
      // `await client.from(t).update(p).eq(c, v)` resolves wherever the chain stops.
      const chain: any = {
        select(_cols: string, _opts: unknown) {
          record('select');
          return chain;
        },
        insert(payload: unknown) {
          record('insert', payload);
          return chain;
        },
        upsert(payload: unknown, options: unknown) {
          record('upsert', payload, options);
          return chain;
        },
        update(payload: unknown) {
          record('update', payload);
          return chain;
        },
        eq: () => chain,
        gte: () => chain,
        then(resolve: (v: unknown) => unknown) {
          const last = db.calls[db.calls.length - 1];
          const error = db.errors[`${last.table}.${last.op}`] ?? null;
          return Promise.resolve(
            last.op === 'select'
              ? { count: db.rateLimitCount, error }
              : { error },
          ).then(resolve);
        },
      };
      return chain;
    },
  }),
}));

const { POST } = await import('../../src/pages/api/subscribe.ts');

const ORIGIN = 'https://maxguerois.com';
const ENDPOINT = `${ORIGIN}/api/subscribe`;

function post(
  body: unknown,
  { json = true, accept = 'application/json', endpoint = ENDPOINT, referer = '' } = {},
) {
  const headers: Record<string, string> = {
    accept,
    'x-forwarded-for': '203.0.113.9, 70.41.3.18',
  };
  let payload: BodyInit;
  if (json) {
    headers['content-type'] = 'application/json';
    payload = JSON.stringify(body);
  } else {
    const form = new URLSearchParams(body as Record<string, string>);
    headers['content-type'] = 'application/x-www-form-urlencoded';
    payload = form;
  }
  if (referer) headers.referer = referer;
  const request = new Request(endpoint, { method: 'POST', headers, body: payload });
  return POST({ request, url: new URL(endpoint) } as never);
}

const okFetch = () =>
  vi.fn(async () => new Response(JSON.stringify({ data: {} }), { status: 201 }));

beforeEach(() => {
  db.reset();
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
  process.env.BEEHIIV_API_KEY = 'beehiiv-key';
  process.env.BEEHIIV_PUBLICATION_ID = 'pub_test';
  process.env.IP_HASH_SALT = 'salt';
  vi.stubGlobal('fetch', okFetch());
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const upsertOf = () => db.calls.find((c) => c.op === 'upsert');
const beehiivBody = () => JSON.parse((fetch as any).mock.calls[0][1].body);

describe('parsing', () => {
  it('accepts a JSON body', async () => {
    const res = await post({ email: 'a@b.co' });
    expect(res.status).toBe(200);
    expect(upsertOf()!.payload).toMatchObject({ email: 'a@b.co' });
  });

  it('accepts a native form post', async () => {
    const res = await post({ email: 'a@b.co' }, { json: false, accept: 'text/html' });
    expect(res.status).toBe(303);
    expect(upsertOf()!.payload).toMatchObject({ email: 'a@b.co' });
  });

  it('returns 400 on an unreadable body', async () => {
    const request = new Request(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: '{ not json',
    });
    const res = await POST({ request, url: new URL(ENDPOINT) } as never);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'bad_request' });
  });

  it('does not crash when JSON parses to a non-object', async () => {
    const request = new Request(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: '"just a string"',
    });
    const res = await POST({ request, url: new URL(ENDPOINT) } as never);
    expect(res.status).toBe(400);
  });
});

describe('honeypot', () => {
  it('answers 200 and writes nothing when the hidden field is filled', async () => {
    const res = await post({ email: 'bot@spam.co', website: 'http://spam' });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(db.calls).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('email validation', () => {
  it.each([
    ['missing', undefined],
    ['empty', ''],
    ['no at sign', 'nope'],
    ['no tld', 'a@b'],
    // Regression: `{"email": 123}` used to throw an uncaught TypeError on .trim()
    // and surface as a raw 500 instead of this 400.
    ['a number', 123],
    ['an object', { nested: true }],
    ['an array', ['a@b.co']],
  ])('rejects %s', async (_label, email) => {
    const res = await post({ email });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'invalid_email' });
    expect(db.calls).toEqual([]);
  });

  it('rejects an address longer than the 254 cap', async () => {
    const res = await post({ email: `${'a'.repeat(250)}@example.com` });
    expect(res.status).toBe(400);
  });

  it('lowercases before storing, so casing cannot split one person in two', async () => {
    await post({ email: '  MAX@Example.CO  ' });
    expect(upsertOf()!.payload).toMatchObject({ email: 'max@example.co' });
  });
});

describe('field hardening', () => {
  it('caps attribution fields instead of storing unbounded text', async () => {
    await post({ email: 'a@b.co', utm_campaign: 'x'.repeat(5000) });
    const { utm_campaign } = upsertOf()!.payload as Record<string, string>;
    expect(utm_campaign).toHaveLength(200);
  });

  it('ignores non-string attribution values rather than throwing', async () => {
    const res = await post({ email: 'a@b.co', utm_medium: { evil: true }, source: 42 });
    expect(res.status).toBe(200);
    expect(upsertOf()!.payload).toMatchObject({ utm_medium: null, source: 'site' });
  });
});

describe('rate limit', () => {
  it('passes through and records an attempt below the threshold', async () => {
    db.rateLimitCount = 4;
    const res = await post({ email: 'a@b.co' });
    expect(res.status).toBe(200);
    expect(db.calls.some((c) => c.table === 'mg_rate_limit_hits' && c.op === 'insert')).toBe(true);
  });

  it('returns 429 at the threshold, before touching subscribers', async () => {
    db.rateLimitCount = 5;
    const res = await post({ email: 'a@b.co' });
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ ok: false, error: 'rate_limited' });
    expect(upsertOf()).toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('fails OPEN when the counter cannot be read, and says so in the log', async () => {
    db.errors['mg_rate_limit_hits.select'] = { message: 'read boom' };
    db.rateLimitCount = 999;
    const res = await post({ email: 'a@b.co' });
    expect(res.status).toBe(200);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('rate-limit read failed'),
      expect.anything(),
    );
  });

  it('logs loudly when the ledger write fails, so the limiter cannot die in silence', async () => {
    // The regression this guards: the insert error used to be discarded entirely, so
    // a permanently failing write left the count at zero and the limit never fired.
    db.errors['mg_rate_limit_hits.insert'] = { message: 'write boom' };
    const res = await post({ email: 'a@b.co' });
    expect(res.status).toBe(200);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('limiter is blind'),
      expect.anything(),
    );
  });
});

describe('storing the subscriber', () => {
  it('updates on conflict and clears unsubscribed_at, so a return visit works', async () => {
    // The regression this guards: with ignoreDuplicates a returning unsubscriber kept
    // their unsubscribed_at, beehiiv was told not to reactivate, and they still saw
    // a thank-you while never hearing from us again.
    await post({ email: 'back@again.co' });
    const call = upsertOf()!;
    expect(call.options).toEqual({ onConflict: 'email' });
    expect(call.options).not.toMatchObject({ ignoreDuplicates: true });
    expect(call.payload).toMatchObject({ unsubscribed_at: null });
    expect(beehiivBody().reactivate_existing).toBe(true);
  });

  it('never writes created_at, so the original signup date survives a re-signup', async () => {
    await post({ email: 'a@b.co' });
    expect(upsertOf()!.payload).not.toHaveProperty('created_at');
  });

  it('tells the visitor when the write fails, instead of a false thank-you', async () => {
    db.errors['mg_subscribers.upsert'] = { message: 'db down' };
    const res = await post({ email: 'a@b.co' });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false, error: 'store_failed' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('hashes the client IP rather than storing it', async () => {
    await post({ email: 'a@b.co' });
    const { ip_hash } = upsertOf()!.payload as Record<string, string>;
    expect(ip_hash).toMatch(/^[0-9a-f]{32}$/);
    expect(ip_hash).not.toContain('203.0.113.9');
  });
});

describe('beehiiv sync', () => {
  it('sends the welcome email that carries the gated guide', async () => {
    await post({ email: 'a@b.co' });
    expect(beehiivBody().send_welcome_email).toBe(true);
  });

  it('forwards attribution so the Instagram funnel stays traceable', async () => {
    await post({
      email: 'a@b.co',
      utm_source: 'instagram',
      utm_medium: 'bio',
      utm_campaign: 'science-dm',
    });
    expect(beehiivBody()).toMatchObject({
      utm_source: 'instagram',
      utm_medium: 'bio',
      utm_campaign: 'science-dm',
    });
  });

  it('marks the row synced on success', async () => {
    await post({ email: 'a@b.co' });
    const update = db.calls.find((c) => c.op === 'update')!;
    expect(update.payload).toMatchObject({ sync_error: null });
    expect((update.payload as any).synced_at).toBeTruthy();
  });

  it('still returns 200 and records the error when beehiiv rejects', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('bad request', { status: 422 })),
    );
    const res = await post({ email: 'a@b.co' });
    expect(res.status).toBe(200);
    const update = db.calls.find((c) => c.op === 'update')!;
    expect((update.payload as any).sync_error).toContain('422');
    expect((update.payload as any).synced_at).toBeUndefined();
  });

  it('still returns 200 when beehiiv times out', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('The operation was aborted due to timeout');
      }),
    );
    const res = await post({ email: 'a@b.co' });
    expect(res.status).toBe(200);
    const update = db.calls.find((c) => c.op === 'update')!;
    expect((update.payload as any).sync_error).toContain('timeout');
  });
});

describe('missing configuration', () => {
  it('does not pretend to succeed when an env var is absent', async () => {
    delete process.env.BEEHIIV_API_KEY;
    // The Supabase write already happened, so the signup is NOT lost: the beehiiv
    // failure is recorded like any other and the visitor still gets a 200.
    const res = await post({ email: 'a@b.co' });
    expect(res.status).toBe(200);
    const update = db.calls.find((c) => c.op === 'update')!;
    expect((update.payload as any).sync_error).toContain('BEEHIIV_API_KEY');
  });
});

describe('reply', () => {
  it('returns JSON when the caller asks for it', async () => {
    const res = await post({ email: 'a@b.co' });
    expect(res.headers.get('content-type')).toContain('application/json');
  });

  it('redirects a no-JS form post back to the French page by default', async () => {
    const res = await post({ email: 'a@b.co' }, { json: false, accept: 'text/html' });
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe(`${ORIGIN}/fr/newsletter?ok=1`);
  });

  it('honours the en key', async () => {
    const res = await post(
      { email: 'a@b.co' },
      { json: false, accept: 'text/html', endpoint: `${ENDPOINT}?lang=en` },
    );
    expect(res.headers.get('location')).toBe(`${ORIGIN}/newsletter?ok=1`);
  });

  it('carries the error code back on a rejected submission', async () => {
    const res = await post({ email: 'nope' }, { json: false, accept: 'text/html' });
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe(`${ORIGIN}/fr/newsletter?error=invalid_email`);
  });

  // The regression this guards: reply() built the destination with
  // `new URL(caller_value, origin)`, and an absolute value overrides the base, so
  // ?redirect=https://evil.com sent visitors off-site from a maxguerois.com link.
  it.each([
    ['an absolute URL', 'https://evil.example.com/phish'],
    ['a protocol-relative URL', '//evil.example.com'],
    ['a backslash trick', '/\\evil.example.com'],
    ['a path', '/somewhere/else'],
    ['an unknown key', 'de'],
  ])('never leaves the origin for %s', async (_label, value) => {
    const res = await post(
      { email: 'a@b.co' },
      {
        json: false,
        accept: 'text/html',
        endpoint: `${ENDPOINT}?lang=${encodeURIComponent(value)}`,
      },
    );
    const location = new URL(res.headers.get('location')!);
    expect(location.origin).toBe(ORIGIN);
    expect(location.pathname).toBe('/fr/newsletter');
  });
});
