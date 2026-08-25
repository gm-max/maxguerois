#!/usr/bin/env bash
# Run an Astro command on a Node that Astro actually supports.
#
# package.json pins "node": "22.x" and Astro 6 hard-requires >=22.12, but the
# `astro` bin carries a `#!/usr/bin/env node` shebang, so it inherits whatever
# Node is first on PATH. On this machine that is v20.19.1 and every astro command
# dies with "Node.js v20.19.1 is not supported by Astro!".
#
# This was first fixed for `dev` only, which left `build` and `preview` broken:
# the CSP guard would pass and then the build itself would fail one line later.
# All three go through here now.
#
#   scripts/with-node.sh dev --port 4321
#   scripts/with-node.sh build
set -euo pipefail
cd "$(dirname "$0")/.."

MIN_MAJOR=22
node_major() { "$1" -e 'process.stdout.write(String(process.versions.node.split(".")[0]))' 2>/dev/null || echo 0; }

NODE_BIN=""
if command -v node >/dev/null 2>&1 && [ "$(node_major node)" -ge "$MIN_MAJOR" ]; then
  NODE_BIN="$(command -v node)"
else
  # Highest v22+ under nvm. `sort -V` then `tail -1` rather than `sort | tac`:
  # tac is GNU-only, so on a clean macOS the fallback branch (the entire reason
  # this script exists) silently produced an empty list and reported no Node.
  for candidate in $(ls -1 "$HOME/.nvm/versions/node" 2>/dev/null | sed 's/^v//' | sort -V); do
    bin="$HOME/.nvm/versions/node/v$candidate/bin/node"
    [ -x "$bin" ] && [ "$(node_major "$bin")" -ge "$MIN_MAJOR" ] && NODE_BIN="$bin"
  done
fi

if [ -z "$NODE_BIN" ]; then
  echo "No Node >= $MIN_MAJOR found. Astro 6 requires it (package.json pins 22.x)." >&2
  echo "Install one, e.g.: nvm install 22 && nvm alias default 22" >&2
  exit 1
fi

echo "astro: using $("$NODE_BIN" --version) at $NODE_BIN" >&2
exec "$NODE_BIN" node_modules/astro/bin/astro.mjs "$@"
