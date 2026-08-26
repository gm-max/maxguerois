#!/usr/bin/env node
// T4 — one-time migration of the beehiiv subscriber base into Supabase + Resend.
//
// DRY-RUN BY DEFAULT. Prints the plan and writes nothing, whatever else is true.
// The only way to make this script write anything is `--execute`, and even then it
// refuses unless CONFIRM_MIGRATION=yes-migrate-subscribers is set in the environment —
// two separate, deliberate steps, because this script writes `unsubscribed_at` for
// real people and the brief is explicit: do not run this for real without Max's
// go-ahead. Nothing in this repo calls it automatically.
//
// What it does, in order, per beehiiv subscription:
//   - active    -> upsert into public.mg_subscribers (unsubscribed_at: null),
//                  Resend contact unsubscribed:false, added to the segment,
//                  topic subscription: opt_in
//   - inactive  -> upsert into public.mg_subscribers (unsubscribed_at: their
//                  beehiiv unsubscribed_on timestamp), Resend contact left as-is,
//                  topic subscription: opt_out
// The 4 currently-inactive rows are the critical case the brief calls out by name:
// they must land opt_out and with unsubscribed_at set. Importing them as active would
// be exactly what French data-protection law forbids — re-subscribing someone who
// opted out, without their consent.
//
// No welcome email is sent for any of these rows — this is a migration of existing
// relationships, not 92 new signups.

import { createClient } from '@supabase/supabase-js';

const DRY_RUN = !process.argv.includes('--execute');
const CONFIRMED = process.env.CONFIRM_MIGRATION === 'yes-migrate-subscribers';

function env(name) {
  const v = process.env[name];
  if (!v) throw new Error(`missing env ${name}`);
  return v;
}

async function fetchAllBeehiivSubscriptions() {
  const pubId = env('BEEHIIV_PUBLICATION_ID');
  const key = env('BEEHIIV_API_KEY');
  const all = [];
  let page = 1;
  for (;;) {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${pubId}/subscriptions?page=${page}&limit=100`,
      { headers: { Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) throw new Error(`beehiiv list ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const body = await res.json();
    all.push(...body.data);
    if (!body.page || page >= body.total_results / body.limit) break;
    page++;
  }
  return all;
}

// beehiiv's own migration timestamp. Their API exposes NO unsubscribe date: verified
// on both the list endpoint and an individual subscription, whose only time field is
// `created`. So the true opt-out date is unrecoverable. We record the migration date
// instead, because what matters legally is that the column is NOT NULL — an empty
// column means "still subscribed", and a later export would wake these people up.
const MIGRATED_AT = new Date().toISOString();

/**
 * Three outcomes, because beehiiv's five non-active rows are not one thing.
 *
 *   active    a subscriber. Import, opt in, add to the segment.
 *   inactive  a person who UNSUBSCRIBED. A consent decision: import so the opt-out is
 *             preserved forever, set unsubscribed_at, opt out of the topic, and never
 *             add to the segment.
 *   invalid   a DEAD ADDRESS that bounces. Not a decision, a fault. Importing it as a
 *             subscriber would record a bounce as a consent choice and keep a dead
 *             address on a domain that only just started sending. It is suppressed at
 *             Resend and never enters mg_subscribers.
 *
 * The previous version read `sub.unsubscribed_on`, which does not exist in this API,
 * and lumped invalid in with inactive. Both were caught by the dry run.
 */
function planFor(sub) {
  const email = sub.email.toLowerCase();
  const utm = {
    utm_source: sub.utm_source || null,
    utm_medium: sub.utm_medium || null,
    utm_campaign: sub.utm_campaign || null,
  };

  if (sub.status === 'invalid') {
    return { email, kind: 'invalid', supabase: null, resend: { suppress: true } };
  }
  if (sub.status === 'active') {
    return {
      email,
      kind: 'active',
      supabase: { unsubscribed_at: null, source: 'beehiiv-migration', ...utm },
      resend: { contact: { unsubscribed: false }, segment: 'add', topic: 'opt_in' },
    };
  }
  return {
    email,
    kind: 'unsubscribed',
    supabase: { unsubscribed_at: MIGRATED_AT, source: 'beehiiv-migration', ...utm },
    resend: { contact: 'unchanged', segment: 'skip', topic: 'opt_out' },
  };
}

