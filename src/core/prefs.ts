/**
 * The settings, kept by the triple store under `prefs` and read once at start, so that language and
 * theme are right from the first paint.
 *
 * `packs` holds only the *description* of the installed mappacks -- id, name, version, where they
 * came from, how big they are. The data itself lives in the Cache Storage; here it would blow up
 * every save.
 */

import { type Lang, isLang } from "./lang";
import { LOG_STYLES, type LogStyle, isLogStyle } from "./logbook";

export type Theme = "auto" | "light" | "dark";
export type BaseMap = "topo" | "osm" | "sat";
export type BaseMapCh = "ch" | "chsat" | "topo";
export type RadarMode = "off" | "rv" | "dpc";

/** Where a pack came from, so that «fetch again» knows what to ask for. */
export interface PackSource {
    readonly type: "url" | "file";
    readonly url?: string;
    readonly name?: string;
}

export interface InstalledPack {
    readonly id: string;
    readonly name?: { en: string; de: string };
    readonly version?: string;
    readonly bytes?: number;
    readonly at?: number;
    readonly src?: PackSource;
}

export interface Prefs {
    lang: Lang | null;
    theme: Theme;
    base: BaseMap;
    baseCH: BaseMapCh;
    region: string | null;
    allPaths: boolean;
    radar: RadarMode;
    wx: boolean;
    allParks: boolean;
    chTrails: boolean;
    chWrz: boolean;
    logStyle: LogStyle;
    packs: InstalledPack[];
}

export const PREFS_KEY = "prefs";
/** The localStorage item the first paint reads directly, before the store has woken up. */
export const PREFS_ITEM = "finale-atlas:prefs";

export const defaultPrefs = (): Prefs => ({
    lang: null,
    theme: "auto",
    base: "topo",
    baseCH: "ch",
    region: null,
    allPaths: false,
    radar: "off",
    wx: true,
    allParks: false,
    chTrails: true,
    chWrz: false,
    logStyle: "rp",
    packs: [],
});

const ONE_OF = {
    theme: ["auto", "light", "dark"],
    base: ["topo", "osm", "sat"],
    baseCH: ["ch", "chsat", "topo"],
    radar: ["off", "rv", "dpc"],
} as const;

const FLAGS = ["allPaths", "wx", "allParks", "chTrails", "chWrz"] as const;

/** Read stored settings back, checking every value so an older version cannot break the app. */
export const cleanPrefs = (v: unknown): Prefs => {
    const prefs = defaultPrefs();
    if (!v || typeof v !== "object") return prefs;
    const x = v as Record<string, unknown>;

    if (isLang(x.lang)) prefs.lang = x.lang;
    for (const key of Object.keys(ONE_OF) as (keyof typeof ONE_OF)[]) {
        const allowed: readonly string[] = ONE_OF[key];
        if (typeof x[key] === "string" && allowed.includes(x[key] as string)) {
            (prefs as unknown as Record<string, unknown>)[key] = x[key];
        }
    }
    for (const key of FLAGS) {
        if (typeof x[key] === "boolean") prefs[key] = x[key];
    }
    if (typeof x.region === "string") prefs.region = x.region;
    if (isLogStyle(x.logStyle)) prefs.logStyle = x.logStyle;
    else if (x.logStyle != null && !LOG_STYLES.includes(x.logStyle as LogStyle))
        prefs.logStyle = "rp";
    if (Array.isArray(x.packs)) {
        prefs.packs = x.packs.filter(
            (p): p is InstalledPack =>
                Boolean(p) && typeof p === "object" && typeof (p as InstalledPack).id === "string",
        );
    }
    return prefs;
};

/**
 * The settings as the very first paint can get at them: straight out of localStorage, before the
 * asynchronous layers of the store have answered. Mirrors what the old app did inline.
 */
export const readPrefsSync = (): Prefs => {
    try {
        const raw = localStorage.getItem(PREFS_ITEM);
        if (!raw) return defaultPrefs();
        const rec = JSON.parse(raw) as { v?: unknown };
        return cleanPrefs(rec?.v);
    } catch {
        return defaultPrefs();
    }
};
