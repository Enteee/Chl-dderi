/**
 * Where an installed mappack lives: the Cache Storage, under `finale-atlas-packs`.
 *
 * The name is load-bearing -- packs people have already installed are in there -- and so is the
 * fact that the service worker leaves this cache alone: the app manages it itself, which is why
 * `pack*.json` and `version.json` are kept out of the precache manifest (see vite.config.ts).
 */

import type { Mappack } from "@domain/mappack";

import { type PackCheck, checkPack } from "./validate";

export const PACK_CACHE = "finale-atlas-packs";

/** `^[a-z0-9][a-z0-9-]{0,31}$` -- an id has to be a plain lower-case name. */
export const PACK_ID = /^[a-z0-9][a-z0-9-]{0,31}$/;

/** A key inside the cache only; it is not an address anyone can fetch. */
const cacheKey = (id: string): string => `pack/${encodeURIComponent(id)}.json`;

const openCache = async (): Promise<Cache | null> => {
    try {
        return await caches.open(PACK_CACHE);
    } catch {
        return null;
    }
};

export const storePack = async (id: string, text: string): Promise<boolean> => {
    const cache = await openCache();
    if (!cache) return false;
    try {
        await cache.put(
            cacheKey(id),
            new Response(text, { headers: { "Content-Type": "application/json" } }),
        );
        return true;
    } catch {
        return false;
    }
};

export const readStoredPack = async (id: string): Promise<unknown> => {
    const cache = await openCache();
    if (!cache) return null;
    try {
        const hit = await cache.match(cacheKey(id));
        return hit ? ((await hit.json()) as unknown) : null;
    } catch {
        return null;
    }
};

export const forgetPack = async (id: string): Promise<void> => {
    const cache = await openCache();
    if (!cache) return;
    try {
        await cache.delete(cacheKey(id));
    } catch {
        /* nothing to do: the pack is simply still there */
    }
};

export type PackLoad =
    | { readonly ok: true; readonly pack: Mappack; readonly bytes: number }
    | { readonly ok: false; readonly problems: readonly { where: string; message: string }[] };

const fromCheck = (check: PackCheck, bytes: number): PackLoad =>
    check.ok ? { ok: true, pack: check.pack, bytes } : { ok: false, problems: check.problems };

/** Read one back out of the cache and check it again -- it may have been written long ago. */
export const loadStoredPack = async (id: string): Promise<PackLoad> => {
    const value = await readStoredPack(id);
    if (value == null) {
        return { ok: false, problems: [{ where: "", message: "is not in the cache" }] };
    }
    const text = JSON.stringify(value);
    return fromCheck(await checkPack(value), text.length);
};

/** Fetch a pack from an address, check it, and keep the text so it can be stored unchanged. */
export const fetchPack = async (
    url: string,
    signal?: AbortSignal,
): Promise<PackLoad & { readonly text?: string }> => {
    let text: string;
    try {
        const response = await fetch(url, { signal, cache: "no-store" });
        if (!response.ok) {
            return {
                ok: false,
                problems: [
                    { where: "", message: `could not be fetched (HTTP ${response.status})` },
                ],
            };
        }
        text = await response.text();
    } catch (error) {
        const message = error instanceof Error ? error.message : "could not be fetched";
        return { ok: false, problems: [{ where: "", message }] };
    }

    let value: unknown;
    try {
        value = JSON.parse(text);
    } catch {
        return { ok: false, problems: [{ where: "", message: "is not valid JSON" }] };
    }
    return { ...fromCheck(await checkPack(value), text.length), text };
};

/** The same, from a file the viewer picked. */
export const readPackFile = async (file: File): Promise<PackLoad & { readonly text?: string }> => {
    let text: string;
    try {
        text = await file.text();
    } catch {
        return { ok: false, problems: [{ where: "", message: "could not be read" }] };
    }
    let value: unknown;
    try {
        value = JSON.parse(text);
    } catch {
        return { ok: false, problems: [{ where: "", message: "is not valid JSON" }] };
    }
    return { ...fromCheck(await checkPack(value), text.length), text };
};

/** What is remembered about an installed pack, without its data. */
export const packNote = (
    pack: Mappack,
    source: { type: "url" | "file"; url?: string; name?: string } | null,
    bytes: number,
): {
    id: string;
    name: { en: string; de: string };
    version: string;
    partial: boolean;
    crags: number;
    routes: number;
    bytes: number;
    src: { type: "url" | "file"; url?: string; name?: string } | null;
    at: number;
} => ({
    id: pack.id,
    name: { en: pack.name.en || pack.id, de: pack.name.de || pack.id },
    version: pack.version,
    partial: pack.partial === true,
    crags: pack.sectors.length,
    routes: pack.sectors.reduce((n, s) => n + (s.routes?.length ?? 0), 0),
    bytes,
    src: source,
    at: Date.now(),
});
