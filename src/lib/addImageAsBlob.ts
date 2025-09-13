// utils/addImageUrlAsBlob.ts
import type Uppy from "@uppy/core";

function guessExt(mime = "") {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
    "image/heic": "heic",
    "image/heif": "heif",
  };
  return map[mime] || "";
}

function filenameFromHeadersOrUrl(
  url: string,
  cd: string | null,
  mime: string
) {
  // Try Content-Disposition: attachment; filename="name.ext"
  if (cd) {
    const m = /filename\*?=(?:UTF-8''|")?([^;"']+)/i.exec(cd);
    if (m?.[1]) return decodeURIComponent(m[1].replace(/"/g, ""));
  }
  // Fallback to URL pathname
  const base = decodeURIComponent(
    new URL(url).pathname.split("/").pop() || "download"
  );
  const hasExt = /\.[a-z0-9]+$/i.test(base);
  if (hasExt) return base;
  const ext = guessExt(mime) || "bin";
  return `${base}.${ext}`;
}

export async function addImageUrlAsBlob(uppy: Uppy, url: string) {
  // NOTE: This requires the origin to allow CORS. If you hit CORS issues,
  // use a proxy endpoint on your server to fetch the URL.

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);

  const mime = res.headers.get("content-type") || "";
  if (!mime.startsWith("image/"))
    throw new Error(`Not an image (got ${mime || "unknown"})`);

  const blob = await res.blob();
  const name = filenameFromHeadersOrUrl(
    url,
    res.headers.get("content-disposition"),
    blob.type || mime
  );
  const file = new File([blob], name, { type: blob.type || mime });

  const previewUrl = URL.createObjectURL(file);

  const addedFile = await uppy.addFile({
    name: file.name,
    type: file.type,
    data: file, // <-- this is the Blob/File
    source: "UrlToBlob", // any label you want
    isRemote: false, // treat as local
    meta: {
      previewUrl, // convenient for your grid
      sourceUrl: url, // keep original for reference
    },
  });

  uppy.once("file-removed", (removed) => {
    if (removed?.id === addedFile) {
      const p = removed?.meta?.previewUrl as string | undefined;
      if (p?.startsWith("blob:")) URL.revokeObjectURL(p);
    }
  });

  return addedFile;
}
