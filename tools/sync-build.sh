#!/usr/bin/env bash
# Kletteratlas – put the built app where the deploy publishes it: the repository root.
#
#   tools/sync-build.sh
#
# .github/workflows/pages.yml publishes the web files that lie at the top level, so that is where
# index.html, sw.js and assets/ have to be. They are built into dist/ and copied here, and they are
# committed: the deployed bytes stay reviewable, and the flat folder keeps working.
#
# assets/ is emptied first. The file names carry a hash of their contents, so a changed file arrives
# under a new name and the old one would otherwise lie around for ever.
#
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

if [[ ! -f dist/index.html ]]; then
  echo "error: dist/index.html is missing – run the build first" >&2
  exit 1
fi

rm -rf assets
mkdir -p assets

cp dist/index.html index.html
cp dist/sw.js sw.js
# Workbox writes its runtime next to the service worker.
shopt -s nullglob
for extra in dist/workbox-*.js; do
  cp "${extra}" "$(basename "${extra}")"
done
cp -R dist/assets/. assets/

files="$(find assets -type f | wc -l)"
printf 'synced: index.html, sw.js, assets/ (%s files)\n' "${files// /}"
