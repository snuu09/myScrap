export type ScrapType = "text" | "image" | "video" | "audio" | "link" | "document" | "unknown";

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
  type: ScrapType;
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
  og: ScrapOg | null;
  ogStatus: string;
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
