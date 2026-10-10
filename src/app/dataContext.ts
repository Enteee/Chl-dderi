/**
 * The context the mounted mappacks travel in, and the hook that reads it.
 *
 * Separate from DataProvider.tsx so that file exports components only -- fast refresh replaces a
 * module's components in place, and cannot do that for a module that also exports a hook.
 */

import { createContext, useContext } from "react";

import type { PackLoad } from "@core/packs/storage";
import type { MountedData } from "@domain/model";

export interface DataContextValue extends MountedData {
    /** Only the showcase is mounted: no real pack has been installed yet. */
    readonly onlyShowcase: boolean;
    /** A pack is being installed or removed. */
    readonly busy: boolean;
    readonly installFromUrl: (url: string) => Promise<PackLoad>;
    readonly installFromFile: (file: File) => Promise<PackLoad>;
    readonly uninstall: (id: string) => Promise<void>;
}

export const DataContext = createContext<DataContextValue | null>(null);

export const useData = (): DataContextValue => {
    const value = useContext(DataContext);
    if (!value) throw new Error("useData outside DataProvider");
    return value;
};
