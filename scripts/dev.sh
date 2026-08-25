#!/usr/bin/env bash
# Start the Astro dev server on a Node that Astro actually supports.
#
# package.json pins "node": "22.x" and Astro 6 hard-requires >=22.12, but the
# `astro` bin has a `#!/usr/bin/env node` shebang, so it inherits whatever Node
# happens to be first on PATH. On this machine that is v20.19.1, and the dev
# server exits 1 with "Node.js v20.19.1 is not supported by Astro!" before it
# prints anything useful.
#
# Rather than hardcode one machine's nvm path into a committed launch config,
# find a supported Node here: the current one if it already qualifies, otherwise
# the highest v22+ installed under nvm. Bypass the shebang by invoking the
# resolved binary against Astro's .mjs entry directly.
set -euo pipefail
cd "$(dirname "$0")/.."

MIN_MAJOR=22
node_major() { "$1" -e 'process.stdout.write(String(process.versions.node.split(".")[0]))' 2>/dev/null || echo 0; }

NODE_BIN=""
if command -v node >/dev/null 2>&1 && [ "$(node_major node)" -ge "$MIN_MAJOR" ]; then
  NODE_BIN="$(command -v node)"
else
  # Highest v22+ under nvm. Sorted numerically so v22.9 does not beat v22.22.
  for candidate in $(ls -1 "$HOME/.nvm/versions/node" 2>/dev/null | sed 's/^v//' | sort -t. -k1,1n -k2,2n -k3,3n | tac); do
    bin="$HOME/.nvm/versions/node/v$candidate/bin/node"
    if [ -x "$bin" ] && [ "$(node_major "$bin")" -ge "$MIN_MAJOR" ]; then NODE_BIN="$bin"; break; fi
  done
fi

if [ -z "$NODE_BIN" ]; then
  echo "No Node >= $MIN_MAJOR found. Astro 6 requires it (package.json pins 22.x)." >&2
  echo "Install one, e.g.: nvm install 22 && nvm alias default 22" >&2
  exit 1
fi

echo "dev: using $("$NODE_BIN" --version) at $NODE_BIN"
exec "$NODE_BIN" node_modules/astro/bin/astro.mjs dev "$@"
