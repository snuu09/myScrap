import type { Scrap } from "./types";

const NOW = Date.UTC(2026, 2, 12, 9, 30, 0);

/** Fixed shelf cards for Settings live theme preview (not user data). */
export const THEME_PREVIEW_SAMPLE: Scrap = {
  id: "preview-sample-link",
  createdAt: NOW,
  updatedAt: NOW,
  type: "link",
  tags: ["서재", "메모", "링크"],
  title: "주말 아침, 책장에 꽂아 둔 문장",
  text: "붙여 둔 링크와 짧은 메모가 한 장의 양장본으로 정리됩니다. 제목·요약·태그가 테마 색과 글꼴에 맞춰 서재 카드에 보입니다.",
  url: "https://example.com/library-note",
  filename: "",
  mime: "",
  extension: "",
  size: 0,
  dataUrl: "",
  posterPath: "",
  posterUrl: "",
  posterUrls: [],
  pages: 0,
  previewText:
    "상세 본문에서는 AI 요약과 분석이 이 크기로 읽힙니다. 테마를 바꾸면 배경·먹색·모서리가 함께 바뀌고, 글자 크기는 아래 가독성 설정과 같습니다.",
  sourceText: "",
  sample: true,
  storedMedia: false,
  domain: "example.com",
  error: "",
  memo: "다시 읽고 싶은 구절을 짧게 남겨 둡니다.",
  mediaPath: "",
  bookmarked: true,
  readAt: null,
  remindAt: null,
  linkedIds: [],
  og: {
    title: "주말 아침, 책장에 꽂아 둔 문장",
    description: "서재 카드 미리보기용 샘플 링크입니다.",
    image: "",
    siteName: "Example",
    favicon: "",
  },
  ogStatus: "ready",
};
