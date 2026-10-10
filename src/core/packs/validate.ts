/**
 * Is this JSON a mappack?
 *
 * mappack.schema.json is the single source of truth: CI checks the packs in maps/ against it
 * (tools/validate-packs.sh), the types in src/types/mappack.ts mirror it, and this module compiles
 * it with Ajv so the running app asks the very same question. The old app had a hand-written
 * `packCheck()` with its own list of assertions, which could drift from the schema without anyone
 * noticing.
 *
 * `additionalProperties: true` runs through the whole schema on purpose -- an older app has to be
 * able to ignore fields it does not know -- so Ajv is deliberately *not* run in strict mode and
 * unknown fields pass.
 */

import type { ErrorObject, ValidateFunction } from "ajv";

import type { Mappack } from "@domain/mappack";
import { PACK_FORMAT, PACK_FORMAT_VERSION } from "@domain/mappack";

import schema from "../../../mappack.schema.json";

export interface PackProblem {
    /** Where in the pack, as a JSON pointer, e.g. `/sectors/12/routes/3`. Empty for the pack. */
    readonly where: string;
    readonly message: string;
}

export type PackCheck =
    | { readonly ok: true; readonly pack: Mappack }
    | { readonly ok: false; readonly problems: readonly PackProblem[] };

// Compiled once. 2020-12 keywords (prefixItems, $defs) need the 2020 dialect of Ajv.
let compiled: ValidateFunction | null = null;

const validator = async (): Promise<ValidateFunction> => {
    if (compiled) return compiled;
    const { Ajv2020 } = await import("ajv/dist/2020");
    const ajv = new Ajv2020({
        allErrors: true,
        // The schema is open by design; do not let Ajv complain about what it cannot check.
        strict: false,
        // A pack is big: stop after enough errors to be useful rather than listing thousands.
        messages: true,
    });
    compiled = ajv.compile(schema);
    return compiled;
};

/** Ajv's errors are precise but terse; this is what the install dialog shows. */
const humanise = (error: ErrorObject): PackProblem => {
    const where = error.instancePath || "";
    if (error.keyword === "required") {
        const missing = (error.params as { missingProperty?: string }).missingProperty;
        return { where, message: `"${missing}" is missing` };
    }
    if (error.keyword === "enum") {
        const allowed = (error.params as { allowedValues?: unknown[] }).allowedValues ?? [];
        return { where, message: `must be one of ${allowed.map((v) => `"${v}"`).join(", ")}` };
    }
    if (error.keyword === "const") {
        return {
            where,
            message: `must be ${JSON.stringify((error.params as { allowedValue?: unknown }).allowedValue)}`,
        };
    }
    return { where, message: error.message ?? "is not allowed here" };
};

/** How many problems to carry back. One bad pack can produce thousands. */
const MAX_PROBLEMS = 20;

/**
 * Check a parsed JSON value against the schema.
 *
 * The two fields that decide whether this is a mappack at all are checked first and reported on
 * their own, so that handing the app some unrelated JSON says so instead of burying it under a
 * hundred schema errors.
 */
export const checkPack = async (value: unknown): Promise<PackCheck> => {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return { ok: false, problems: [{ where: "", message: "is not a JSON object" }] };
    }

    const candidate = value as Partial<Mappack>;
    if (candidate.format !== PACK_FORMAT) {
        return {
            ok: false,
            problems: [
                {
                    where: "/format",
                    message: `is ${JSON.stringify(candidate.format ?? null)}, not "${PACK_FORMAT}"`,
                },
            ],
        };
    }
    if (candidate.formatVersion !== PACK_FORMAT_VERSION) {
        return {
            ok: false,
            problems: [
                {
                    where: "/formatVersion",
                    message: `is ${JSON.stringify(candidate.formatVersion ?? null)}, not ${PACK_FORMAT_VERSION}`,
                },
            ],
        };
    }

    const validate = await validator();
    if (validate(value)) return { ok: true, pack: value as Mappack };

    const problems = (validate.errors ?? []).slice(0, MAX_PROBLEMS).map(humanise);
    return {
        ok: false,
        problems: problems.length
            ? problems
            : [{ where: "", message: "does not match the schema" }],
    };
};
