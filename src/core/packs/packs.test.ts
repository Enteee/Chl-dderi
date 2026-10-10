import { describe, expect, it } from "vitest";

import type { Mappack } from "@domain/mappack";

import finale from "../../../maps/pack.finale.json";
import oltre from "../../../maps/pack.oltre.json";
import ow from "../../../maps/pack.ow.json";
import showcase from "../../../maps/pack.showcase.json";

import { mountPacks, toCrag } from "./mount";
import { checkPack } from "./validate";

const packs = { finale, oltre, ow, showcase } as unknown as Record<string, Mappack>;

describe("checkPack against the real mappacks", () => {
    it.each(Object.keys(packs))("accepts maps/pack.%s.json", async (name) => {
        const result = await checkPack(packs[name]);
        if (!result.ok) console.error(name, result.problems);
        expect(result.ok).toBe(true);
    });

    it("says plainly when the JSON is not a mappack at all", async () => {
        expect(await checkPack(null)).toMatchObject({ ok: false });
        expect(await checkPack([1, 2, 3])).toMatchObject({ ok: false });
        expect(await checkPack("a string")).toMatchObject({ ok: false });

        const notAPack = await checkPack({ hello: "world" });
        expect(notAPack.ok).toBe(false);
        if (!notAPack.ok) {
            expect(notAPack.problems).toHaveLength(1);
            expect(notAPack.problems[0]?.where).toBe("/format");
        }
    });

    it("rejects a pack of a future format version on its own terms", async () => {
        const result = await checkPack({ ...packs.finale, formatVersion: 2 });
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.problems[0]?.where).toBe("/formatVersion");
    });

    it("reports the field that is wrong, with its path", async () => {
        const broken = structuredClone(packs.showcase) as Mappack;
        // @ts-expect-error -- deliberately breaking the data
        delete broken.sectors[0].name;
        const result = await checkPack(broken);
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.problems.some((p) => p.where === "/sectors/0")).toBe(true);
            expect(result.problems.some((p) => p.message.includes("name"))).toBe(true);
        }
    });

    it("lets a pack carry fields it does not know, so an older app can ignore them", async () => {
        const result = await checkPack({
            ...packs.showcase,
            somethingNewerPacksCarry: { nested: [1, 2, 3] },
        });
        expect(result.ok).toBe(true);
    });
});

describe("mounting the real mappacks", () => {
    const mounted = mountPacks([packs.finale!, packs.oltre!, packs.ow!]);

    it("mounts every crag of every pack exactly once", () => {
        const expected =
            packs.finale!.sectors.length + packs.oltre!.sectors.length + packs.ow!.sectors.length;
        expect(mounted.crags).toHaveLength(expected);
        expect(Object.keys(mounted.byId)).toHaveLength(expected);
        expect(mounted.regions.map((r) => r.key)).toEqual(["finale", "oltre", "ow"]);
    });

    it("agrees with the counts the packs state", () => {
        for (const pack of [packs.finale!, packs.oltre!, packs.ow!]) {
            const region = mounted.regions.find((r) => r.key === pack.id);
            expect(region?.n).toBe(pack.counts?.crags);
        }
        const routes = mounted.crags.reduce((n, c) => n + c.routes.length, 0);
        const stated =
            (packs.finale!.counts?.routes ?? 0) +
            (packs.oltre!.counts?.routes ?? 0) +
            (packs.ow!.counts?.routes ?? 0);
        expect(routes).toBe(stated);
    });

    it("gives every route a unique, stable key", () => {
        for (const crag of mounted.crags) {
            const keys = crag.routes.map((r) => r.key);
            expect(new Set(keys).size, `duplicate route key in ${crag.id}`).toBe(keys.length);
            for (const key of keys) expect(key.startsWith(`${crag.id}~`)).toBe(true);
        }
    });

    it("resolves every car park and area group a crag refers to", () => {
        for (const crag of mounted.crags) {
            const region = mounted.regions.find((r) => r.key === crag.packId)!;
            for (const key of [crag.pk, crag.pkOff, ...crag.ap.map((a) => a.pk)]) {
                if (key == null) continue;
                expect(mounted.parks[key], `${crag.id} -> park ${key}`).toBeDefined();
            }
            expect(
                region.areas.some((a) => a.name === crag.area),
                `${crag.id} -> area ${crag.area}`,
            ).toBe(true);
        }
    });

    it("keeps the keys a pack pinned in rk, so logbook entries stay attached", () => {
        const withRk = packs.ow!.sectors.find((s) => s.rk?.some(Boolean));
        expect(withRk, "no pack carries rk").toBeDefined();
        const crag = toCrag(withRk!, "ow");
        withRk!.rk!.forEach((kept, i) => {
            if (kept) expect(crag.routes[i]?.key).toBe(`${withRk!.id}~${kept}`);
        });
    });

    it("derives the fields prepCrag used to assign in place", () => {
        const crag = mounted.byId["rocca-di-perti-placca-piotti"] ?? mounted.crags[0]!;
        expect(crag.hay).toBe(crag.hay.toLowerCase());
        expect(crag.cls).toMatch(/^(easy|mid|hard|unk)$/);
        expect(crag.rhay?.length ?? 0).toBe(crag.routes.length);
        if (crag.orient.length === 0) expect(crag.oriKey).toBe("unknown");
        if (crag.orient.length >= 4) expect(crag.oriKey).toBe("mixed");
    });

    it("does not mutate the stored packs", () => {
        const before = JSON.stringify(packs.showcase!.sectors[0]!.routes[0]);
        mountPacks([packs.showcase!]);
        expect(JSON.stringify(packs.showcase!.sectors[0]!.routes[0])).toBe(before);
    });
});
