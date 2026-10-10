/**
 * What each filter option is called.
 *
 * The hand-written app labelled its options ad hoc -- `walk.le` with the number in it,
 * `style.sport`, `wx.f.dry` -- rather than by any scheme that could be derived from the option
 * value. This table keeps every one of those translations instead of inventing new ones, and it is
 * the single place that knows how an option reads.
 */

import type { TFunction } from "i18next";

import { FILTER_VALUES, type FilterKey } from "@core/filters";

type Labeller = (t: TFunction, option: string) => string;

const LABELS: Record<FilterKey, Labeller> = {
    fav: (t, o) => (o === "crags" ? t("fav.crags") : t("fav.routes")),
    star: (t, o) => t("opt.star", { 0: o }),
    log: (t, o) => (o === "todo" ? t("log.f.todo") : t("log.f.done")),
    pic: (t, o) => (o === "pic" ? t("pic.pic") : o === "topo" ? t("pic.topo") : t("opt.pic.link")),
    walk: (t, o) =>
        o === "unknown" ? t("unknown") : o === "30+" ? t("walk.gt") : t("walk.le", { 0: o }),
    count: (t, o) => t("opt.count", { 0: o }),
    style: (t, o) => (o === "sport" ? t("opt.style.sport") : t("opt.style.mixed")),
    rain: (t, o) => (o === "yes" ? t("rain.yes") : t("rain.no")),
    dry: (t, o) => (o === "fast" ? t("q.dry") : t("opt.dry.ok")),
    len: (t, o) => (o === "40+" ? t("len.gt", { 0: "40" }) : t("len.le", { 0: o })),
    wx: (t, o) => (o === "dry" ? t("wx.f.dry") : t("wx.f.ok")),
    bolt: (t, o) =>
        o === "close"
            ? t("tag.bolt.close")
            : o === "spaced"
              ? t("tag.bolt.spaced")
              : t("opt.bolt.notSpaced"),
    boltC: (t, o) => (o === "new" ? t("bolt.c.new") : t("opt.boltC.notOld")),
};

/** The label of one option of one filter. `any` is the same word everywhere. */
export const optionLabel = (t: TFunction, key: FilterKey, option: string): string =>
    option === "any" ? t("any") : LABELS[key](t, option);

/** Every (filter, option) pair, for the tests that check the labels resolve. */
export const ALL_OPTIONS: readonly (readonly [FilterKey, string])[] = (
    Object.keys(FILTER_VALUES) as FilterKey[]
).flatMap((key) => FILTER_VALUES[key].map((option) => [key, option] as const));
