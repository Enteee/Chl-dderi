/**
 * Turning a pack as it is stored into what the app works with.
 *
 * The old `prepCrag()` ran once per crag when its pack was loaded and wrote its results back into
 * the same objects -- derived fields onto the crag, and the route key, stars, length and ordinal
 * into free slots of the stored route tuple. That is replaced here by a single pass that builds new
 * objects, so the mounted data is immutable and React and Redux can rely on identity.
 */

import { bandOf, classOf } from "@core/grades";
import { fold, slug } from "@core/text";
import type { Bolting, Mappack, Park, StoredRoute, StoredSector } from "@domain/mappack";
import type { Crag, MountedData, Region, Route } from "@domain/model";

/** A confirmed ban. */
const RX_CLOSURE = /CLOSURE|nesting|banned|prohibited|not permitted|closed because|closed for/i;
/** A ban nobody has confirmed: a warning, not a closure. */
const RX_MAYBE = /unconfirmed|not confirmed|is said to apply|may apply/i;
const RX_FAMILY = /famil|children|kids|animals|pets/i;
const RX_CAUTION =
    /dangerous|abandon|outdated|old (and )?(dangerous|bolt|peg|equipment)|poorly maintained|re-bolt|restyling|dated bolt|not well bolted|sparse|weakness|rockfall|loose/i;
const RX_NEGATED = /\b(not|un\w+)\b/i;

/** Split a warning into sentences, so that one clause cannot colour the whole text. */
const sentences = (s: string): string[] => s.match(/[^.!]+[.!]*\s*/g) ?? [];

const num = (v: unknown): number | null => (typeof v === "number" ? v : null);
const str = (v: unknown): string | null => (typeof v === "string" ? v : null);

/**
 * Route keys: `<cragId>~<slug of the name>`, with `.2`, `.3`… for a name that repeats. A pack may
 * carry `rk`, the keys the routes had before the list was reordered; those win, so that favourites
 * and logbook entries stay attached to the right route.
 */
const routeKeys = (sector: StoredSector): string[] => {
    const held = new Set((sector.rk ?? []).filter((k): k is string => Boolean(k)));
    const seen = new Set<string>();
    return sector.routes.map((route, i) => {
        const kept = sector.rk?.[i];
        if (kept) {
            seen.add(kept);
            return kept;
        }
        const base = slug(route[0]) || `r${i + 1}`;
        let key = base;
        let n = 1;
        while (seen.has(key) || held.has(key)) {
            n++;
            key = `${base}.${n}`;
        }
        seen.add(key);
        return key;
    });
};

const toRoute = (stored: StoredRoute, index: number, key: string, sector: StoredSector): Route => {
    const star = sector.st?.[index] ?? null;
    return {
        name: stored[0],
        grade: stored[1],
        pitches: stored[2],
        gradeIdx: stored[3],
        key: `${sector.id}~${key}`,
        stars: star ? [star[0], star[1]] : null,
        length: sector.rl?.[index] ?? null,
        ord: index,
    };
};

/** Community stars per grade band: `[sum, rated routes]` for each of the five bands. */
const bandStarsOf = (routes: readonly Route[]): [number, number][] => {
    const bands: [number, number][] = [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
    ];
    for (const route of routes) {
        if (!route.stars || route.gradeIdx == null) continue;
        const band = bands[bandOf(route.gradeIdx)];
        if (!band) continue;
        band[0] += route.stars[0];
        band[1] += 1;
    }
    return bands;
};

