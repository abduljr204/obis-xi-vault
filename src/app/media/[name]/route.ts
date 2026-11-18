import { readFile } from "node:fs/promises";
import path from "node:path";
import { MEDIA_NAME, UPLOAD_DIR, photoBucket } from "@/lib/storage";

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

const HEADERS = {
  "Cache-Control": "public, max-age=31536000, immutable",
  "X-Content-Type-Options": "nosniff",
};

/** Serves product photos uploaded from the admin area: from Cloudflare R2, or the local uploads folder. */
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const match = MEDIA_NAME.exec(name);
  if (!match) return new Response("Not found", { status: 404 });

  const bucket = await photoBucket();
  if (bucket) {
    const object = await bucket.get(`products/${name}`);
    if (!object) return new Response("Not found", { status: 404 });
    return new Response(object.body, { headers: { "Content-Type": TYPES[match[1]], ...HEADERS } });
  }

  try {
    const data = await readFile(path.join(UPLOAD_DIR, name));
    return new Response(new Uint8Array(data), { headers: { "Content-Type": TYPES[match[1]], ...HEADERS } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
