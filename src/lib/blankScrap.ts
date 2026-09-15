import { uid } from "./tagger";
import type { Scrap } from "./types";

/** Fresh scrap row with stable defaults for compose and link-create flows. */
export function blankScrap(partial: Partial<Scrap> = {}): Scrap {
  const now = Date.now();
  return {
    id: uid(),
    createdAt: now,
    updatedAt: now,
    type: "text",
    tags: ["text"],
    title: "",
    text: "",
    url: "",
    filename: "",
    mime: "",
    extension: "",
    size: 0,
    dataUrl: "",
    posterPath: "",
    posterUrl: "",
    posterUrls: [],
    pages: 0,
    previewText: "",
    sourceText: "",
    sample: false,
    storedMedia: false,
    domain: "",
    error: "",
    memo: "",
    mediaPath: "",
    bookmarked: false,
    readAt: null,
    remindAt: null,
    og: null,
    ogStatus: "",
    linkedIds: [],
    ...partial,
  };
}
