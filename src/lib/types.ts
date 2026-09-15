export type ScrapType = "text" | "image" | "video" | "audio" | "link" | "document" | "unknown";

export type ScrapRevision = {
  id: string;
  at: number;
  kind: "edit" | "ai";
  title: string;
  memo: string;
  tags: string[];
  type: string;
  text: string;
  /** AI analysis snapshot when present. */
  previewText?: string;
  /** Readable source excerpt / paste / image description when present. */
  sourceText?: string;
};

export type ScrapOg = {
  title: string;
  description: string;
  image: string;
  siteName: string;
  favicon: string;
};

export type Scrap = {
  id: string;
  createdAt: number;
  updatedAt: number;
  type: string;
  tags: string[];
  title: string;
  text: string;
  url: string;
  filename: string;
  mime: string;
  extension: string;
  size: number;
  dataUrl: string;
  /** Storage path for page-1 cover JPEG (account). Later pages use poster-N.jpg. */
  posterPath: string;
  /** Signed / blob / data URL for page-1 cover (client). */
  posterUrl: string;
  /** Page covers in order (client). Page 1 matches posterUrl. */
  posterUrls: string[];
  /** Captured cover page count (1–4). Legacy rows stay 0 until backfill. */
  pages: number;
  previewText: string;
  /** Readable page excerpt, pasted original, or image description. Not shown on shelf cards. */
  sourceText: string;
  sample: boolean;
  storedMedia: boolean;
  domain: string;
  error: string;
  memo: string;
  mediaPath: string;
  analyzing?: boolean;
  /** Client-only: Claude `/api/analyze` fell back to MIME/URL tagging. */
  classifyFallback?: boolean;
  /** Client-only: why classify did not use Claude. */
  classifyMiss?: "" | "missing" | "auth" | "rules";
  bookmarked: boolean;
  readAt: number | null;
  remindAt: number | null;
  /** User-bundled peer scrap ids (stored both ways when linking). */
  linkedIds: string[];
  og: ScrapOg | null;
  ogStatus: string;
  /** Prior title, memo, tags, type, and body. Newest first. */
  revisions?: ScrapRevision[];
};

export type AnalyzeResult = {
  type: ScrapType;
  tags: string[];
  title: string;
  body: string;
  summary?: string;
  analysis?: string;
  url?: string;
  domain?: string;
  fallback?: boolean;
  miss?: "" | "missing" | "auth" | "rules";
};