export const toCrag = (sector: StoredSector, packId: string): Crag => {
    const keys = routeKeys(sector);
    const routes = sector.routes.map((stored, i) =>
        toRoute(stored, i, keys[i] ?? `r${i + 1}`, sector),
    );

    const warn = sector.warn ?? "";
    const parts = sentences(warn);
    const maybe = RX_CLOSURE.test(warn) && RX_MAYBE.test(warn);
    const aka = sector.tc && fold(sector.tc.name) !== fold(sector.name) ? sector.tc.name : null;
    const orient = sector.orient ?? [];
    const bolt: Bolting | null = sector.bolt ?? null;

    return {
        id: sector.id,
        name: sector.name,
        area: sector.area,
        routes,
        packId,

        locality: str(sector.locality),
        full: str(sector.full),
        nr: num(sector.nr),
        nrInferred: sector.nrInferred === true,
        status: sector.status ?? null,
        region: str(sector.region),
        municipality: sector.municipality ?? null,
        province: sector.province ?? null,

        coord: sector.coord ?? null,
        coordDropped: sector.coordDropped === true,
        lat: sector.coord?.lat ?? null,
        lon: sector.coord?.lon ?? null,
        alt: sector.alt ?? null,

        gmin: sector.gmin ?? null,
        gmax: sector.gmax ?? null,
        gminI: sector.gminI ?? null,
        gmaxI: sector.gmaxI ?? null,
        nRoutes: sector.nRoutes ?? null,
        nSingle: sector.nSingle ?? null,
        nMulti: sector.nMulti ?? null,
        bands: sector.bands ?? null,

        ord: sector.ord ?? null,
        secs: sector.secs ?? null,
        rate: sector.rate ?? null,

        style: str(sector.style),
        styleKey: sector.styleKey ?? null,
        rock: sector.rock ?? null,
        rockDe: sector.rockDe ?? null,
        orient,
        len: sector.len ?? null,
        lenIsMax: sector.lenIsMax === true,
        lenIsTypical: sector.lenIsTypical === true,

        season: sector.season ?? null,
        seasonDe: sector.seasonDe ?? null,
        sun: sector.sun ?? null,
        sunWhole: sector.sunWhole === true,
        rain: sector.rain ?? null,
        dry: sector.dry ?? null,
        dryHow: sector.dryHow ?? null,
        dryWhy: sector.dryWhy ?? [],
        dryNote: sector.dryNote ?? null,
        dryNoteDe: sector.dryNoteDe ?? null,
        bolt,

        pk: sector.pk ?? null,
        pkAssumed: sector.pkAssumed === true,
        pkOff: sector.pkOff ?? null,
        park: sector.park ?? null,
        parkDe: sector.parkDe ?? null,
        walk: sector.walk ?? null,
        walkDe: sector.walkDe ?? null,
        walkMin: sector.walkMin ?? null,
        walkEff: sector.walkEff ?? null,
        ap: sector.ap ?? [],

        desc: sector.desc ?? null,
        descDe: sector.descDe ?? null,
        warn: sector.warn ?? null,
        warnDe: sector.warnDe ?? null,
        rnote: sector.rnote ?? null,
        rnoteDe: sector.rnoteDe ?? null,
        family: sector.family ?? null,
        pt: sector.pt ?? null,
        guide: sector.guide ?? null,
        confidence: sector.confidence ?? null,

        tcOnly: sector.tcOnly === true,
        tc: sector.tc ?? null,
        links: sector.links ?? null,
        pics: sector.pics ?? [],

        // ---- derived
        closure: RX_CLOSURE.test(warn) && !maybe,
        caution: maybe || parts.some((p) => !RX_FAMILY.test(p) && RX_CAUTION.test(p)),
        noFamily: parts.some((p) => RX_FAMILY.test(p) && RX_NEGATED.test(p)),
        cls: classOf(sector.bands),
        aka,
        hay: fold(
            [sector.name, sector.area, sector.locality, sector.municipality, aka, sector.full].join(
                " | ",
            ),
        ),
        rhay: routes.length ? routes.map((r) => fold(r.name)) : null,
        oriKey: orient.length === 0 ? "unknown" : orient.length >= 4 ? "mixed" : null,
        lenMax: sector.len?.[1] ?? null,
        topoPic: Boolean(sector.pics?.some((p) => p[4] === "topo" || p[4] === "sketch")),
        topoLink: Boolean(sector.links && (sector.links.o || sector.links.f || sector.links.p)),
        anchor: sector.coord?.precision === "anchor",
        boltSp: bolt?.sp ?? null,
        boltC: bolt?.c ?? null,
        bandStars: sector.rate ? bandStarsOf(routes) : null,
    };
};

export const toRegion = (pack: Mappack): Region => ({
    key: pack.id,
    name: pack.name,
    fullName: pack.fullName ?? null,
    version: pack.version,
    accessed: pack.accessed ?? null,
    updated: pack.updated ?? null,
    partial: pack.partial === true,
    ch: pack.ch === true,
    text: pack.text ?? {},
    view: pack.view
        ? { center: [pack.view.center[0], pack.view.center[1]], zoom: pack.view.zoom ?? 13 }
        : null,
    bbox: pack.bbox ?? null,
    labels: pack.labels ?? [],
    outline: pack.outline ?? null,
    stats: pack.stats ?? {},
    de: pack.de ?? {},
    picSrc: pack.picSrc ?? [],
    areas: pack.areas ?? [],
    parks: pack.parks ?? {},
    n: pack.sectors.length,
});

/**
 * Mount a set of packs. Later packs do not overwrite earlier ones: a crag id may appear in only one
 * pack (tools/make-packs.sh --check enforces that for the packs in maps/), and if two loaded packs
 * ever did collide the first one wins, as it did before.
 */
export const mountPacks = (packs: readonly Mappack[]): MountedData => {
    const crags: Crag[] = [];
    const regions: Region[] = [];
    const parks: Record<string, Park> = {};
    const byId: Record<string, Crag> = {};

    for (const pack of packs) {
        regions.push(toRegion(pack));
        for (const [key, park] of Object.entries(pack.parks ?? {})) {
            if (!(key in parks)) parks[key] = park;
        }
        for (const sector of pack.sectors) {
            if (sector.id in byId) continue;
            const crag = toCrag(sector, pack.id);
            byId[crag.id] = crag;
            crags.push(crag);
        }
    }

    return { crags, regions, parks, byId };
};
