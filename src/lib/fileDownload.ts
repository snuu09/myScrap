/** Fetch a remote/signed/blob URL into a Blob with optional progress 0..1. */
export async function fetchBlobWithProgress(
  src: string,
  onProgress?: (ratio: number) => void,
): Promise<Blob> {
  const res = await fetch(src);
  if (!res.ok) throw new Error("fetch");
  const total = Number(res.headers.get("content-length")) || 0;
  if (!res.body || !total) {
    const blob = await res.blob();
    onProgress?.(1);
    return blob;
  }
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      received += value.length;
      onProgress?.(Math.min(1, received / total));
    }
  }
  onProgress?.(1);
  const merged = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  const type = res.headers.get("content-type") || "";
  return new Blob([merged], { type: type || undefined });
}

export function triggerAnchorDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "download";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Open a PDF (or any blob) in a new tab via object URL. */
export function openBlobInNewTab(blob: Blob, mime = "") {
  const typed =
    mime && (!blob.type || blob.type === "application/octet-stream")
      ? new Blob([blob], { type: mime })
      : blob;
  const url = URL.createObjectURL(typed);
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) {
    URL.revokeObjectURL(url);
    throw new Error("popup");
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

type DirPicker = {
  showDirectoryPicker: (opts?: { startIn?: FileSystemHandle; mode?: "read" | "readwrite" }) => Promise<FileSystemDirectoryHandle>;
};

function dirApi(): DirPicker | null {
  const w = window as Window & Partial<DirPicker>;
  return typeof w.showDirectoryPicker === "function" ? (w as DirPicker) : null;
}

type SavePicker = {
  showSaveFilePicker: (opts?: {
    suggestedName?: string;
    types?: { description: string; accept: Record<string, string[]> }[];
  }) => Promise<FileSystemFileHandle>;
};

function saveApi(): SavePicker | null {
  const w = window as Window & Partial<SavePicker>;
  return typeof w.showSaveFilePicker === "function" ? (w as SavePicker) : null;
}

/** Save into a user-picked folder (Chromium). Returns the directory handle for later reopen. */
export async function saveBlobToPickedFolder(blob: Blob, filename: string, startIn?: FileSystemDirectoryHandle) {
  const api = dirApi();
  if (!api) return null;
  const dir = await api.showDirectoryPicker({
    mode: "readwrite",
    startIn: startIn || undefined,
  });
  const file = await dir.getFileHandle(filename || "download", { create: true });
  const writable = await file.createWritable();
  await writable.write(blob);
  await writable.close();
  return dir;
}

/** Reopen the folder picker rooted at a prior directory handle when the browser allows it. */
export async function reopenDirectory(handle: FileSystemDirectoryHandle) {
  const api = dirApi();
  if (!api) return false;
  await api.showDirectoryPicker({ startIn: handle, mode: "read" });
  return true;
}

export async function saveBlobWithPicker(blob: Blob, filename: string) {
  const api = saveApi();
  if (!api) return false;
  const handle = await api.showSaveFilePicker({ suggestedName: filename || "download" });
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
  return true;
}

export function canPickDirectory() {
  return Boolean(dirApi());
}
