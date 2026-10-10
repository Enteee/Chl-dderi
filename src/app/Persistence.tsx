/**
 * The bridge between the store state and the device.
 *
 * Reads favourites, logbook and settings back at start, writes them on every change (debounced),
 * and listens for what another tab wrote. Filters are kept in plain localStorage, as before: they
 * are a convenience, not data worth the triple store.
 */

import { useEffect, useRef } from "react";

import { cleanFavourites, toStoredFavourites } from "@core/favourites";
import { FILTER_KEY, FILTER_KEY_V1, type StoredFilters, fromStored, toStored } from "@core/filters";
import { cleanLog } from "@core/logbook";
import { cleanPrefs } from "@core/prefs";
import { openStore } from "@core/store";

import { useData } from "./dataContext";
import { useAppDispatch, useAppSelector } from "./hooks";
import { selectFilters } from "./selectors";
import { favouritesActions } from "./slices/favouritesSlice";
import { filtersActions, fromFilters } from "./slices/filtersSlice";
import { logbookActions } from "./slices/logbookSlice";
import { prefsActions } from "./slices/prefsSlice";

const store = openStore();

/** Wait a moment before writing, so dragging a slider does not write once per pixel. */
const useDebouncedWrite = <T,>(value: T, write: (value: T) => void, ms = 350): void => {
    const first = useRef(true);
    useEffect(() => {
        if (first.current) {
            first.current = false;
            return;
        }
        const timer = setTimeout(() => write(value), ms);
        return () => clearTimeout(timer);
        // `write` is stable by construction at every call site.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, ms]);
};

export const Persistence = () => {
    const dispatch = useAppDispatch();
    const favourites = useAppSelector((s) => s.favourites);
    const entries = useAppSelector((s) => s.logbook.entries);
    const prefs = useAppSelector((s) => s.prefs);
    const filters = useAppSelector(selectFilters);
    const sort = useAppSelector((s) => s.filters.sort);
    const dir = useAppSelector((s) => s.filters.dir);
    const { crags, regions } = useData();

    // ---- read back once
    useEffect(() => {
        void (async () => {
            await store.ready;
            const [fav, log, saved] = await Promise.all([
                store.get("fav"),
                store.get("log"),
                store.get("prefs"),
            ]);
            if (fav) {
                const clean = cleanFavourites(fav);
                dispatch(
                    favouritesActions.restore({
                        crags: [...clean.c],
                        routes: [...clean.r],
                    }),
                );
            }
            if (log) dispatch(logbookActions.restore(cleanLog(log)));
            if (saved) dispatch(prefsActions.restore(cleanPrefs(saved)));
        })();

        // Another tab or window wrote something.
        store.subscribe((key, value) => {
            if (key === "fav") {
                const clean = cleanFavourites(value);
                dispatch(favouritesActions.restore({ crags: [...clean.c], routes: [...clean.r] }));
            }
            if (key === "log") dispatch(logbookActions.restore(cleanLog(value)));
            if (key === "prefs") dispatch(prefsActions.restore(cleanPrefs(value)));
        });
    }, [dispatch]);

    // ---- the filters, out of plain localStorage, once the data is there to check them against
    const restoredFilters = useRef(false);
    useEffect(() => {
        if (restoredFilters.current || !crags.length) return;
        restoredFilters.current = true;
        try {
            const raw = localStorage.getItem(FILTER_KEY);
            let stored = raw ? (JSON.parse(raw) as StoredFilters) : null;
            if (!stored) {
                // Before this there was one set per region; take the region last shown.
                const old = localStorage.getItem(FILTER_KEY_V1);
                const byRegion = old ? (JSON.parse(old) as Record<string, StoredFilters>) : null;
                if (byRegion) {
                    stored =
                        byRegion[prefs.region ?? ""] ??
                        byRegion[Object.keys(byRegion)[0] ?? ""] ??
                        null;
                }
            }
            if (!stored) return;
            const back = fromStored(stored, {
                areas: new Set(regions.flatMap((r) => r.areas.map((a) => a.name))),
                municipalities: new Set(
                    crags.map((c) => c.municipality).filter((m): m is string => !!m),
                ),
            });
            dispatch(filtersActions.restore(fromFilters(back.filters, back.sort, back.dir)));
        } catch {
            /* a filter state is a convenience; never let it stop the app */
        }
    }, [crags, regions, prefs.region, dispatch]);

    // ---- write on change
    useDebouncedWrite(favourites, (value) => {
        void store
            .set("fav", toStoredFavourites({ c: new Set(value.crags), r: new Set(value.routes) }))
            .then((result) =>
                dispatch(
                    favouritesActions.saveResult({
                        ok: result.ok,
                        verified: result.verified,
                        at: result.t,
                    }),
                ),
            );
    });

    useDebouncedWrite(entries, (value) => {
        void store.set("log", value).then((result) =>
            dispatch(
                logbookActions.saveResult({
                    ok: result.ok,
                    verified: result.verified,
                    at: result.t,
                }),
            ),
        );
    });

    useDebouncedWrite(prefs, (value) => {
        void store.set("prefs", value);
    });

    useDebouncedWrite({ filters, sort, dir }, ({ filters: f, sort: s, dir: d }) => {
        try {
            localStorage.setItem(FILTER_KEY, JSON.stringify(toStored(f, s, d)));
            localStorage.removeItem(FILTER_KEY_V1);
        } catch {
            /* a full or blocked localStorage must not break anything */
        }
    });

    return null;
};
