#!/usr/bin/env node
/**
 * Guards vercel.json's CSP against the code that depends on it, in two directions:
 *   1. every absolute <img src> host must be allowed by img-src
 *   2. every wired-in third party must be allowed by the directives it needs
 * Prevents broken images in production when a new external host is used but CSP is not updated.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

/** Hostnames that count as same-origin for this site (CSP 'self' when deployed). */
const SELF_HOSTS = new Set(['maxguerois.com', 'www.maxguerois.com']);

function loadCsp() {
  const vercelPath = path.join(ROOT, 'vercel.json');
  const raw = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
  const block = raw.headers?.find((h) => h.source === '/(.*)');
  const csp = block?.headers?.find((x) => x.key === 'Content-Security-Policy')?.value;
  if (!csp) {
    console.error('check-csp: could not find Content-Security-Policy in vercel.json');
    process.exit(1);
  }
  return csp;
}

/** Tokens of one directive, or null when the directive is absent. */
function directiveTokens(csp, name) {
  const m = csp.match(new RegExp(name + '\\s+([^;]+)'));
  return m ? m[1].trim().split(/\s+/) : null;
}

function loadImgSrcTokens() {
  const tokens = directiveTokens(loadCsp(), 'img-src');
  if (!tokens) {
    console.error('check-csp: CSP has no img-src directive');
    process.exit(1);
  }
  return tokens;
}

function hostAllowedByToken(hostname, token) {
  const h = hostname.toLowerCase();

  // Keyword sources never grant an external host.
  if (/^'/.test(token)) return false;
  if (token === 'data:' || token === 'blob:') return false;

  // scheme-source: `https:` allows ANY host over that scheme. `*` allows any.
  // Previously these returned false, so a perfectly valid CSP was reported as
  // failing.
  if (token === '*') return true;
  if (/^[a-z][a-z0-9+.-]*:$/i.test(token)) return true;

  // Strip an optional scheme, then any path. Previously the scheme was stripped
  // with a literal /^https:\/\//, so an http:// token never matched anything.
  const hostPart = token.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').split('/')[0].toLowerCase();
  if (!hostPart) return false;

  const bare = hostPart.replace(/:\d+$/, '');   // drop an optional port

  if (bare.startsWith('*.')) {
    // CSP wildcards match SUBDOMAINS ONLY. The apex is not covered.
    // The previous version returned true for the apex, which would have
    // green-lit a CSP the browser blocks: precisely the failure this file
    // exists to catch.
    const suffix = bare.slice(2);
    return h !== suffix && h.endsWith('.' + suffix);
  }

  return h === bare;
}


function isImgSrcAllowed(urlString, tokens) {
  const s = urlString.trim();
  if (!s || s.startsWith('{')) return { ok: true, skip: true };

  if (s.startsWith('/') && !s.startsWith('//')) return { ok: true };
  if (s.startsWith('data:')) return { ok: true };

  let u;
  try {
    u = new URL(s);
  } catch {
    return { ok: false, reason: `invalid URL: ${s.slice(0, 80)}` };
  }

  const host = u.hostname.toLowerCase();
  if (SELF_HOSTS.has(host)) return { ok: true };

  for (const t of tokens) {
    if (hostAllowedByToken(host, t)) return { ok: true };
  }

  return {
    ok: false,
    reason: `host "${host}" is not covered by img-src (update vercel.json or use /public asset)`,
  };
}

function collectAstroFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) collectAstroFiles(p, out);
    else if (name.name.endsWith('.astro')) out.push(p);
  }
  return out;
}

