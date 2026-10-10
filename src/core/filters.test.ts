import { describe, expect, it } from "vitest";

import type { Mappack } from "@domain/mappack";
import type { Crag } from "@domain/model";

import finale from "../../maps/pack.finale.json";
import ow from "../../maps/pack.ow.json";

import {
    activeCount,
    applyFilters,
    emptyFilters,
    type FilterContext,
    fromStored,
    gradeActive,
    judge,
    routeFilterOn,
    routeOk,
    toStored,
} from "./filters";
import { GRADE_HI, GRADE_LO, gradeIdx } from "./grades";
import { mountPacks } from "./packs/mount";

const mounted = mountPacks([finale as unknown as Mappack, ow as unknown as Mappack]);
const crags = mounted.crags;

const ctx: FilterContext = {
    favCrags: new Set(),
    favRoutes: new Set(),
    sent: new Set(),
    areaIndex: Object.fromEntries(
        mounted.regions.flatMap((r) => r.areas.map((a, i) => [a.name, i] as const)),
    ),
};

describe("the default filters", () => {
    it("show every crag", () => {
        const shown = applyFilters(crags, emptyFilters(), "area", 1, ctx);
        expect(shown).toHaveLength(crags.length);
    });

    it("count as nothing set", () => {
        expect(activeCount(emptyFilters())).toBe(0);
        expect(gradeActive(emptyFilters())).toBe(false);
        expect(routeFilterOn(emptyFilters())).toBe(false);
    });
});

describe("the grade filter", () => {
    it("narrows to crags that really have a route in range", () => {
        const f = { ...emptyFilters(), gmin: gradeIdx("8a")!, gmax: GRADE_HI };
        expect(gradeActive(f)).toBe(true);
        const shown = applyFilters(crags, f, "area", 1, ctx);
        expect(shown.length).toBeGreaterThan(0);
        expect(shown.length).toBeLessThan(crags.length);
        for (const { crag, inCount } of shown) {
            if (!crag.routes.length) continue;
            expect(inCount).toBeGreaterThan(0);
            expect(crag.routes.some((r) => r.gradeIdx != null && r.gradeIdx >= f.gmin)).toBe(true);
        }
    });

    it("judges a crag with no route list on what it says about itself", () => {
        const listless = crags.find((c) => !c.routes.length && c.gminI != null);
        expect(listless, "no crag without a route list").toBeDefined();
        const inRange = {
            ...emptyFilters(),
            gmin: listless!.gminI!,
            gmax: Math.min(GRADE_HI, (listless!.gmaxI ?? listless!.gminI!) + 1),
        };
        expect(judge(listless!, inRange, ctx)).not.toBeNull();
        const outOfRange = { ...emptyFilters(), gmin: GRADE_HI, gmax: GRADE_HI };
        expect(judge(listless!, outOfRange, ctx)).toBeNull();
    });

    it("drops a route whose grade the app does not know", () => {
        const f = { ...emptyFilters(), gmin: gradeIdx("6a")!, gmax: gradeIdx("6c+")! };
        const unknown = {
            name: "x",
            grade: "?",
            pitches: null,
            gradeIdx: null,
            key: "k",
            stars: null,
            length: null,
            ord: 0,
        };
        expect(routeOk(unknown, f, ctx)).toBe(false);
    });
});

describe("the minimum-matches filter", () => {
    it("asks for that many matching routes", () => {
        const base = { ...emptyFilters(), gmin: gradeIdx("6a")!, gmax: gradeIdx("6c+")! };
        const one = applyFilters(crags, { ...base, minIn: 1 }, "area", 1, ctx);
        const ten = applyFilters(crags, { ...base, minIn: 10 }, "area", 1, ctx);
        expect(ten.length).toBeLessThan(one.length);
        for (const m of ten) {
            if (m.crag.routes.length) expect(m.inCount).toBeGreaterThanOrEqual(10);
        }
    });
});

describe("the search text", () => {
    it("matches the crag's own names", () => {
        const crag = crags[0]!;
        const shown = applyFilters(crags, { ...emptyFilters(), q: crag.name }, "area", 1, ctx);
        expect(shown.some((m) => m.crag.id === crag.id)).toBe(true);
    });

    it("falls back to route names and says so", () => {
        const withRoutes = crags.find((c) => c.routes.length > 3)!;
        const routeName = withRoutes.routes[0]!.name;
        const shown = applyFilters(crags, { ...emptyFilters(), q: routeName }, "area", 1, ctx);
        const hit = shown.find((m) => m.crag.id === withRoutes.id);
        expect(hit).toBeDefined();
        // routeHit is only set when the crag's own names did not match.
        if (!withRoutes.hay.includes(routeName.toLowerCase())) {
            expect(hit!.routeHit).toBe(true);
        }
    });

    it("ignores accents and case", () => {
        const accented = crags.find((c) => /[àáâéèêìíîòóôùúû]/i.test(c.name));
        if (!accented) return;
        const plain = accented.name.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
        const shown = applyFilters(crags, { ...emptyFilters(), q: plain }, "area", 1, ctx);
        expect(shown.some((m) => m.crag.id === accented.id)).toBe(true);
    });

    it("finds nothing for nonsense", () => {
        expect(applyFilters(crags, { ...emptyFilters(), q: "zzzqqqxxx" }, "area", 1, ctx)).toEqual(
            [],
        );
    });
});

