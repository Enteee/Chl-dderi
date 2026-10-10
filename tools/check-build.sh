#!/usr/bin/env bash
# Kletteratlas – is the committed app the one the sources build?
#
#   tools/check-build.sh
#
# Runs the build and syncs it into the repository root. When that changes anything, the files that
# are committed were stale: the hook then reports "files were modified by this hook", exactly as the
# formatting hooks do, and the fresh output is there to be added to the commit.
#
# This is what makes it safe to commit build output: it cannot drift from the sources unnoticed.
#
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

./node_modules/.bin/tsc
./node_modules/.bin/tsc --project tsconfig.node.json
./node_modules/.bin/vite build
./tools/sync-build.sh
