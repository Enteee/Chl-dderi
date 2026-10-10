#!/usr/bin/env bash
# Kletteratlas – build and check the mappacks.
#
#   tools/make-packs.sh                 rebuild what can be rebuilt, then check everything
#   tools/make-packs.sh --check         check only, write nothing
#   tools/make-packs.sh --source FILE   take the regions out of FILE (an index.html that still carries
#                                       «const D = …», i.e. a copy from before the mappacks)
#
# Two ways round, depending on where the data is:
#
#   source mode   The file given with --source (or index.html, if it still has the data) holds the regions.
#                 One pack per region is written – pack.finale.json, pack.oltre.json, pack.ow.json – and
#                 every crag is compared with the source afterwards.
#   pack mode     The packs are the data (the normal case now). Nothing is extracted; the showcase is
#                 rebuilt from pack.finale.json and all packs are checked against each other.
#
# In both ways pack.showcase.json is written and spliced into index.html between the SHOWCASE markers.
# Needs only jq and perl.
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

SRC=""
CHECK=0
while [ $# -gt 0 ]; do
  case "$1" in
    --check) CHECK=1 ;;
    --source) SRC="$2"; shift ;;
    -h|--help) sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
  shift
done

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
fail=0
say() { printf '  %-6s %s\n' "$1" "$2"; [ "$1" = "FAIL" ] && fail=1 || true; }
lines() { while IFS=$'\t' read -r a b; do say "$a" "$b"; done; }      # «ok|text» from jq, one per line

# ---------------------------------------------------------------- is the data in an app file?
konst() {                      # konst NAME FILE -> the JSON value of «const NAME = …;» on stdout
  perl -ne 'if (/^const '"$1"' = (.*?);?\s*$/) { print "$1\n"; $ok = 1; last } END { exit($ok ? 0 : 1) }' "$2"
}
MODE=pack
if [ -n "$SRC" ]; then
  konst D "$SRC" > "$TMP/D.json" || { echo "error: no 'const D = …' line in $SRC" >&2; exit 1; }
  jq -e . "$TMP/D.json" > /dev/null || { echo "error: the data in $SRC is not valid JSON" >&2; exit 1; }
  konst MUNI "$SRC" > "$TMP/MUNI.json" || echo 'null' > "$TMP/MUNI.json"
  MODE=source
# today's index.html has a «const D» too, but it is the empty registry of the app, not the data – so it
# only counts as a source when it really parses as JSON with crags in it
elif konst D index.html > "$TMP/D.json" 2>/dev/null && jq -e '(.sectors // []) | length > 0' "$TMP/D.json" > /dev/null 2>&1; then
  konst MUNI index.html > "$TMP/MUNI.json" || echo 'null' > "$TMP/MUNI.json"
  MODE=source
fi
echo "mode: $MODE"

# ---------------------------------------------------------------- what belongs to which region
# name/fullName are the app's region labels; the rest are the switches the app used to hardcode.
# Keys: id|zoom|ch|mapbg|rockMode|guideKey|statsKey|outline|labels|nameEn|nameDe|fullEn|fullDe
REGIONS=(
  "finale|13|false|italy|verrucano|finale|stats|yes|no|Finale|Finale|Finale Ligure|Finale Ligure"
  "oltre|12|false|plain|plain|oltre|statsO|no|yes|Oltrefinale|Oltrefinale|Oltrefinale|Oltrefinale"
  "ow|10|true|plain|perCrag|ow|statsW|no|no|Upper Valais|Oberwallis|Upper Valais|Oberwallis"
)
# A car park nobody links to: it stands in Borgio Verezzi, so it travels with Finale.
EXTRA_PARKS_finale='["borgio_sauro_lower"]'
# The showcase: a few Finale crags from four areas, with pictures, ratings and an approach line.
SHOWCASE_IDS='["rocca-di-perti-settore-settentrionale","rocca-di-perti-placca-piotti","monte-cucco-anfiteatro","monte-cucco-settore-centrale","valle-di-nava-bastionata-sinistra-boragni","rian-cornei-cordon-bleu"]'

