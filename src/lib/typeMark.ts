import type { LucideIcon } from "lucide-react";
import {
  AudioLines,
  Bookmark,
  Camera,
  File,
  FileText,
  Library,
  Link2,
  StickyNote,
  Video,
} from "lucide-react";

const TYPE_MARK: Record<string, LucideIcon> = {
  all: Library,
  bookmarked: Bookmark,
  text: StickyNote,
  image: Camera,
  video: Video,
  audio: AudioLines,
  link: Link2,
  document: FileText,
};

/** Lucide icon for spine carousel + scrap type chips (one source of truth). */
export function typeMarkIcon(id: string): LucideIcon {
  return TYPE_MARK[id] || File;
}
