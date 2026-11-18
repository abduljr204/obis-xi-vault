import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export const UPLOAD_DIR = path.join(process.cwd(), "uploads");
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB per photo
export const MAX_IMAGES_PER_PRODUCT = 8;
/** File names of uploaded photos, as served from /media/<name>. */
export const MEDIA_NAME = /^[a-z0-9-]+\.(jpg|png|webp|gif|avif)$/;

const TYPES: Record<string, { ext: string; check: (b: Buffer) => boolean }> = {
  "image/jpeg": { ext: "jpg", check: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/png": { ext: "png", check: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  "image/webp": { ext: "webp", check: (b) => b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP" },
  "image/gif": { ext: "gif", check: (b) => b.toString("ascii", 0, 3) === "GIF" },
  "image/avif": { ext: "avif", check: (b) => b.toString("ascii", 4, 12).startsWith("ftypavi") },
};

export class UploadError extends Error {}

/** The parts of a Cloudflare R2 bucket the store uses. */
type PhotoBucket = {
  put(key: string, value: Uint8Array, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  get(key: string): Promise<{ body: ReadableStream; httpMetadata?: { contentType?: string } } | null>;
  delete(key: string): Promise<void>;
};

/** The R2 bucket bound as PHOTOS when running on Cloudflare (see wrangler.jsonc); null anywhere else. */
export async function photoBucket(): Promise<PhotoBucket | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    return (env as { PHOTOS?: PhotoBucket }).PHOTOS ?? null;
  } catch {
    return null; // not running on Cloudflare
  }
}

/**
 * Validates and stores an image. Returns its public URL.
 * Storage, in order: Cloudflare R2 (on Cloudflare), Vercel Blob (on Vercel), the local uploads folder (your computer).
 */
export async function saveImage(file: File): Promise<string> {
  if (file.size === 0) throw new UploadError("One of the photos is empty.");
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError(`"${file.name}" is larger than 5 MB.`);
  const type = TYPES[file.type];
  const bytes = Buffer.from(await file.arrayBuffer());
  if (!type || !type.check(bytes)) {
    throw new UploadError(`"${file.name}" isn't a supported image (JPG, PNG, WebP, GIF or AVIF).`);
  }
  const name = `${Date.now().toString(36)}-${randomBytes(8).toString("hex")}.${type.ext}`;

  // Cloudflare: store in R2; the /media route serves it.
  const bucket = await photoBucket();
  if (bucket) {
    try {
      await bucket.put(`products/${name}`, new Uint8Array(bytes), { httpMetadata: { contentType: file.type } });
      return `/media/${name}`;
    } catch (err) {
      console.error("[upload] R2 rejected the photo", err);
      throw new UploadError(`Photo storage rejected the upload: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    try {
      const blob = await put(`products/${name}`, bytes, { access: "public", contentType: file.type });
      return blob.url;
    } catch (err) {
      console.error("[upload] Vercel Blob rejected the photo", err);
      const reason = err instanceof Error ? err.message : String(err);
      throw new UploadError(
        /private/i.test(reason)
          ? "Photo storage is set to Private. Product photos need a Public Blob store (Vercel → Storage)."
          : `Photo storage rejected the upload: ${reason}`,
      );
    }
  }

  // On Vercel the server's disk is read-only, so photos must go to Blob storage.
  if (process.env.VERCEL) {
    throw new UploadError(
      "Photo storage isn't connected. In Vercel → Storage, connect a Public Blob store with a read-write token (BLOB_READ_WRITE_TOKEN), then redeploy.",
    );
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), bytes);
  return `/media/${name}`;
}

/** Best-effort removal of a stored image. Bundled sample images are left alone. */
export async function deleteImage(url: string) {
  try {
    if (url.startsWith("/media/")) {
      const name = url.slice("/media/".length);
      if (!MEDIA_NAME.test(name)) return;
      const bucket = await photoBucket();
      if (bucket) await bucket.delete(`products/${name}`);
      else await unlink(path.join(UPLOAD_DIR, name));
    } else if (process.env.BLOB_READ_WRITE_TOKEN && url.includes(".blob.vercel-storage.com/")) {
      const { del } = await import("@vercel/blob");
      await del(url);
    }
  } catch {
    // ignore — file may already be gone
  }
}