# ---------------------------------------------------------------- building one pack out of the app data
# $D the whole data, $MUNI the outline, $meta one row above, $ids the crags to keep (null = the whole
# region), $extra further car park keys, $showcase true for the sample pack.
read -r -d '' PROGRAM <<'JQ' || true
def refs: [ .pk, .pkOff, ((.ap // [])[] | .pk) ] | map(select(. != null));

($D.sectors | map(select(.reg == $meta.id)) | if $ids == null then . else map(select(.id as $i | $ids | index($i))) end) as $sec
| ($sec | map(refs) | flatten | unique | . + ($extra // []) | unique
   | map(select(. as $k | $D.park | has($k)))) as $pkeys
| ($sec | map(.area) | unique) as $anames
| ($sec | map(.routes | length) | add // 0) as $nroutes
| (($sec | map(.coord) | map(select(. != null))) + ($pkeys | map($D.park[.] | {lat, lon}))) as $pts
| {
    format: "kletteratlas-mappack",
    formatVersion: 1,
    id: $meta.id,
    name: {en: $meta.nameEn, de: $meta.nameDe},
    fullName: {en: $meta.fullEn, de: $meta.fullDe},
    version: (if $showcase then $meta.accessed + "-showcase" else $meta.accessed end),
    accessed: $meta.accessed,
    updated: ([$D.updated, $meta.accessed] | map(select(. != null)) | max),
    partial: $showcase,
    ch: ($meta.ch == "true"),
    mapbg: $meta.mapbg,
    rockMode: $meta.rockMode,
    guideKey: $meta.guideKey,
    view: {
      center: [ (($pts | map(.lat) | min) + ($pts | map(.lat) | max)) / 2 | . * 1e6 | round / 1e6,
                (($pts | map(.lon) | min) + ($pts | map(.lon) | max)) / 2 | . * 1e6 | round / 1e6 ],
      zoom: ($meta.zoom | tonumber)
    },
    bbox: [ ($pts | map(.lon) | min), ($pts | map(.lat) | min), ($pts | map(.lon) | max), ($pts | map(.lat) | max) ],
    counts: {crags: ($sec | length), routes: $nroutes, areas: ($anames | length), parks: ($pkeys | length)},
    areas: ($D.areas | map(select(.reg == $meta.id and (.name as $n | $anames | index($n)))) | map(del(.reg))),
    parks: ($pkeys | map({key: ., value: $D.park[.]}) | from_entries),
    sectors: ($sec | map(del(.reg, .region)))
  }
  # the region's own extras, left out when there is nothing to say
  | (if ($sec | any(.pics != null)) then .picSrc = $D.picSrc else . end)
  | (if $meta.labels == "yes" and ($D.places | length) > 0 then .labels = $D.places else . end)
  | (if $meta.outline == "yes" and $MUNI != null and ($showcase | not) then .outline = $MUNI else . end)
  | (if $showcase then . else .stats = ($D[$meta.statsKey] // {}) end)
JQ
# the number of crags per area group, once the crags of the pack are known
AREA_N='. as $p | .areas = [ $p.areas[] as $a | $a | .n = ([ $p.sectors[] | select(.area == $a.name) ] | length) ]'

build() {                       # build ROW ids extra showcase outfile
  local row="$1" ids="$2" extra="$3" showcase="$4" out="$5"
  IFS='|' read -r id zoom ch mapbg rockMode guideKey statsKey outline labels nameEn nameDe fullEn fullDe <<< "$row"
  local accessed
  accessed="$(jq -r --arg id "$id" '.regions[] | select(.key == $id) | .accessed' "$TMP/D.json")"
  jq -c -n \
    --slurpfile D "$TMP/D.json" --slurpfile MUNI "$TMP/MUNI.json" \
    --argjson ids "$ids" --argjson extra "$extra" --argjson showcase "$showcase" \
    --argjson meta "$(jq -n \
        --arg id "$id" --arg zoom "$zoom" --arg ch "$ch" --arg mapbg "$mapbg" --arg rockMode "$rockMode" \
        --arg guideKey "$guideKey" --arg statsKey "$statsKey" --arg outline "$outline" --arg labels "$labels" \
        --arg nameEn "$nameEn" --arg nameDe "$nameDe" --arg fullEn "$fullEn" --arg fullDe "$fullDe" \
        --arg accessed "$accessed" '$ARGS.named')" \
    '($D[0]) as $D | ($MUNI[0]) as $MUNI |'"$PROGRAM" \
  | jq -c "$AREA_N" > "$out"
}

# the showcase, cut out of a finished pack (pack mode)
showcase_from_pack() {          # showcase_from_pack PACK ids outfile
  jq -c --argjson ids "$2" '
    . as $p
    | ($p.sectors | map(select(.id as $i | $ids | index($i)))) as $sec
    | ($sec | map([.pk, .pkOff, ((.ap // [])[] | .pk)] | map(select(. != null))) | flatten | unique) as $pkeys
    | ($sec | map(.area) | unique) as $anames
    | (($sec | map(.coord) | map(select(. != null))) + ($pkeys | map($p.parks[.] | {lat, lon}))) as $pts
    | $p
    | .partial = true
    | .version = ($p.accessed // $p.version) + "-showcase"
    | .sectors = $sec
    | .parks = ($pkeys | map({key: ., value: $p.parks[.]}) | from_entries)
    | .areas = ($p.areas | map(select(.name as $n | $anames | index($n))))
    | .counts = {crags: ($sec | length), routes: ($sec | map(.routes | length) | add // 0),
                 areas: ($anames | length), parks: ($pkeys | length)}
    | .view = {center: [ (($pts | map(.lat) | min) + ($pts | map(.lat) | max)) / 2 | . * 1e6 | round / 1e6,
                         (($pts | map(.lon) | min) + ($pts | map(.lon) | max)) / 2 | . * 1e6 | round / 1e6 ],
               zoom: ($p.view.zoom // 13)}
    | .bbox = [ ($pts | map(.lon) | min), ($pts | map(.lat) | min), ($pts | map(.lon) | max), ($pts | map(.lat) | max) ]
    | del(.outline, .stats)' "$1" | jq -c "$AREA_N" > "$3"
}

size() { printf '%6.1f KB' "$(echo "scale=1; $(wc -c < "$1") / 1024" | bc)"; }
show() { printf '%-20s %4d crags  %5d routes  %3d parks  %3d areas  %s\n' "$(basename "$1")" \
  "$(jq '.counts.crags' "$1")" "$(jq '.counts.routes' "$1")" "$(jq '.counts.parks' "$1")" \
  "$(jq '.counts.areas' "$1")" "$(size "$1")"; }

# ---------------------------------------------------------------- write the packs
PACKS=()
if [ "$MODE" = source ]; then
  for row in "${REGIONS[@]}"; do
    id="${row%%|*}"; extra_var="EXTRA_PARKS_$id"; extra="${!extra_var:-[]}"
    out="pack.$id.json"; [ "$CHECK" = 1 ] && out="$TMP/pack.$id.json"
    build "$row" null "$extra" false "$out"
    PACKS+=("$out"); show "$out"
  done
  SHOW="pack.showcase.json"; [ "$CHECK" = 1 ] && SHOW="$TMP/pack.showcase.json"
  build "${REGIONS[0]}" "$SHOWCASE_IDS" "[]" true "$SHOW"
else
  shopt -s nullglob
  for p in pack.*.json; do [ "$p" = "pack.showcase.json" ] && continue; PACKS+=("$p"); show "$p"; done
  [ ${#PACKS[@]} -gt 0 ] || { echo "error: no pack.*.json here, and no app file with the data either" >&2; exit 1; }
  SHOW="pack.showcase.json"; [ "$CHECK" = 1 ] && SHOW="$TMP/pack.showcase.json"
  if [ -f pack.finale.json ]; then showcase_from_pack pack.finale.json "$SHOWCASE_IDS" "$SHOW"
  elif [ -f pack.showcase.json ]; then cp pack.showcase.json "$SHOW"
  else echo "error: pack.finale.json is missing, so the showcase cannot be built" >&2; exit 1; fi
fi
show "$SHOW"

# ---------------------------------------------------------------- checks
echo "checks"
jq -s -c '.' "${PACKS[@]}" > "$TMP/all.json"

if [ "$MODE" = source ]; then      # every crag of the source data is in exactly one pack, unchanged
  jq --slurpfile src "$TMP/D.json" -r '
    ($src[0].sectors | map(del(.reg, .region)) | sort_by(.id)) as $want
    | (map(.sectors[]) | sort_by(.id)) as $have
    | if ($want | length) != ($have | length) then "FAIL|crags: \($have|length) in the packs, \($want|length) in the source"
      elif $want == $have then "ok|all \($have|length) crags identical to the source (minus reg/region)"
      else "FAIL|crag data differs: \([ range(0; $want|length) | select($want[.] != $have[.]) | $want[.].id ] | join(", "))" end' \
    "$TMP/all.json" | tr '|' '\t' | lines
  jq --slurpfile src "$TMP/D.json" -r '
    ($src[0]) as $d
    | [ (if (map(.sectors[].routes | length) | add) == ($d.sectors | map(.routes | length) | add)
         then "ok|routes: \(map(.sectors[].routes | length) | add)" else "FAIL|routes do not add up" end),
        ((map(.parks | keys) | flatten | unique) as $parks
         | if ($parks | length) == ($d.park | keys | length) then "ok|car parks: \($parks | length), none lost, none twice"
           else "FAIL|car parks: \($parks | length) of \($d.park | keys | length) – missing \((($d.park | keys) - $parks) | join(", "))" end),
        (if (map(.areas | length) | add) == ($d.areas | length) then "ok|area groups: \(map(.areas | length) | add)"
         else "FAIL|area groups: \(map(.areas | length) | add) of \($d.areas | length)" end)
      ] | .[]' "$TMP/all.json" | tr '|' '\t' | lines
fi

# every pack on its own: the format, and the references that a JSON Schema cannot follow
for p in "${PACKS[@]}" "$SHOW"; do
  jq -r --arg f "$(basename "$p")" '
    (.picSrc // [] | length) as $npic
    | [ .areas[].name ] as $areas
    | [ .parks | keys[] ] as $parks
    | [ (if .format == "kletteratlas-mappack" and .formatVersion == 1 then empty else "not a mappack of version 1" end),
        (if (.id // "") | test("^[a-z0-9][a-z0-9-]{0,31}$") then empty else "the id is not a plain name" end),
        (if (.name.en // "") != "" and (.name.de // "") != "" then empty else "the name is missing en or de" end),
        (if (.version // "") != "" then empty else "the version is missing" end),
        ([.sectors[].id] | if (unique | length) == length then empty else "crag ids appear twice" end),
        (.sectors[] | select(.area as $a | ($areas | index($a)) == null) | "the area «\(.area)» of \(.id) is not in areas"),
        (.sectors[] | [.pk, .pkOff, ((.ap // [])[] | .pk)] | map(select(. != null))[] as $k
          | select(($parks | index($k)) == null) | "the car park «\($k)» is missing"),
        (.sectors[] | select((.pics // []) | any(.[3] >= $npic)) | "a picture of \(.id) points past picSrc"),
        (if .counts.crags == (.sectors | length) then empty else "counts.crags says \(.counts.crags), there are \(.sectors | length)" end),
        (if .counts.routes == (.sectors | map(.routes | length) | add // 0) then empty
         else "counts.routes says \(.counts.routes), there are \(.sectors | map(.routes | length) | add // 0)" end),
        (if (.counts.parks // (.parks | length)) == (.parks | length) then empty else "counts.parks does not match" end)
      ] | unique
    | if length == 0 then "ok|\($f): format and references in order" else "FAIL|\($f): \(join("; "))" end' "$p" \
  | tr '|' '\t' | lines
done

# the packs among themselves: a crag belongs to one region, a region id appears once
jq -r '
  [ ([.[].id] | if (unique | length) == length then empty else "two packs share an id" end),
    ([.[].sectors[].id] | if (unique | length) == length then empty
     else "crags in more than one pack: \(([.[].sectors[].id] | group_by(.) | map(select(length > 1) | .[0]))[0:3] | join(", "))" end)
  ] | if length == 0 then "ok|the packs fit together: every crag in exactly one region" else "FAIL|\(join("; "))" end' \
  "$TMP/all.json" | tr '|' '\t' | lines

# the showcase must be a part of the Finale pack, so that loading Finale simply replaces it
if [ -f pack.finale.json ] || [ "$MODE" = source ]; then
  FIN="pack.finale.json"; [ "$MODE" = source ] && [ "$CHECK" = 1 ] && FIN="$TMP/pack.finale.json"
  jq -s -r '.[0] as $show | .[1] as $full
    | ($show.sectors | map(.id)) as $ids
    | if $show.id == $full.id and $show.partial == true
         and (($full.sectors | map(select(.id as $i | $ids | index($i))) | sort_by(.id)) == ($show.sectors | sort_by(.id)))
      then "ok|showcase: \($ids | length) crags, same id and same data as in pack.\($full.id).json"
      else "FAIL|the showcase does not match the Finale pack" end' "$SHOW" "$FIN" | tr '|' '\t' | lines
fi

[ "$fail" = 0 ] || { echo "checks failed" >&2; exit 1; }

# ---------------------------------------------------------------- the showcase goes into the app
if [ "$CHECK" = 0 ]; then
  if grep -q 'SHOWCASE:BEGIN' index.html; then
    perl -0pi -e 'BEGIN { local $/; open F, "<", "'"$SHOW"'" or die; $p = <F>; chomp $p }
      s{/\* SHOWCASE:BEGIN \*/.*?/\* SHOWCASE:END \*/}{/* SHOWCASE:BEGIN */const SHOWCASE = $p;/* SHOWCASE:END */}s' index.html
    echo "showcase spliced into index.html"
  else
    echo "note: no SHOWCASE markers in index.html – the showcase was only written to $SHOW"
  fi
fi
echo "done"
