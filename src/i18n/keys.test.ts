import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { LOG_STYLES } from "@core/logbook";
import { ALL_OPTIONS, optionLabel } from "@features/list/filterLabels";

import de from "./de.json";
import en from "./en.json";

import { createI18n } from "./index";

/**
 * Every key the interface asks for has to exist, or the viewer sees `f.title` instead of
 * «Filters». Nothing in the type system catches that, so this test does: it reads the keys out of
 * the source and checks them against both languages.
 */

const SRC = "src";

const sourceFiles = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const file = join(dir, entry.name);
        if (entry.isDirectory()) return sourceFiles(file);
        return /\.tsx?$/.test(entry.name) && !/\.test\./.test(entry.name) ? [file] : [];
    });

/**
 * Every string literal that appears inside a `t(...)` call -- including the arms of a ternary, as
 * in `t(isFav ? "fav.t.rm" : "fav.t.add")`, which a pattern anchored to the opening paren misses.
 * Keys built by joining a value are checked separately below.
 */
const literalKeys = (): Map<string, string[]> => {
    const found = new Map<string, string[]>();
    // `t(` and then everything up to the matching paren, allowing one level of nesting.
    const calls = /\bt\(((?:[^()"]|"[^"]*")*(?:\(((?:[^()"]|"[^"]*")*)\)(?:[^()"]|"[^"]*")*)*)\)/g;
    // A key looks like `one.two` or a bare lower-case word, never a sentence or a URL.
    const keyish = /^[a-z][\w+-]*(?:\.[\w+-]+)*$/;

    for (const file of sourceFiles(SRC)) {
        const text = readFileSync(file, "utf8");
        for (const call of text.matchAll(calls)) {
            for (const literal of (call[1] ?? "").matchAll(/"([^"\n]+)"/g)) {
                const key = literal[1]!;
                if (!keyish.test(key)) continue;
                found.set(key, [...(found.get(key) ?? []), file]);
            }
        }
    }
    return found;
};

describe("every key the interface asks for exists", () => {
    it("in English", () => {
        const missing = [...literalKeys()]
            .filter(([key]) => !(key in en))
            .map(([key, files]) => `${key} (${files.join(", ")})`);
        expect(missing).toEqual([]);
    });

    it("in German", () => {
        const missing = [...literalKeys()].filter(([key]) => !(key in de)).map(([key]) => key);
        expect(missing).toEqual([]);
    });
});

describe("the keys built from a value also exist", () => {
    const i18n = createI18n("en");

    it("for every filter option", () => {
        for (const [key, option] of ALL_OPTIONS) {
            const label = optionLabel(i18n.t, key, option);
            expect(label, `${key}/${option}`).not.toBe("");
            // A key that is missing comes back as the key itself.
            expect(label, `${key}/${option}`).not.toMatch(/^[a-z]+(\.[a-zA-Z+]+)+$/);
        }
    });

    it("for every logbook style", () => {
        for (const style of LOG_STYLES) {
            expect(`st.${style}` in en, `st.${style}`).toBe(true);
        }
    });

    it("for the bolting words a crag can carry", () => {
        for (const spacing of ["close", "good", "part", "spaced"]) {
            expect(`tag.bolt.${spacing}` in en).toBe(true);
        }
        for (const condition of ["new", "old", "part"]) {
            expect(`bolt.c.${condition}` in en).toBe(true);
        }
    });

    it("for every sort order", () => {
        for (const sort of [
            "area",
            "name",
            "match",
            "gmin",
            "gmax",
            "n",
            "walk",
            "len",
            "orient",
            "rate",
            "me",
            "nr",
        ]) {
            expect(`sort.${sort}` in en, `sort.${sort}`).toBe(true);
        }
    });

    it("for the grade scales of the converter", () => {
        for (const scale of ["fr", "uiaa", "yds", "uk", "aus", "sax", "fin"]) {
            expect(`cv.${scale}` in en, `cv.${scale}`).toBe(true);
        }
    });
});
