import { Link, useLocation } from "react-router-dom";
import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";

const TERMS = {
  ko: [
    "MyBrary는 웹에서 본 것, 사진, 파일을 한곳에 붙이는 개인 스크랩 상자입니다. 팀 공간이나 쇼핑몰이 아닙니다.",
    "이용: 이메일로 가입한 뒤 붙여넣기, 파일 첨부, 분류, 목록 찾기를 사용할 수 있습니다. 기록은 로그인한 본인만 다룹니다.",
    "저장: 조각은 Supabase Postgres에, 파일은 비공개 Storage에 계정별로 남습니다. 환경 변수가 없으면 책장을 열 수 없습니다.",
    "운영: 운영 주체, 대표, 주소, 연락처는 아래에 표시합니다. 값이 없으면 「표시 예정」입니다. 이 문서는 없는 번호를 만들지 않습니다.",
    "책임: 붙인 내용의 권리는 붙인 사람에게 있습니다. 자동 분류는 도울 뿐, 외부 사이트의 내용을 보증하지 않습니다.",
  ],
  en: [
    "MyBrary is a personal capture box for things you saw on the web, photos, and files. It is not a team space or a store.",
    "Use: After you sign up with email you can paste, attach, classify, and find scraps. Only the signed-in owner manages their records.",
    "Storage: Scraps live in Supabase Postgres. Files go in a private Storage bucket per account. Without env vars the shelf does not open.",
    "Operator: Operator, representative, address, and contact appear below. Empty fields read “To be shown”. This page does not invent registration numbers.",
    "Responsibility: Rights in stuck material stay with the person who stuck it. Auto-classify helps. It does not guarantee third-party pages.",
  ],
};

const PRIVACY = {
  ko: [
    "MyBrary는 개인 스크랩 상자입니다. 이 방침은 지금 클라이언트가 실제로 저장하는 것만 말합니다.",
    "계정: 이메일과 비밀번호는 Supabase Auth가 다룹니다. 조각과 미디어는 해당 계정 RLS 뒤로만 보입니다.",
    "이 기기: 언어, 화면 모드, 컬러 테마만 이 브라우저에 남습니다. 광고 쿠키나 추적 스크립트는 실지 않습니다.",
    "열람과 삭제: 앱에서 조각을 떼거나 나가기를 할 수 있습니다. 문의 이메일은 아래에 있으며, 값이 없으면 「표시 예정」입니다.",
    "제3자: 이미지 자동 인식은 로그인된 요청만 서버 함수를 통해 Claude API로 갑니다. Anthropic 키는 브라우저에 두지 않습니다.",
  ],
  en: [
    "MyBrary is a personal capture box. This notice describes what the client actually stores.",
    "Account: Email and password are handled by Supabase Auth. Scraps and media are visible only behind that account’s RLS.",
    "On this device: Language, appearance, and color theme stay in this browser. This build does not ship advertising cookies or trackers.",
    "Access and deletion: You can peel scraps in the app or Leave. The contact email is below. Empty fields read “To be shown”.",
    "Third parties: Image auto-recognition goes to Claude through a server function, only with a signed-in request. The Anthropic key is never in the browser.",
  ],
};

export function Legal() {
  const { lang } = usePrefs();
  const privacy = useLocation().pathname.endsWith("privacy");
  const title = t(lang, privacy ? "privacy" : "terms");
  const paragraphs = privacy ? PRIVACY[lang] : TERMS[lang];

  return (
    <article className="mx-auto w-full max-w-[40rem] px-[var(--gutter)] py-8">
      <h1 className="mt-0 text-[clamp(1.5rem,1.15rem+1.5vw,1.75rem)] font-extrabold tracking-[-0.04em]">{title}</h1>
      <p className="text-[0.8125rem] text-muted">{t(lang, "legalUpdated")}</p>
      {paragraphs.map((p) => (
        <p key={p} className="text-[1rem] leading-relaxed text-ink-soft">
          {p}
        </p>
      ))}
      <p className="text-[0.9375rem]">
        <Link to="/" className="text-magnet">
          {t(lang, "appName")}
        </Link>
      </p>
    </article>
  );
}
