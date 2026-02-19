import { UpdateProfilePayload } from "./users.types";

export function isPlainObject(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function cleanString(v: unknown): string | undefined {
    if (typeof v !== "string") return undefined;
    const s = v.trim();
    return s.length ? s : undefined;
}

export function cleanNullableString(v: unknown): string | null | undefined {
    if (v === null) return null;
    if (typeof v !== "string") return undefined;
    const s = v.trim();
    return s.length ? s : null;
}

export function validateAndBuildUpdate(body: unknown): UpdateProfilePayload {
    if (!isPlainObject(body)) {
        const err = new Error("Invalid request body.");
        (err as any).statusCode = 400;
        throw err;
    }

    const data: UpdateProfilePayload = {};


    if ("name" in body) {
        const name = cleanString(body.name);
        if (!name) {
            const err = new Error("`name` must be a non-empty string.");
            (err as any).statusCode = 400;
            throw err;
        }
        if (name.length > 120) {
            const err = new Error("`name` is too long (max 120).");
            (err as any).statusCode = 400;
            throw err;
        }
        data.name = name;
    }


    if ("phone" in body) {
        const phone = cleanNullableString(body.phone);
        if (phone !== undefined && phone !== null && phone.length > 30) {
            const err = new Error("`phone` is too long (max 30).");
            (err as any).statusCode = 400;
            throw err;
        }
        if (phone !== undefined) data.phone = phone;
    }


    if ("bio" in body) {
        const bio = cleanNullableString(body.bio);
        if (bio !== undefined && bio !== null && bio.length > 1000) {
            const err = new Error("`bio` is too long (max 1000).");
            (err as any).statusCode = 400;
            throw err;
        }
        if (bio !== undefined) data.bio = bio;
    }


    if ("image" in body) {
        const image = cleanNullableString(body.image);
        if (image !== undefined && image !== null && image.length > 2048) {
            const err = new Error("`image` is too long (max 2048).");
            (err as any).statusCode = 400;
            throw err;
        }
        if (image !== undefined) data.image = image;
    }

    if (Object.keys(data).length === 0) {
        const err = new Error("No valid fields provided to update.");
        (err as any).statusCode = 400;
        throw err;
    }

    return data;
}
