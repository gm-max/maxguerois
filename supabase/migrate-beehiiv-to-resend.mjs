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

function planFor(sub) {
  const email = sub.email.toLowerCase();
  const isActive = sub.status === 'active';
  return {
    email,
    supabase: {
      table: 'mg_subscribers',
      unsubscribed_at: isActive ? null : sub.unsubscribed_on,
      source: 'beehiiv-migration',
    },
    resend: isActive
      ? { contact: { unsubscribed: false }, segment: 'add', topic: 'opt_in' }
      : { contact: 'unchanged', segment: 'skip', topic: 'opt_out' },
  };
}

async function main() {
  const subs = await fetchAllBeehiivSubscriptions();
  const plans = subs.map(planFor);
  const active = plans.filter((p) => p.resend.topic === 'opt_in');
  const inactive = plans.filter((p) => p.resend.topic === 'opt_out');

  console.log(`beehiiv subscriptions fetched: ${subs.length}`);
  console.log(`  -> would opt_in  (active):   ${active.length}`);
  console.log(`  -> would opt_out (inactive): ${inactive.length}`);
  console.log('\ninactive rows (the critical ones — must land opt_out + unsubscribed_at):');
  for (const p of inactive) {
    console.log(`  ${p.email}  unsubscribed_at=${p.supabase.unsubscribed_at}`);
  }

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
    const { error } = await supabase
      .from('mg_subscribers')
      .upsert(
        { email: p.email, unsubscribed_at: p.supabase.unsubscribed_at, source: p.supabase.source },
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
    }
    await rfetch(
      'topics',
      p.email,
      `https://api.resend.com/contacts/${encodeURIComponent(p.email)}/topics`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        // A BARE ARRAY. The Node SDK wraps this in { topics: [...] }; the raw endpoint
        // does not and 400s on the wrapped form. Wrapped, no active subscriber would
        // ever have been opted in, and the migration would have reported success while
        // producing a list that receives nothing.
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
