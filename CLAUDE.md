# Kletteratlas

A climbing-crag atlas as an offline-first PWA. German interface (Swiss spelling: **ss**, never **ß**),
English as the second language. Deployed to GitHub Pages at <https://enteee.github.io/Chl-dderi/>.

## The things that will bite you

- **`index.html`, `sw.js` and `assets/` at the repository root are build output.** They are
  committed on purpose, so that the deployed bytes stay reviewable and the flat Pages deploy keeps
  working — but never edit them. Edit `src/`, run `build`. The `build-current` git hook rebuilds
  before every commit and reports modified files when what is committed has gone stale.

- **`maps/` is deliberately not published.** A mappack is not part of the app; whoever offers one
  hosts it themselves and the viewer enters its address. Do not "fix" `pages.yml` to copy it. The
  dev server *does* serve it, so that a pack can be loaded from a URL locally.

- **The storage names are load-bearing.** `finale-atlas` (namespace), `finale-atlas-user` and
  `finale-atlas-packs` (caches), `finale-atlas:prefs`, `finale-atlas-filters-v2` (items). People
  have favourites and logbooks on their devices under those names. Renaming any of them hides
  their data. The app is called Kletteratlas; the storage keeps its former working name.

- **Nothing from a mappack ever becomes HTML.** `src/core/text.ts` parses the mini-markdown a pack
  may use (`**bold**`, `[label](https://…)` — `http(s)` only) into tokens, and
  `src/features/packs/PackText.tsx` renders them as React children. The tests there are a security
  control, not a nicety.

- **`mappack.schema.json` is the single source of truth** for what a pack may look like. It is
  published, and other people's packs point at its `$id`, so do not reformat it — Prettier is
  scoped away from it for that reason. `src/types/mappack.ts` mirrors it by hand (a generator
  cannot express its `prefixItems` tuples) and `src/types/mappack.coverage.test.ts` fails if the
  two drift apart. `src/core/packs/validate.ts` compiles the same schema with Ajv at runtime.

- **The schema is open on purpose** (`additionalProperties: true`): an older app has to be able to
  ignore fields it does not know. Ajv therefore does not run in strict mode.

- **Version numbers are not in the bundle.** The deploy writes `version.json`; the app reads it.
  That keeps the build reproducible, which is what makes the committed output checkable.

- **German is not spell-checked.** `typos` has no German dictionary and flags ordinary words, so
  `devenv.nix` excludes `README.md`, `src/i18n/de.json` and the data. Keep new German text out of
  files that are checked, or add the file to that list.

## Working on it

```sh
direnv allow    # or: devenv shell
devenv-help     # dev, build, test, lint, serve, check-packs, make-packs
```

`lint` runs every git hook over the whole repository — that is also exactly what CI runs
(`devenv shell -- lint`, not `devenv test`: `devenv test` swallows the failing hook's output).

Translation keys: use the ones that exist. `src/i18n/keys.test.ts` reads the keys out of the source
and fails on any that no language has, including both arms of a ternary.

## Layout

```text
src/core/      logic with no UI: packs, filters, grades, logbook, the triple store — all tested
src/types/     mappack.ts mirrors the schema; model.ts is the shape the app works with
src/features/  the UI by subject: map, list, crag, logbook, favourites, packs, more, know
src/app/       Redux for the viewer's state; a context for the mounted packs (large, immutable)
src/i18n/      767 interface keys in English and German
tools/         make-packs.sh and validate-packs.sh (the pack authority), build helpers, serve.pl
```

A pack stores a route as a four-item tuple and leaves the rest to the app. `src/core/packs/mount.ts`
turns that into named, immutable objects in one pass — including the route key
(`<cragId>~<slug>`), which is what favourites and logbook entries hang off, so they survive a pack
being unloaded and a route list being reordered.
