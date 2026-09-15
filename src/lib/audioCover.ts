/** Extract embedded album art from audio files (ID3 APIC, MP4 covr). No npm deps. */

function synchsafe(bytes: Uint8Array, offset: number) {
  return ((bytes[offset] & 0x7f) << 21) | ((bytes[offset + 1] & 0x7f) << 14) | ((bytes[offset + 2] & 0x7f) << 7) | (bytes[offset + 3] & 0x7f);
}

function latin1(bytes: Uint8Array, start: number, end: number) {
  let out = "";
  for (let i = start; i < end; i++) out += String.fromCharCode(bytes[i]);
  return out;
}

function blobFrom(bytes: Uint8Array, type: string) {
  const copy = Uint8Array.from(bytes);
  return new Blob([copy], { type });
}

function findMimeEnd(bytes: Uint8Array, start: number, end: number) {
  for (let i = start; i < end; i++) {
    if (bytes[i] === 0) return i;
  }
  return end;
}

function apicBlob(payload: Uint8Array): Blob | null {
  if (payload.length < 4) return null;
  const encoding = payload[0];
  const mimeEnd = findMimeEnd(payload, 1, payload.length);
  const mime = latin1(payload, 1, mimeEnd).trim() || "image/jpeg";
  let i = mimeEnd + 1;
  if (i >= payload.length) return null;
  // picture type
  i += 1;
  if (encoding === 0 || encoding === 3) {
    while (i < payload.length && payload[i] !== 0) i += 1;
    i += 1;
  } else {
    while (i + 1 < payload.length && !(payload[i] === 0 && payload[i + 1] === 0)) i += 2;
    i += 2;
  }
  if (i >= payload.length) return null;
  const image = payload.subarray(i);
  if (image.length < 24) return null;
  return blobFrom(image, mime.startsWith("image/") ? mime : "image/jpeg");
}

function readId3Cover(bytes: Uint8Array): Blob | null {
  if (bytes.length < 10 || latin1(bytes, 0, 3) !== "ID3") return null;
  const ver = bytes[3];
  const flags = bytes[5];
  let size = synchsafe(bytes, 6);
  let offset = 10;
  if (flags & 0x40) {
    if (bytes.length < offset + 4) return null;
    const ext = ver === 4 ? synchsafe(bytes, offset) : ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]);
    offset += Math.max(4, ext);
  }
  const end = Math.min(bytes.length, 10 + size);
  while (offset + 10 <= end) {
    const id = latin1(bytes, offset, offset + 4);
    if (id === "\0\0\0\0") break;
    let frameSize =
      ver === 4
        ? synchsafe(bytes, offset + 4)
        : (bytes[offset + 4] << 24) | (bytes[offset + 5] << 16) | (bytes[offset + 6] << 8) | bytes[offset + 7];
    offset += 10;
    if (frameSize <= 0 || offset + frameSize > bytes.length) break;
    if (id === "APIC") {
      const blob = apicBlob(bytes.subarray(offset, offset + frameSize));
      if (blob) return blob;
    }
    offset += frameSize;
  }
  return null;
}

function u32(bytes: Uint8Array, offset: number) {
  return ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
}

function readMp4Cover(bytes: Uint8Array): Blob | null {
  let offset = 0;
  while (offset + 8 <= bytes.length) {
    let size = u32(bytes, offset);
    const type = latin1(bytes, offset + 4, offset + 8);
    if (size === 1 && offset + 16 <= bytes.length) {
      // largesize: skip 64-bit for simplicity if too big
      size = Number((BigInt(u32(bytes, offset + 8)) << 32n) | BigInt(u32(bytes, offset + 12)));
    }
    if (size < 8 || offset + size > bytes.length) break;
    if (type === "covr") {
      // data box usually follows: size + 'data' + version/flags + image
      let i = offset + 8;
      while (i + 8 <= offset + size) {
        const boxSize = u32(bytes, i);
        const boxType = latin1(bytes, i + 4, i + 8);
        if (boxSize < 8 || i + boxSize > offset + size) break;
        if (boxType === "data" && boxSize > 16) {
          const image = bytes.subarray(i + 16, i + boxSize);
          if (image.length > 24) {
            const isPng = image[0] === 0x89 && image[1] === 0x50;
            return blobFrom(image, isPng ? "image/png" : "image/jpeg");
          }
        }
        if (boxType === "covr" || boxType === "ilst" || boxType === "meta" || boxType === "moov" || boxType === "udta") {
          // descend handled by scanning whole file for covr
        }
        i += boxSize;
      }
      // raw after type if no nested data box
      const raw = bytes.subarray(offset + 8, offset + size);
      if (raw.length > 24) {
        const isPng = raw[0] === 0x89 && raw[1] === 0x50;
        const isJpeg = raw[0] === 0xff && raw[1] === 0xd8;
        if (isPng || isJpeg) return blobFrom(raw, isPng ? "image/png" : "image/jpeg");
      }
    }
    if (type === "moov" || type === "udta" || type === "meta" || type === "ilst" || type === "trak" || type === "mdia") {
      // continue scanning linearly; also walk into by not skipping children exclusively
    }
    offset += size;
  }
  // Linear scan for "covr" fourcc (handles nested atoms)
  for (let i = 0; i + 12 < bytes.length; i++) {
    if (bytes[i] === 0x63 && bytes[i + 1] === 0x6f && bytes[i + 2] === 0x76 && bytes[i + 3] === 0x72) {
      // size is 4 bytes before type
      if (i < 4) continue;
      const size = u32(bytes, i - 4);
      if (size < 8 || i - 4 + size > bytes.length) continue;
      const start = i + 4;
      const end = i - 4 + size;
      // prefer nested data box
      for (let j = start; j + 8 <= end; j++) {
        if (
          bytes[j + 4] === 0x64 &&
          bytes[j + 5] === 0x61 &&
          bytes[j + 6] === 0x74 &&
          bytes[j + 7] === 0x61
        ) {
          const boxSize = u32(bytes, j);
          if (boxSize > 16 && j + boxSize <= end) {
            const image = bytes.subarray(j + 16, j + boxSize);
            if (image.length > 24) {
              const isPng = image[0] === 0x89 && image[1] === 0x50;
              return blobFrom(image, isPng ? "image/png" : "image/jpeg");
            }
          }
        }
      }
    }
  }
  return null;
}

export async function extractAudioCover(file: File): Promise<Blob | null> {
  const mime = file.type || "";
  const name = file.name || "";
  const audio =
    mime.startsWith("audio/") ||
    /\.(mp3|m4a|aac|flac|wav|ogg|opus|aiff?)$/i.test(name);
  if (!audio) return null;
  try {
    const buf = new Uint8Array(await file.arrayBuffer());
    return readId3Cover(buf) || readMp4Cover(buf);
  } catch {
    return null;
  }
}

export const FAVICON_HOLDER = "/assets/favicon.svg";
