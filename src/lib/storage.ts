import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export const UPLOAD_DIR = path.join(process.cwd(), "uploads");
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB per photo
export const MAX_IMAGES_PER_PRODUCT = 8;

const TYPES: Record<string, { ext: string; check: (b: Buffer) => boolean }> = {
  "image/jpeg": { ext: "jpg", check: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/png": { ext: "png", check: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  "image/webp": { ext: "webp", check: (b) => b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP" },
  "image/gif": { ext: "gif", check: (b) => b.toString("ascii", 0, 3) === "GIF" },
  "image/avif": { ext: "avif", check: (b) => b.toString("ascii", 4, 12).startsWith("ftypavi") },
};

export class UploadError extends Error {}

/** Validates and stores an image. Returns its public URL. */
export async function saveImage(file: File): Promise<string> {
  if (file.size === 0) throw new UploadError("One of the photos is empty.");
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError(`"${file.name}" is larger than 5 MB.`);
  const type = TYPES[file.type];
  const bytes = Buffer.from(await file.arrayBuffer());
  if (!type || !type.check(bytes)) {
    throw new UploadError(`"${file.name}" isn't a supported image (JPG, PNG, WebP, GIF or AVIF).`);
  }
  const name = `${Date.now().toString(36)}-${randomBytes(8).toString("hex")}.${type.ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`products/${name}`, bytes, { access: "public", contentType: file.type });
    return blob.url;
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
      if (/^[a-z0-9-]+\.(jpg|png|webp|gif|avif)$/.test(name)) await unlink(path.join(UPLOAD_DIR, name));
    } else if (process.env.BLOB_READ_WRITE_TOKEN && url.includes(".blob.vercel-storage.com/")) {
      const { del } = await import("@vercel/blob");
      await del(url);
    }
  } catch {
    // ignore — file may already be gone
  }
}
