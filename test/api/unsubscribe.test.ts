import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createHmac } from 'node:crypto';

/**
 * Tests for the unsubscribe route (D16, T2 — "la tâche la plus importante du lot").
 *
 * Same faked-Supabase-client approach as subscribe.test.ts: `db` records every table
 * operation the route makes so tests can assert on it directly, rather than mocking
 * the builder chain method-by-method.
 */

type Op = { table: string; op: string; payload?: unknown };

const db = {
  calls: [] as Op[],
  errors: {} as Record<string, unknown>,
  reset() {
    this.calls = [];
    this.errors = {};
  },
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from(table: string) {
      const record = (op: string, payload?: unknown) => {
        db.calls.push({ table, op, payload });
      };
      const chain: any = {
        update(payload: unknown) {
          record('update', payload);
          return chain;
        },
        eq: () => chain,
        then(resolve: (v: unknown) => unknown) {
          const last = db.calls[db.calls.length - 1];
          const error = db.errors[`${last.table}.${last.op}`] ?? null;
          return Promise.resolve({ error }).then(resolve);
        },
      };
      return chain;
    },
  }),
}));

const { GET, POST, signEmail, buildUnsubscribeUrl } = await import('../../src/pages/api/unsubscribe.ts');

const ORIGIN = 'https://maxguerois.com';
const SECRET = 'unsub-secret';

function sigFor(email: string): string {
  return createHmac('sha256', SECRET).update(email).digest('hex');
}

function getReq(params: Record<string, string>) {
  const url = new URL('/api/unsubscribe', ORIGIN);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const request = new Request(url, { method: 'GET' });
  return GET({ request, url } as never);
}

function postReq(
  body: Record<string, string>,
  { accept = 'application/json' }: { accept?: string } = {},
) {
  const url = new URL('/api/unsubscribe', ORIGIN);
  const request = new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept },
    body: JSON.stringify(body),
  });
  return POST({ request, url } as never);
}

const okFetch = () => vi.fn(async () => new Response(JSON.stringify({}), { status: 200 }));

beforeEach(() => {
  db.reset();
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
  process.env.RESEND_API_KEY = 'resend-key';
  process.env.RESEND_TOPIC_ID = 'topic-test';
  process.env.UNSUBSCRIBE_SECRET = SECRET;
  vi.stubGlobal('fetch', okFetch());
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('signing', () => {
  it('buildUnsubscribeUrl embeds an email and a signature that verifies', () => {
    const url = new URL(buildUnsubscribeUrl('a@b.co', ORIGIN));
    expect(url.searchParams.get('email')).toBe('a@b.co');
    expect(url.searchParams.get('sig')).toBe(sigFor('a@b.co'));
  });

  it('signEmail is deterministic and email-specific', () => {
    expect(signEmail('a@b.co')).toBe(signEmail('a@b.co'));
    expect(signEmail('a@b.co')).not.toBe(signEmail('c@d.co'));
  });
});

describe('GET — confirmation only, never mutates', () => {
  it('renders a confirmation page for a validly signed link', async () => {
    const res = await getReq({ email: 'a@b.co', sig: sigFor('a@b.co') });
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('a@b.co');
    expect(html).toContain('<form method="POST"');
    // The point of the whole GET/POST split: fetching the link must never write.
    expect(db.calls).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rejects a missing signature', async () => {
    const res = await getReq({ email: 'a@b.co', sig: '' });
    expect(res.status).toBe(400);
    expect(db.calls).toEqual([]);
  });

  it('rejects a signature for a different email than the one in the link', async () => {
    // The forgery / enumeration case the HMAC exists to prevent.
    const res = await getReq({ email: 'victim@b.co', sig: sigFor('attacker@b.co') });
    expect(res.status).toBe(400);
    expect(db.calls).toEqual([]);
  });

  it('rejects a garbage (non-hex) signature without throwing', async () => {
    const res = await getReq({ email: 'a@b.co', sig: 'not-hex-!!' });
    expect(res.status).toBe(400);
  });

  it('rejects a signature of the wrong length', async () => {
    const res = await getReq({ email: 'a@b.co', sig: 'ab' });
    expect(res.status).toBe(400);
  });
});

describe('POST — performs the unsubscribe', () => {
  it('rejects an invalid signature and writes nothing', async () => {
    const res = await postReq({ email: 'a@b.co', sig: 'forged' });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'invalid_signature' });
    expect(db.calls).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('writes unsubscribed_at in Supabase for a valid signature', async () => {
    const res = await postReq({ email: 'a@b.co', sig: sigFor('a@b.co') });
    expect(res.status).toBe(200);
    const update = db.calls.find((c) => c.op === 'update')!;
    expect(update.table).toBe('mg_subscribers');
    expect((update.payload as any).unsubscribed_at).toBeTruthy();
  });

  it('opts the contact out on the TOPIC, never the global unsubscribed flag', async () => {
    // Global `unsubscribed` is account-wide and would also cut the person off from
    // Ouros Lab / Ouros Health — this must stay scoped to the one topic.
    await postReq({ email: 'a@b.co', sig: sigFor('a@b.co') });
    const call = (fetch as any).mock.calls.find(([u]: [string]) => u.endsWith('/topics'));
    expect(call).toBeTruthy();
    const [url, init] = call;
    expect(url).toBe('https://api.resend.com/contacts/a%40b.co/topics');
    // A BARE ARRAY, per the documented curl example — not the SDK's { topics: [...] }.
    expect(JSON.parse(init.body)).toEqual([{ id: 'topic-test', subscription: 'opt_out' }]);
  });

  it('writes unsubscribed_at even when the Resend call fails — Supabase is the source of truth', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('boom', { status: 500 })),
    );
    const res = await postReq({ email: 'a@b.co', sig: sigFor('a@b.co') });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    const update = db.calls.find((c) => c.op === 'update')!;
    expect((update.payload as any).unsubscribed_at).toBeTruthy();
    expect(console.error).toHaveBeenCalled();
  });

  it('writes unsubscribed_at even when the Resend call throws (timeout)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('The operation was aborted due to timeout');
      }),
    );
    const res = await postReq({ email: 'a@b.co', sig: sigFor('a@b.co') });
    expect(res.status).toBe(200);
    expect(db.calls.some((c) => c.op === 'update')).toBe(true);
  });

  it('fails the request when the Supabase write fails — a refused unsubscribe must be visible, never silent', async () => {
    db.errors['mg_subscribers.update'] = { message: 'db down' };
    const res = await postReq({ email: 'a@b.co', sig: sigFor('a@b.co') });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false, error: 'store_failed' });
    // And Resend must not have been told to opt out someone whose Supabase state
    // never actually changed.
    expect(fetch).not.toHaveBeenCalled();
  });
});
