import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { welcomeHtml, welcomeText } from '../../src/lib/welcome-email.ts';

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
  // The route now runs a SECOND count query, on mg_subscribers, to decide whether a
  // send failure is the first of an outage. One shared counter would have made the
  // alert read the rate-limiter's number, so counts are per table.
  syncErrorCount: 0,
  errors: {} as Record<string, unknown>,
  reset() {
    this.calls = [];
    this.rateLimitCount = 0;
    this.syncErrorCount = 0;
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
        not: () => chain,
        is: () => chain,
        then(resolve: (v: unknown) => unknown) {
          const last = db.calls[db.calls.length - 1];
          const error = db.errors[`${last.table}.${last.op}`] ?? null;
          if (last.op !== 'select') return Promise.resolve({ error }).then(resolve);
          const count =
            last.table === 'mg_rate_limit_hits' ? db.rateLimitCount : db.syncErrorCount;
          return Promise.resolve({ count, error }).then(resolve);
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

// Every successful pushToResend() run makes 4 calls, in order: create-contact,
// add-to-segment, update-contact-topics, send-welcome. Reactivation (409 on create)
// inserts a 5th, update-contact, right after create.
const okFetch = () =>
  vi.fn(async () => new Response(JSON.stringify({ data: {} }), { status: 201 }));

beforeEach(() => {
  db.reset();
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
  process.env.RESEND_API_KEY = 'resend-key';
  process.env.RESEND_TOPIC_ID = 'topic-test';
  process.env.RESEND_WELCOME_TEMPLATE_ID = 'tpl-test';
  process.env.RESEND_SEGMENT_ID = 'segment-test';
  process.env.UNSUBSCRIBE_SECRET = 'unsub-secret';
  process.env.IP_HASH_SALT = 'salt';
  vi.stubGlobal('fetch', okFetch());
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const upsertOf = () => db.calls.find((c) => c.op === 'upsert');

function fetchCalls(): [string, RequestInit][] {
  return (fetch as any).mock.calls;
}
// Exact-suffix matching on purpose: '/contacts' would also match
// '/contacts/x/segments/y' with a naive `includes`, and the create-contact and
// add-to-segment calls both use POST, so a loose match could silently pick either one.
function callEnding(suffix: string, method: string) {
  return fetchCalls().find(
    ([u, init]) => u.endsWith(suffix) && (init as any)?.method === method,
  );
}
const createContactCall = () => callEnding('/contacts', 'POST');
const segmentCall = () => fetchCalls().find(([u, init]) => u.includes('/segments/') && (init as any)?.method === 'POST');
const topicsCall = () => callEnding('/topics', 'PATCH');
const welcomeCall = () => callEnding('/emails', 'POST');
function bodyOf(call: [string, RequestInit] | undefined): any {
  return call ? JSON.parse((call[1] as any).body) : undefined;
}

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
    // their unsubscribed_at, Resend was never told to reactivate, and they still saw
    // a thank-you while never hearing from us again.
    await post({ email: 'back@again.co' });
    const call = upsertOf()!;
    expect(call.options).toEqual({ onConflict: 'email' });
    expect(call.options).not.toMatchObject({ ignoreDuplicates: true });
    expect(call.payload).toMatchObject({ unsubscribed_at: null });
    // The Resend-side reactivation: a fresh signup always clears the contact's
    // unsubscribed flag, whether it's a brand-new contact (via the /contacts create
    // body) or an existing one (via the 409 -> PATCH path tested below).
    expect(bodyOf(createContactCall())).toMatchObject({ unsubscribed: false });
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

describe('resend sync', () => {
  it('creates the contact, un-unsubscribed', async () => {
    await post({ email: 'a@b.co' });
    expect(bodyOf(createContactCall())).toMatchObject({ email: 'a@b.co', unsubscribed: false });
  });

  it('adds the contact to the configured segment', async () => {
    await post({ email: 'a@b.co' });
    const call = segmentCall();
    expect(call).toBeTruthy();
    expect(call![0]).toBe('https://api.resend.com/contacts/a%40b.co/segments/segment-test');
  });

  it('opts the contact in on the topic explicitly — the topic defaults to opt_out', async () => {
    await post({ email: 'a@b.co' });
    // A BARE ARRAY. This assertion previously expected { topics: [...] }, the shape the
    // Node SDK takes, not the shape the raw endpoint accepts. A mocked fetch happily
    // confirms whatever shape you assert, which is exactly why it passed while the real
    // call would have 400'd. Checked against the documented curl example.
    expect(bodyOf(topicsCall())).toEqual([{ id: 'topic-test', subscription: 'opt_in' }]);
  });

  it('sends the welcome email that carries the gated guide', async () => {
    await post({ email: 'a@b.co' });
    const body = bodyOf(welcomeCall());
    expect(body.to).toEqual(['a@b.co']);
    expect(body.subject).toBeTruthy();
  });

  it('reactivates an existing contact on 409 instead of failing the whole sync', async () => {
    // The regression this guards: a contact that already exists (e.g. a returning
    // unsubscriber) 409s on create. Without a fallback, that 409 would bubble up as a
    // thrown error and abort the segment/topic/welcome steps entirely.
    let call = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        call++;
        if (url.endsWith('/contacts') && call === 1) return new Response('exists', { status: 409 });
        return new Response(JSON.stringify({ data: {} }), { status: 200 });
      }),
    );
    const res = await post({ email: 'back@again.co' });
    expect(res.status).toBe(200);
    const updateContactCall = callEnding('/contacts/back%40again.co', 'PATCH');
    expect(bodyOf(updateContactCall)).toEqual({ unsubscribed: false });
    // Guard verified negatively: removing the 409 branch in pushToResend (replacing it
    // with a plain `await resendOrThrow('create-contact', createRes)`) makes this test
    // fail — bodyOf(updateContactCall) comes back undefined — confirming this
    // assertion actually exercises the branch rather than passing vacuously.
    expect(segmentCall()).toBeTruthy();
    expect(topicsCall()).toBeTruthy();
    expect(welcomeCall()).toBeTruthy();
  });

  it('marks the row synced on success', async () => {
    await post({ email: 'a@b.co' });
    const update = db.calls.find((c) => c.op === 'update')!;
    expect(update.payload).toMatchObject({ sync_error: null });
    expect((update.payload as any).synced_at).toBeTruthy();
  });

  it('still returns 200, and keeps the signup, when Resend rejects', async () => {
    // The regression this guards: a Resend failure must never cost a real signup.
    // Supabase already holds the row (asserted below) before Resend is even called.
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('bad request', { status: 422 })),
    );
    const res = await post({ email: 'a@b.co' });
    expect(res.status).toBe(200);
    expect(upsertOf()).toBeTruthy();
    const update = db.calls.find((c) => c.op === 'update')!;
    expect((update.payload as any).sync_error).toContain('422');
    // Was `toBeUndefined()`, which pinned the bug rather than the behaviour: leaving
    // synced_at untouched let a returning subscriber's failure keep an old timestamp,
    // so it fell outside the alert's `synced_at IS NULL` predicate and never paged.
    // The failure path now writes the null explicitly.
    expect((update.payload as any).synced_at).toBeNull();
  });

  it('still returns 200 when Resend times out', async () => {
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

const telegramCall = () =>
  fetchCalls().find(([u]) => u.includes('api.telegram.org'));

/**
 * The alert exists because the catch above answers 200 to the visitor even when the
 * send fails. That is deliberate — a Resend outage must never lose a signup — but it
 * makes a total failure look exactly like a success from the browser. These tests
 * pin the three things that matter: it fires on the first failure, it stays quiet
 * afterwards, and it can never itself break a request.
 */
describe('alert on an unsent signup', () => {
  beforeEach(() => {
    process.env.TELEGRAM_BOT_TOKEN = 'bot-token';
    process.env.TELEGRAM_ADMIN_CHAT_ID = '4242';
  });
  afterEach(() => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_ADMIN_CHAT_ID;
  });

  const failSend = () =>
    vi.stubGlobal(
      'fetch',
      vi.fn(async (u: string) => {
        if (String(u).includes('api.telegram.org')) {
          return new Response('{}', { status: 200 });
        }
        if (String(u).endsWith('/emails')) {
          return new Response('domain not verified', { status: 403 });
        }
        return new Response(JSON.stringify({ data: {} }), { status: 201 });
      }),
    );

  it('pages on the first unsent signup', async () => {
    failSend();
    db.syncErrorCount = 1;
    const res = await post({ email: 'a@b.co' });
    expect(res.status).toBe(200);
    const call = telegramCall();
    expect(call).toBeDefined();
    expect(JSON.parse((call![1] as any).body).chat_id).toBe('4242');
  });

  // The test above injects the backlog count, so on its own it would still pass if
  // the route never made THIS failed signup countable. That was a real bug: the
  // upsert did not reset `synced_at`, so a returning subscriber's failure kept an
  // old timestamp, fell outside the `synced_at IS NULL` predicate, and never paged.
  // These two pin the writes the count is derived from.
  it('makes the failed signup countable: the upsert clears the sync state', async () => {
    failSend();
    await post({ email: 'a@b.co' });
    const payload = upsertOf()!.payload as Record<string, unknown>;
    expect(payload.synced_at).toBeNull();
    expect(payload.sync_error).toBeNull();
  });

  it('records the failure with a null synced_at, not just an error string', async () => {
    failSend();
    await post({ email: 'a@b.co' });
    const marks = db.calls.filter((c) => c.table === 'mg_subscribers' && c.op === 'update');
    const last = marks[marks.length - 1].payload as Record<string, unknown>;
    expect(last.synced_at).toBeNull();
    expect(String(last.sync_error)).toContain('send-welcome');
  });

  it('stays quiet once a backlog already exists', async () => {
    failSend();
    db.syncErrorCount = 7;
    await post({ email: 'a@b.co' });
    expect(telegramCall()).toBeUndefined();
  });

  it('does nothing when the credentials are absent', async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    failSend();
    db.syncErrorCount = 1;
    const res = await post({ email: 'a@b.co' });
    expect(res.status).toBe(200);
    expect(telegramCall()).toBeUndefined();
  });

  it('still answers 200 when the alert itself throws', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (u: string) => {
        if (String(u).includes('api.telegram.org')) throw new Error('telegram down');
        if (String(u).endsWith('/emails')) return new Response('nope', { status: 403 });
        return new Response(JSON.stringify({ data: {} }), { status: 201 });
      }),
    );
    db.syncErrorCount = 1;
    const res = await post({ email: 'a@b.co' });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});

