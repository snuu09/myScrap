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
  previewText: string;
  sample: boolean;
  storedMedia: boolean;
  domain: string;
  error: string;
  memo: string;
  mediaPath: string;
  analyzing?: boolean;
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
  url?: string;
  domain?: string;
  fallback?: boolean;
};