/** <img ... src="..." or src='...' — allows newlines between <img and src */
const IMG_SRC_RE = /<img\b[\s\S]*?\bsrc\s*=\s*(["'])([^"']+)\1/gi;

/**
 * Third-party integrations and the CSP directives they need.
 *
 * WHY THIS EXISTS. The img-src half of this file already carried the right
 * instinct: "prevents broken images in production when a new external host is
 * used but CSP is not updated." On 2026-08-25 exactly that happened on a
 * different directive. GA4 routes EU and UK visitors to
 * region1.google-analytics.com; connect-src only allowed www., so every hit from
 * them was refused by the browser. It went unnoticed because a blocked analytics
 * call looks identical to no traffic: over 90 days the US showed 700 users and
 * the whole of Europe 41, for a French site.
 *
 * A guard that watches images and ignores the data the site sends is half a
 * guard. Add an entry here whenever a new third party is wired in.
 */
const INTEGRATIONS = [
  {
    name: 'Google Analytics 4 (gtag)',
    detect: /googletagmanager\.com\/gtag\/js/,
    // The regional hosts are the trap: GA4 picks region1, region2 and so on by
    // geography, so allowing only www. silently drops whole continents.
    requires: [{ directive: 'connect-src', host: 'region1.google-analytics.com' }],
    fix: "add https://*.google-analytics.com and https://*.analytics.google.com to connect-src",
  },
  {
    name: 'beehiiv subscribe form',
    detect: /subscribe-forms\.beehiiv\.com/,
    requires: [
      { directive: 'frame-src', host: 'subscribe-forms.beehiiv.com' },
      { directive: 'script-src', host: 'subscribe-forms.beehiiv.com' },
      { directive: 'form-action', host: 'subscribe-forms.beehiiv.com' },
    ],
    fix: 'add https://subscribe-forms.beehiiv.com to that directive in vercel.json',
  },
];

function checkIntegrations(csp, files) {
  const source = files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  const failures = [];
  for (const integration of INTEGRATIONS) {
    if (!integration.detect.test(source)) continue;
    for (const need of integration.requires) {
      const tokens = directiveTokens(csp, need.directive);
      const allowed = tokens && tokens.some((t) => hostAllowedByToken(need.host, t));
      if (!allowed) {
        failures.push({
          integration: integration.name,
          reason: tokens
            ? `${need.directive} does not allow ${need.host}`
            : `CSP has no ${need.directive} directive, so ${need.host} is blocked`,
          fix: integration.fix,
        });
      }
    }
  }
  return failures;
}

function main() {
  const csp = loadCsp();
  const tokens = loadImgSrcTokens();
  const files = collectAstroFiles(path.join(ROOT, 'src'));
  const failures = [];

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    let m;
    IMG_SRC_RE.lastIndex = 0;
    while ((m = IMG_SRC_RE.exec(text)) !== null) {
      const src = m[2];
      if (!/^https?:\/\//i.test(src)) continue;

      const rel = path.relative(ROOT, file);
      const { ok, skip, reason } = isImgSrcAllowed(src, tokens);
      if (skip) continue;
      if (!ok) failures.push({ file: rel, src, reason });
    }
  }

  if (failures.length) {
    console.error('check-csp: FAILED — external <img src> URLs not allowed by CSP img-src:\n');
    for (const f of failures) {
      console.error(`  ${f.file}`);
      console.error(`    ${f.src.slice(0, 100)}${f.src.length > 100 ? '…' : ''}`);
      console.error(`    → ${f.reason}\n`);
    }
    console.error('Fix: add the host to img-src in vercel.json, or host the file under public/.\n');
    process.exit(1);
  }

  const integrationFailures = checkIntegrations(csp, files);
  if (integrationFailures.length) {
    console.error('check-csp: FAILED — an integration is wired in but its CSP directive does not allow it:\n');
    for (const f of integrationFailures) {
      console.error(`  ${f.integration}`);
      console.error(`    → ${f.reason}`);
      console.error(`    fix: ${f.fix}\n`);
    }
    process.exit(1);
  }

  console.log(
    `check-csp: OK (external <img src> match img-src; ${INTEGRATIONS.length} integrations match their directives)`,
  );
}

main();