async function main() {
  const subs = await fetchAllBeehiivSubscriptions();
  const plans = subs.map(planFor);
  const active = plans.filter((p) => p.kind === 'active');
  const unsub = plans.filter((p) => p.kind === 'unsubscribed');
  const invalid = plans.filter((p) => p.kind === 'invalid');

  console.log(`beehiiv subscriptions fetched: ${subs.length}`);
  console.log(`  -> import + opt_in   (active):       ${active.length}`);
  console.log(`  -> import + opt_out  (unsubscribed): ${unsub.length}`);
  console.log(`  -> suppress, NOT imported (invalid): ${invalid.length}`);

  console.log('\nunsubscribed — must land opt_out AND a non-null unsubscribed_at:');
  for (const p of unsub) console.log(`  ${p.email}  unsubscribed_at=${p.supabase.unsubscribed_at}`);
  console.log('  (date = migration time; beehiiv exposes no real opt-out date)');

  console.log('\ninvalid — suppressed at Resend, never added to mg_subscribers:');
  for (const p of invalid) console.log(`  ${p.email}`);

  if (DRY_RUN) {
    console.log('\nDRY RUN — nothing written. Re-run with --execute (and CONFIRM_MIGRATION set) to write.');
    return;
  }
  if (!CONFIRMED) {
    console.error(
      '\n--execute was passed but CONFIRM_MIGRATION=yes-migrate-subscribers is not set. Refusing to write.',
    );
    process.exit(1);
  }

  // --- write path ---
  //
  // Every Resend call is CHECKED. They were all fire-and-forget `fetch` with no look at
  // res.ok, above a closing line that printed "Done. N rows processed." regardless: a
  // confident success message over what could have been zero successful writes, on a
  // migration of real people. Failures are collected per row and the process exits
  // non-zero, so a partial migration can never read as a complete one.
  const supabase = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });

  const failures = [];
  const rfetch = async (label, email, url, init) => {
    const res = await fetch(url, {
      ...init,
      headers: { Authorization: `Bearer ${env('RESEND_API_KEY')}`, ...(init.headers ?? {}) },
    });
    // 409 = already exists / already a member. Idempotent, not a failure.
    if (!res.ok && res.status !== 409) {
      failures.push(`${email} ${label}: ${res.status} ${(await res.text()).slice(0, 200)}`);
      return false;
    }
    return true;
  };

  for (const p of plans) {
    // invalid: a dead address. It never enters mg_subscribers — importing a bounce as
    // a subscriber records a fault as a consent decision. Suppressing it at Resend is
    // what actually protects a brand-new sending domain's reputation.
    if (p.kind === 'invalid') {
      await rfetch('suppress', p.email, 'https://api.resend.com/suppressions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: p.email }),
      });
      continue;
    }

    const { error } = await supabase.from('mg_subscribers').upsert(
      {
        email: p.email,
        unsubscribed_at: p.supabase.unsubscribed_at,
        source: p.supabase.source,
        utm_source: p.supabase.utm_source,
        utm_medium: p.supabase.utm_medium,
        utm_campaign: p.supabase.utm_campaign,
      },
      { onConflict: 'email' },
    );
    if (error) {
      failures.push(`${p.email} supabase-upsert: ${error.message}`);
      continue;
    }

    if (p.resend.contact !== 'unchanged') {
      await rfetch('create-contact', p.email, 'https://api.resend.com/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: p.email, unsubscribed: false }),
      });
      await rfetch(
        'add-to-segment',
        p.email,
        `https://api.resend.com/contacts/${encodeURIComponent(p.email)}/segments/${encodeURIComponent(env('RESEND_SEGMENT_ID'))}`,
        { method: 'POST' },
      );
    } else {
      // An unsubscribed person still needs a Resend contact to carry the topic opt_out,
      // but must never join the segment a broadcast targets.
      await rfetch('create-contact', p.email, 'https://api.resend.com/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: p.email }),
      });
    }

    await rfetch(
      'topics',
      p.email,
      `https://api.resend.com/contacts/${encodeURIComponent(p.email)}/topics`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        // A BARE ARRAY. The Node SDK wraps this in { topics: [...] }; the raw endpoint
        // does not and 400s on the wrapped form.
        body: JSON.stringify([{ id: env('RESEND_TOPIC_ID'), subscription: p.resend.topic }]),
      },
    );
  }

  if (failures.length) {
    console.error(`\n${failures.length} FAILURE(S):`);
    for (const f of failures) console.error(`  ${f}`);
    console.error('\nMigration INCOMPLETE. Fix the cause and re-run; the writes are idempotent.');
    process.exit(1);
  }
  console.log(`\nDone. ${plans.length} rows processed.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
