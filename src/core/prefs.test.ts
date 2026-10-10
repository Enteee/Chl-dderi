import { beforeEach, describe, expect, it } from "vitest";

import { PREFS_ITEM, cleanPrefs, defaultPrefs, readPrefsSync } from "./prefs";

describe("cleanPrefs", () => {
    it("falls back to the defaults for nothing at all", () => {
        expect(cleanPrefs(null)).toEqual(defaultPrefs());
        expect(cleanPrefs("nope")).toEqual(defaultPrefs());
        expect(cleanPrefs(42)).toEqual(defaultPrefs());
    });

    it("takes the values it recognises", () => {
        const prefs = cleanPrefs({
            lang: "de",
            theme: "dark",
            base: "osm",
            baseCH: "chsat",
            region: "ow",
            radar: "rv",
            wx: false,
            chWrz: true,
            logStyle: "os",
        });
        expect(prefs.lang).toBe("de");
        expect(prefs.theme).toBe("dark");
        expect(prefs.base).toBe("osm");
        expect(prefs.baseCH).toBe("chsat");
        expect(prefs.region).toBe("ow");
        expect(prefs.radar).toBe("rv");
        expect(prefs.wx).toBe(false);
        expect(prefs.chWrz).toBe(true);
        expect(prefs.logStyle).toBe("os");
    });

    it("ignores values it does not recognise", () => {
        const prefs = cleanPrefs({
            lang: "fr",
            theme: "neon",
            base: "moon",
            radar: 7,
            wx: "yes",
            logStyle: "flash",
        });
        const d = defaultPrefs();
        expect(prefs.lang).toBe(d.lang);
        expect(prefs.theme).toBe(d.theme);
        expect(prefs.base).toBe(d.base);
        expect(prefs.radar).toBe(d.radar);
        expect(prefs.wx).toBe(d.wx);
        expect(prefs.logStyle).toBe("rp");
    });

    it("keeps only pack descriptions that have an id", () => {
        const prefs = cleanPrefs({
            packs: [{ id: "ow", version: "1" }, null, 42, { version: "no id" }],
        });
        expect(prefs.packs).toEqual([{ id: "ow", version: "1" }]);
    });
});

describe("readPrefsSync", () => {
    beforeEach(() => localStorage.clear());

    it("reads the item the first paint depends on", () => {
        localStorage.setItem(PREFS_ITEM, JSON.stringify({ v: { lang: "de", theme: "dark" } }));
        const prefs = readPrefsSync();
        expect(prefs.lang).toBe("de");
        expect(prefs.theme).toBe("dark");
    });

    it("never throws on rubbish, so the first paint cannot fail", () => {
        localStorage.setItem(PREFS_ITEM, "{not json");
        expect(readPrefsSync()).toEqual(defaultPrefs());
        localStorage.removeItem(PREFS_ITEM);
        expect(readPrefsSync()).toEqual(defaultPrefs());
    });
});