describe('the client IP the rate limiter keys off', () => {
  // x-forwarded-for is caller-supplied on its leftmost hop, so keying the limiter
  // off it lets an attacker rotate spoofed IPs and never hit the 5/hour cap.
  // Vercel sets these two at its own edge, after stripping what the client claimed.
  it('prefers x-vercel-forwarded-for over a spoofable x-forwarded-for', async () => {
    const request = new Request(ENDPOINT, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-forwarded-for': '1.1.1.1',
        'x-vercel-forwarded-for': '203.0.113.7',
      },
      body: JSON.stringify({ email: 'a@b.co' }),
    });
    await POST({ request, url: new URL(ENDPOINT) } as never);
    const spoofed = db.calls.find(
      (c) => c.table === 'mg_rate_limit_hits' && c.op === 'insert',
    )!.payload as { ip_hash: string };

    db.reset();
    const request2 = new Request(ENDPOINT, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-forwarded-for': '9.9.9.9',
        'x-vercel-forwarded-for': '203.0.113.7',
      },
      body: JSON.stringify({ email: 'a@b.co' }),
    });
    await POST({ request: request2, url: new URL(ENDPOINT) } as never);
    const same = db.calls.find(
      (c) => c.table === 'mg_rate_limit_hits' && c.op === 'insert',
    )!.payload as { ip_hash: string };

    // Same trusted IP, different spoofed one: the limiter must see one identity.
    expect(same.ip_hash).toBe(spoofed.ip_hash);
  });
});