describe("the safety filters", () => {
    it("hide closures, cautions and the not-for-families crags", () => {
        for (const key of ["hideClosure", "hideCaution", "hideNoFamily"] as const) {
            const field =
                key === "hideClosure" ? "closure" : key === "hideCaution" ? "caution" : "noFamily";
            const shown = applyFilters(crags, { ...emptyFilters(), [key]: true }, "area", 1, ctx);
            expect(shown.every((m) => !m.crag[field as keyof Crag])).toBe(true);
        }
    });

    it("onlyMapped drops crags with no position and those pinned to a car park", () => {
        const shown = applyFilters(crags, { ...emptyFilters(), onlyMapped: true }, "area", 1, ctx);
        expect(shown.every((m) => m.crag.coord && !m.crag.anchor)).toBe(true);
        expect(shown.length).toBeLessThan(crags.length);
    });
});

describe("favourites and the logbook", () => {
    it("narrow to favourite crags", () => {
        const favCrags = new Set([crags[0]!.id, crags[5]!.id]);
        const shown = applyFilters(crags, { ...emptyFilters(), fav: "crags" }, "area", 1, {
            ...ctx,
            favCrags,
        });
        expect(shown.map((m) => m.crag.id).sort()).toEqual([...favCrags].sort());
    });

    it("separate what is still open from what is done", () => {
        const crag = crags.find((c) => c.routes.length > 2)!;
        const sent = new Set([crag.routes[0]!.key]);
        const local = { ...ctx, sent };
        const done = judge(crag, { ...emptyFilters(), log: "done" }, local);
        expect(done?.inCount).toBe(1);
        const todo = judge(crag, { ...emptyFilters(), log: "todo" }, local);
        expect(todo?.inCount).toBe(crag.routes.length - 1);
    });
});

describe("sorting", () => {
    it("reverses the order of the values with the direction", () => {
        // Ties keep their ascending-by-name order either way round, as they did in the old app --
        // two crags really are both called «Il Castello» -- so the values reverse, not the ids.
        const up = applyFilters(crags, emptyFilters(), "name", 1, ctx).map((m) =>
            m.crag.name.toLowerCase(),
        );
        const down = applyFilters(crags, emptyFilters(), "name", -1, ctx).map((m) =>
            m.crag.name.toLowerCase(),
        );
        expect(down).toEqual([...up].reverse());
    });

    it("puts crags without a value last, whichever way round", () => {
        for (const dir of [1, -1] as const) {
            const shown = applyFilters(crags, emptyFilters(), "walk", dir, ctx);
            const firstMissing = shown.findIndex((m) => m.crag.walkEff == null);
            if (firstMissing < 0) continue;
            expect(shown.slice(firstMissing).every((m) => m.crag.walkEff == null)).toBe(true);
        }
    });

    it("sorts by walking time as a number", () => {
        const shown = applyFilters(crags, emptyFilters(), "walk", 1, ctx)
            .map((m) => m.crag.walkEff)
            .filter((v): v is number => v != null);
        expect(shown).toEqual([...shown].sort((a, b) => a - b));
    });
});

describe("storing the filter state", () => {
    const restoreCtx = {
        areas: new Set(crags.map((c) => c.area)),
        municipalities: new Set(crags.map((c) => c.municipality).filter((m): m is string => !!m)),
    };

    it("round-trips", () => {
        const f = {
            ...emptyFilters(),
            gmin: gradeIdx("6a")!,
            gmax: gradeIdx("7a")!,
            star: "4" as const,
            orient: new Set(["N", "mixed"]),
            minIn: 3,
            hideClosure: true,
            area: crags[0]!.area,
        };
        const back = fromStored(toStored(f, "name", -1), restoreCtx);
        expect(back.filters.gmin).toBe(f.gmin);
        expect(back.filters.gmax).toBe(f.gmax);
        expect(back.filters.star).toBe("4");
        expect([...back.filters.orient].sort()).toEqual(["N", "mixed"]);
        expect(back.filters.minIn).toBe(3);
        expect(back.filters.hideClosure).toBe(true);
        expect(back.filters.area).toBe(f.area);
        expect(back.sort).toBe("name");
        expect(back.dir).toBe(-1);
    });

    it("stores grades by name, so the ladder may grow", () => {
        const stored = toStored({ ...emptyFilters(), gmin: gradeIdx("6a")! }, "area", 1);
        expect(stored.F?.gmin).toBe("6a");
    });

    it("keeps its defaults for anything it does not recognise", () => {
        const back = fromStored(
            {
                F: {
                    star: "nonsense",
                    gmin: "Z9",
                    gmax: "Z9",
                    minIn: 999,
                    orient: ["N", "NOT_A_DIRECTION", 42],
                    area: "no such area",
                    muni: "no such municipality",
                    hideClosure: "yes",
                },
                sort: "no-such-sort",
                dir: 7,
            },
            restoreCtx,
        );
        expect(back.filters.star).toBe("any");
        expect(back.filters.gmin).toBe(GRADE_LO);
        expect(back.filters.gmax).toBe(GRADE_HI);
        expect(back.filters.minIn).toBe(1);
        expect([...back.filters.orient]).toEqual(["N"]);
        expect(back.filters.area).toBe("");
        expect(back.filters.muni).toBe("");
        expect(back.filters.hideClosure).toBe(false);
        expect(back.sort).toBe("area");
        expect(back.dir).toBe(1);
    });

    it("never restores «nearest to me», which needs a fresh location", () => {
        expect(fromStored({ sort: "me", F: {} }, restoreCtx).sort).toBe("area");
    });

    it("drops an area or municipality the loaded packs do not have", () => {
        const back = fromStored({ F: { area: "Atlantis", muni: "Atlantis" } }, restoreCtx);
        expect(back.filters.area).toBe("");
        expect(back.filters.muni).toBe("");
    });

    it("survives nothing at all", () => {
        expect(fromStored(null, restoreCtx).filters).toEqual(emptyFilters());
        expect(fromStored({}, restoreCtx).sort).toBe("area");
    });
});
