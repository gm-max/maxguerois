#!/usr/bin/env node
/**
 * Ensures every absolute URL in <img src="..."> is allowed by CSP img-src in vercel.json.
 * Prevents broken images in production when a new external host is used but CSP is not updated.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

/** Hostnames that count as same-origin for this site (CSP 'self' when deployed). */
const SELF_HOSTS = new Set(['maxguerois.com', 'www.maxguerois.com']);

function loadImgSrcTokens() {
  const vercelPath = path.join(ROOT, 'vercel.json');
  const raw = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
  const block = raw.headers?.find((h) => h.source === '/(.*)');
  const csp = block?.headers?.find((x) => x.key === 'Content-Security-Policy')?.value;
  if (!csp) {
    console.error('check-csp-img-src: could not find Content-Security-Policy in vercel.json');
    process.exit(1);
  }
  const m = csp.match(/img-src\s+([^;]+)/);
  if (!m) {
    console.error('check-csp-img-src: CSP has no img-src directive');
    process.exit(1);
  }
  return m[1].trim().split(/\s+/);
}

function hostAllowedByToken(hostname, token) {
  const h = hostname.toLowerCase();
  if (token === "'self'" || token === 'self') return false;
  if (token === 'data:') return false;
  if (!/^https?:\/\//.test(token)) return false;

  if (token.includes('*.')) {
    const suffix = token.replace(/^https:\/\//, '').replace(/^\*\./, '').split('/')[0].toLowerCase();
    return h === suffix || h.endsWith('.' + suffix);
  }

  try {
    const host = new URL(token).hostname.toLowerCase();
    return h === host;
  } catch {
    return false;
  }
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

function main() {
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
    console.error('check-csp-img-src: FAILED — external <img src> URLs not allowed by CSP img-src:\n');
    for (const f of failures) {
      console.error(`  ${f.file}`);
      console.error(`    ${f.src.slice(0, 100)}${f.src.length > 100 ? '…' : ''}`);
      console.error(`    → ${f.reason}\n`);
    }
    console.error('Fix: add the host to img-src in vercel.json, or host the file under public/.\n');
    process.exit(1);
  }

  console.log('check-csp-img-src: OK (all external <img src> URLs match CSP img-src)');
}

main();