describe('the welcome email', () => {
  it('carries the one-click unsubscribe headers Gmail and Yahoo require', async () => {
    await post({ email: 'a@b.co' });
    const body = bodyOf(welcomeCall());
    expect(body.headers['List-Unsubscribe']).toMatch(/^<https:\/\/maxguerois\.com\/api\/unsubscribe\?/);
    expect(body.headers['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click');
  });

  // The regression: the link was built from url.origin, so an email sent by a Vercel
  // preview carried an unsubscribe URL on a hostname that dies with the deployment.
  it('builds the unsubscribe link on the canonical host, not the request host', async () => {
    await post({ email: 'a@b.co' });
    const body = JSON.parse((fetch as any).mock.calls.find(([u]: [string]) => u.endsWith('/emails'))[1].body);
    // The link now travels as a template variable rather than inside HTML we build here.
    expect(body.template.variables.UNSUBSCRIBE_URL).toMatch(/^https:\/\/maxguerois\.com\/api\/unsubscribe/);
    expect(body.template.variables.UNSUBSCRIBE_URL).not.toContain('vercel.app');
  });
});

describe('missing configuration', () => {
  it('does not pretend to succeed when an env var is absent', async () => {
    delete process.env.RESEND_API_KEY;
    // The Supabase write already happened, so the signup is NOT lost: the Resend
    // failure is recorded like any other and the visitor still gets a 200.
    const res = await post({ email: 'a@b.co' });
    expect(res.status).toBe(200);
    const update = db.calls.find((c) => c.op === 'update')!;
    expect((update.payload as any).sync_error).toContain('RESEND_API_KEY');
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
    expect(res.headers.get('location')).toBe(`${ORIGIN}/fr/merci?ok=1`);
  });

  it('honours the en key', async () => {
    const res = await post(
      { email: 'a@b.co' },
      { json: false, accept: 'text/html', endpoint: `${ENDPOINT}?lang=en` },
    );
    expect(res.headers.get('location')).toBe(`${ORIGIN}/thanks?ok=1`);
  });

  // The Instagram funnel landing. Without its RETURN_PATHS key a no-JS signup from
  // /fr/peptides bounced to the blog archive: a different page, no confirmation, and
  // the visitor left wondering whether it had worked.
  it('honours the fr-peptides key', async () => {
    const res = await post(
      { email: 'a@b.co' },
      { json: false, accept: 'text/html', endpoint: `${ENDPOINT}?lang=fr-peptides` },
    );
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe(`${ORIGIN}/fr/peptides?ok=1`);
  });

  it('carries the error code back to fr-peptides too', async () => {
    const res = await post(
      { email: 'nope' },
      { json: false, accept: 'text/html', endpoint: `${ENDPOINT}?lang=fr-peptides` },
    );
    expect(res.headers.get('location')).toBe(`${ORIGIN}/fr/peptides?error=invalid_email`);
  });

  it('carries the error code back on a rejected submission', async () => {
    const res = await post({ email: 'nope' }, { json: false, accept: 'text/html' });
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe(`${ORIGIN}/fr/merci?error=invalid_email`);
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
    expect(location.pathname).toBe('/fr/merci');
  });
});

describe('no-JS return path', () => {
  // The regression this guards: `fr` and `en` used to return to /fr/newsletter and
  // /newsletter, which are PRERENDERED and therefore cannot read ?ok=1 at request
  // time. A visitor without JavaScript was redirected to a page identical to the one
  // they left, with no confirmation anywhere — so they submitted again. The two
  // destinations below are the only ones that are `prerender = false`.
  it.each([
    ['fr', '/fr/merci'],
    ['en', '/thanks'],
  ])('%s returns to an on-demand page that can render the result', async (lang, path) => {
    const res = await post(
      { email: 'a@b.co' },
      { json: false, accept: 'text/html', endpoint: `${ENDPOINT}?lang=${lang}` },
    );
    const location = new URL(res.headers.get('location')!);
    expect(location.pathname).toBe(path);
    expect(location.searchParams.get('ok')).toBe('1');
  });

  it('never returns to a prerendered page', async () => {
    for (const lang of ['fr', 'en', 'fr-peptides', 'unknown', '']) {
      const res = await post(
        { email: 'a@b.co' },
        { json: false, accept: 'text/html', endpoint: `${ENDPOINT}?lang=${lang}` },
      );
      const path = new URL(res.headers.get('location')!).pathname;
      expect(['/fr/merci', '/thanks', '/fr/peptides']).toContain(path);
    }
  });
});

describe('welcome email', () => {
  // The regression this guards: the placeholder promised "le guide peptides arrive
  // très vite" while no guide existed. A first impression that opens on an unkept
  // promise is worse than no email. It goes back in when the guide is real.
  // These three now assert the AUTHORED copy in src/lib/welcome-email.ts, which is the
  // source the Resend template was generated from. They can no longer prove what the
  // live template says: that is the price of copy being editable in Resend's dashboard
  // without a deploy. Re-check the template itself after editing it there.
  it('promises nothing that does not exist yet', () => {
    const both = (welcomeHtml('u') + welcomeText('u')).toLowerCase();
    expect(both).not.toContain('guide');
  });

  it('carries the postal address a commercial email legally needs', () => {
    expect(welcomeHtml('u')).toContain('Maubeuge');
    expect(welcomeText('u')).toContain('Maubeuge');
  });

  it('carries no em dash, in either part', () => {
    expect(welcomeHtml('u')).not.toContain('\u2014');
    expect(welcomeText('u')).not.toContain('\u2014');
  });
});
