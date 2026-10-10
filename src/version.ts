/**
 * Which version is running.
 *
 * Not a constant the build stamps in: the deploy writes `version.json` next to the app, the service
 * worker caches it with the rest of the shell, and the app reads it from there. That keeps the build
 * deterministic -- a bundle with a commit hash inside it could never satisfy
 * `build && git diff --exit-code` -- and update detection stays exactly what it was: compare the
 * cached copy against a `no-store` fetch of the same file.
 */

export interface AppVersion {
    version: string;
    built: string;
}

/** Filled in at start by `loadVersion()`; `dev` until then and when running from a file. */
export const APP_VERSION: AppVersion = { version: "dev", built: "" };

const read = async (cache: RequestCache): Promise<AppVersion | null> => {
    try {
        const response = await fetch("version.json", { cache });
        if (!response.ok) return null;
        const value = (await response.json()) as Partial<AppVersion>;
        if (typeof value.version !== "string") return null;
        return { version: value.version, built: String(value.built ?? "") };
    } catch {
        return null;
    }
};

/** The version this installation is running: the copy the service worker has. */
export const loadVersion = async (): Promise<AppVersion> => {
    const current = await read("force-cache");
    if (current) {
        APP_VERSION.version = current.version;
        APP_VERSION.built = current.built;
    }
    return APP_VERSION;
};

/** Is a newer version published? Compares the running version with what the network says. */
export const checkForUpdate = async (): Promise<string | null> => {
    const published = await read("no-store");
    if (!published) return null;
    return published.version !== APP_VERSION.version ? published.version : null;
};
