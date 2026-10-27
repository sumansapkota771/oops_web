"use client";

import { createClient } from "@supabase/supabase-js";
import { createUploadAction, registerMediaAction } from "@/app/admin/actions";
import { isSupabaseConfigured, supabasePublicKey, supabaseUrl } from "@/lib/env";
import type { MediaItem } from "@/lib/admin/store";

const WIDTHS = [480, 960, 1600];
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

type Rendition = { width: number; blob: Blob };

let webpSupported: boolean | undefined;
async function canEncodeWebp() {
  if (webpSupported !== undefined) return webpSupported;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 2;
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.8));
  webpSupported = blob?.type === "image/webp";
  return webpSupported;
}

async function encode(source: CanvasImageSource, sw: number, sh: number, width: number, type: string, quality: number) {
  const w = Math.min(width, sw);
  const h = Math.round((sh / sw) * w);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, w, h);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, type, quality));
  if (!blob) throw new Error("Could not process the image in this browser.");
  return { blob, width: w, height: h };
}

async function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** Resizes an image (or a video frame) into WebP renditions + a tiny blur placeholder. */
async function renditions(source: CanvasImageSource, sw: number, sh: number) {
  const webp = await canEncodeWebp();
  const type = webp ? "image/webp" : "image/jpeg";
  const out: Rendition[] = [];
  let width = 0;
  let height = 0;
  for (const w of WIDTHS) {
    const r = await encode(source, sw, sh, w, type, 0.8);
    out.push({ width: w, blob: r.blob });
    if (r.width >= width) [width, height] = [r.width, r.height];
  }
  const tiny = await encode(source, sw, sh, 16, type, 0.4);
  return { ext: webp ? "webp" : "jpg", contentType: type, renditions: out, width, height, blur: await blobToDataUrl(tiny.blob) };
}

async function videoFrame(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error("This video format can't be read by the browser."));
    });
    video.currentTime = Math.min(1, (video.duration || 2) / 4);
    await new Promise<void>((resolve) => (video.onseeked = () => resolve()));
    return { video, width: video.videoWidth, height: video.videoHeight, duration: video.duration };
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
}

function browserClient() {
  if (!isSupabaseConfigured) throw new Error("Supabase isn't connected yet.");
  return createClient(supabaseUrl, supabasePublicKey, { auth: { persistSession: false } });
}

async function put(path: string, token: string, blob: Blob, contentType: string) {
  const { error } = await browserClient().storage.from("media").uploadToSignedUrl(path, token, blob, { contentType, cacheControl: "31536000" });
  if (error) throw new Error(`Upload failed: ${error.message}`);
}

const altFrom = (name: string) => name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();

/** Processes and uploads one file to the media library. Returns the new library item. */
export async function uploadFile(file: File, folder: string, onProgress?: (label: string) => void): Promise<MediaItem> {
  const isVideo = file.type.startsWith("video/");
  const isSvg = file.type === "image/svg+xml";
  const isPdf = file.type === "application/pdf";

  if (isVideo) {
    if (file.size > MAX_VIDEO_BYTES) throw new Error("Videos must be under 50 MB. For longer films, upload to YouTube and paste the link instead.");
    onProgress?.("Reading video…");
    const frame = await videoFrame(file);
    const poster = await renditions(frame.video, frame.width, frame.height);
    const ext = file.type === "video/webm" ? "webm" : "mp4";
    const target = await createUploadAction({ name: file.name, folder, ext, widths: [], posterExt: poster.ext, posterWidths: WIDTHS });
    if (!target.ok) throw new Error(target.error);
    onProgress?.("Uploading video…");
    const [videoTarget, ...posterTargets] = target.targets;
    await put(videoTarget.path, videoTarget.token, file, file.type);
    await Promise.all(posterTargets.map((t, i) => put(t.path, t.token, poster.renditions[i].blob, poster.contentType)));
    const posterRecord = await registerMediaAction({
      path: `${target.base}-poster`, kind: "image", ext: poster.ext, widths: WIDTHS, width: poster.width, height: poster.height,
      bytes: poster.renditions.reduce((s, r) => s + r.blob.size, 0), blur: poster.blur, alt: `${altFrom(file.name)} (video poster)`,
      folder: target.folder, name: `${file.name} poster`, poster: null, duration: null,
    });
    if (!posterRecord.ok) throw new Error(posterRecord.error);
    const result = await registerMediaAction({
      path: target.base, kind: "video", ext, widths: [], width: frame.width, height: frame.height, bytes: file.size, blur: null,
      alt: altFrom(file.name), folder: target.folder, name: file.name, poster: `${target.base}-poster`, duration: Number.isFinite(frame.duration) ? frame.duration : null,
    });
    if (!result.ok) throw new Error(result.error);
    return result.item;
  }

  if (isSvg || isPdf) {
    const ext = isSvg ? "svg" : "pdf";
    const target = await createUploadAction({ name: file.name, folder, ext, widths: [] });
    if (!target.ok) throw new Error(target.error);
    onProgress?.("Uploading…");
    await put(target.targets[0].path, target.targets[0].token, file, file.type);
    const result = await registerMediaAction({
      path: target.base, kind: isSvg ? "svg" : "file", ext, widths: [], width: 400, height: 200, bytes: file.size, blur: null,
      alt: altFrom(file.name), folder: target.folder, name: file.name, poster: null, duration: null,
    });
    if (!result.ok) throw new Error(result.error);
    return result.item;
  }

  if (!file.type.startsWith("image/")) throw new Error(`${file.name}: unsupported file type.`);
  onProgress?.("Resizing…");
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const img = await renditions(bitmap, bitmap.width, bitmap.height);
  bitmap.close();
  const target = await createUploadAction({ name: file.name, folder, ext: img.ext, widths: WIDTHS });
  if (!target.ok) throw new Error(target.error);
  onProgress?.("Uploading…");
  await Promise.all(target.targets.map((t, i) => put(t.path, t.token, img.renditions[i].blob, img.contentType)));
  const result = await registerMediaAction({
    path: target.base, kind: "image", ext: img.ext, widths: WIDTHS, width: img.width, height: img.height,
    bytes: img.renditions.reduce((s, r) => s + r.blob.size, 0), blur: img.blur, alt: altFrom(file.name),
    folder: target.folder, name: file.name, poster: null, duration: null,
  });
  if (!result.ok) throw new Error(result.error);
  return result.item;
}
