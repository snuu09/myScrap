import { isPdf } from "./tagger";
import { extractAudioCover } from "./audioCover";

const COVER_W = 720;
const COVER_H = 960;
const JPEG_QUALITY = 0.85;
const MAX_PDF_PAGES = 4;

function canvasToJpeg(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", JPEG_QUALITY);
  });
}

function drawDocCoverCard(filename: string, extension: string) {
  const canvas = document.createElement("canvas");
  canvas.width = COVER_W;
  canvas.height = COVER_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#f3ebe0";
  ctx.fillRect(0, 0, COVER_W, COVER_H);

  ctx.fillStyle = "#e8dcc8";
  ctx.fillRect(48, 64, COVER_W - 96, COVER_H - 128);

  const ext = (extension || "DOC").replace(/^\./, "").toUpperCase().slice(0, 5) || "FILE";
  ctx.fillStyle = "#c45c2a";
  ctx.beginPath();
  roundRect(ctx, COVER_W / 2 - 72, 200, 144, 56, 12);
  ctx.fill();

  ctx.fillStyle = "#fff7f0";
  ctx.font = "700 28px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(ext, COVER_W / 2, 228);

  const label = String(filename || "file").slice(0, 42);
  ctx.fillStyle = "#322c26";
  ctx.font = "650 36px system-ui, sans-serif";
  wrapCenteredText(ctx, label, COVER_W / 2, 340, COVER_W - 140, 44);

  return canvas;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? line + " " + word : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.slice(0, 4).forEach((row, i) => {
    ctx.fillText(row, cx, startY + i * lineHeight);
  });
}

async function renderPdfPage(page: import("pdfjs-dist").PDFPageProxy) {
  const base = page.getViewport({ scale: 1 });
  const scale = Math.min(1, COVER_W / base.width);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil(viewport.width));
  canvas.height = Math.max(1, Math.ceil(viewport.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // pdf.js v5: pass `canvas` only (canvasContext is legacy and conflicts when both are set).
  await page.render({ canvas, viewport }).promise;
  return canvasToJpeg(canvas);
}

async function capturePdfPages(file: File) {
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  try {
    const count = Math.min(MAX_PDF_PAGES, Math.max(1, doc.numPages || 1));
    const blobs: Blob[] = [];
    for (let i = 1; i <= count; i++) {
      const page = await doc.getPage(i);
      const blob = await renderPdfPage(page);
      if (blob) blobs.push(blob);
    }
    return blobs;
  } finally {
    await doc.destroy();
  }
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image"));
    };
    img.src = url;
  });
}

async function captureImage(file: File) {
  const img = await loadImage(file);
  const scale = Math.min(COVER_W / img.width, COVER_H / img.height, 1);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvasToJpeg(canvas);
}

function captureVideoFrame(file: File) {
  return new Promise<Blob | null>((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    const fail = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    video.onerror = fail;
    video.onloadeddata = () => {
      const seekTo = Math.min(0.2, (video.duration || 1) * 0.05);
      const draw = () => {
        const scale = Math.min(COVER_W / video.videoWidth, COVER_H / video.videoHeight, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
        canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx || !video.videoWidth) {
          fail();
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        void canvasToJpeg(canvas).then(resolve);
      };
      if (Number.isFinite(seekTo) && seekTo > 0) {
        video.onseeked = draw;
        try {
          video.currentTime = seekTo;
        } catch {
          draw();
        }
      } else {
        draw();
      }
    };
    video.src = url;
  });
}

async function oneCover(file: File): Promise<Blob | null> {
  const mime = file.type || "";
  const name = file.name || "";
  if (mime.startsWith("image/")) return await captureImage(file);
  if (mime.startsWith("video/")) return await captureVideoFrame(file);
  const audio =
    mime.startsWith("audio/") || /\.(mp3|m4a|aac|flac|wav|ogg|opus|aiff?)$/i.test(name);
  if (audio) return await extractAudioCover(file);
  const ext = name.includes(".") ? name.split(".").pop() || "" : "";
  const canvas = drawDocCoverCard(name, ext || mime.split("/").pop() || "file");
  return canvas ? canvasToJpeg(canvas) : null;
}

/** Capture JPEG covers (PDF: up to 4 full pages; everything else: one image). */
export async function captureCover(file: File): Promise<Blob[]> {
  const mime = file.type || "";
  const name = file.name || "";
  try {
    if (isPdf(mime, name)) {
      const pages = await capturePdfPages(file);
      if (pages.length) return pages;
    }
    const one = await oneCover(file);
    return one ? [one] : [];
  } catch {
    const one = await oneCover(file).catch(() => null);
    return one ? [one] : [];
  }
}

export function blobToObjectUrl(blob: Blob) {
  return URL.createObjectURL(blob);
}

/** Turn a blob: object URL into a durable data: URL (for guest / failed-upload posters). */
export async function blobUrlToDataUrl(url: string) {
  if (!url.startsWith("blob:")) return url;
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(blob);
  });
}
