import { Link, useLocation } from "react-router-dom";
import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";

const TERMS = {
  ko: [
    "MyBrary는 웹에서 본 것, 사진, 파일을 한곳에 붙이는 개인 스크랩 상자입니다. 팀 공간이나 쇼핑몰이 아닙니다.",
    "이용: 이메일이나 Google로 들어오거나 둘러보기로 들어선 뒤 붙여넣기, 파일 첨부, 분류, 목록 찾기를 사용할 수 있습니다. 기록은 그 세션의 본인만 다룹니다.",
    "저장: 조각은 Supabase Postgres에, 파일은 비공개 Storage에 계정별로 남습니다. 환경 변수가 없으면 책장을 열 수 없습니다.",
    "운영: 운영 주체, 대표, 주소, 연락처는 아래에 표시합니다. 값이 없으면 「표시 예정」입니다. 이 문서는 없는 번호를 만들지 않습니다.",
    "책임: 붙인 내용의 권리는 붙인 사람에게 있습니다. 자동 분류는 도울 뿐, 외부 사이트의 내용을 보증하지 않습니다.",
    "등급: 무료는 가입 후 14일 체험과 100MB 업로드 한도, 광고가 있습니다. 중간은 1GB와 광고, 고급·관리자는 무제한 용량과 광고 없음입니다. 결제 연동은 없으며 등급 변경은 운영자가 합니다.",
  ],
  en: [
    "MyBrary is a personal capture box for things you saw on the web, photos, and files. It is not a team space or a store.",
    "Use: After email, Google, or Browse you can paste, attach, classify, and find scraps. Only that session’s owner manages their records.",
    "Storage: Scraps live in Supabase Postgres. Files go in a private Storage bucket per account. Without env vars the shelf does not open.",
    "Operator: Operator, representative, address, and contact appear below. Empty fields read “To be shown”. This page does not invent registration numbers.",
    "Responsibility: Rights in stuck material stay with the person who stuck it. Auto-classify helps. It does not guarantee third-party pages.",
    "Plans: Free includes a 14-day trial, 100MB upload cap, and ads. Standard allows 1GB with ads. Premium and Admin have unlimited storage and no ads. There is no payment integration in this build. Plan changes are handled by the operator.",
  ],
};

const PRIVACY = {
  ko: [
    "MyBrary는 개인 스크랩 상자입니다. 이 방침은 지금 클라이언트가 실제로 저장하는 것만 말합니다.",
    "계정: 이메일과 비밀번호, Google, 또는 둘러보기(익명 세션)는 Supabase Auth가 다룹니다. 아이디 찾기와 비밀번호 재설정은 이메일 안내를 보냅니다. Google 계정은 Google로 계속으로 들어옵니다. 조각과 미디어는 해당 계정 RLS 뒤로만 보입니다.",
    "이 기기: 언어, 화면 모드, 컬러 테마만 이 브라우저에 남습니다. 광고 쿠키나 추적 스크립트는 실지 않습니다.",
    "열람과 삭제: 앱에서 조각을 떼거나 나가기를 할 수 있습니다. 문의 이메일은 아래에 있으며, 값이 없으면 「표시 예정」입니다.",
    "제3자: Google 로그인은 Google과 Supabase Auth를 거칩니다. 로그인 안내·비밀번호 재설정 메일도 Supabase Auth가 보냅니다. 이미지 자동 인식은 로그인된 요청만 서버 함수를 통해 Claude API로 갑니다. Anthropic 키는 브라우저에 두지 않습니다.",
  ],
  en: [
    "MyBrary is a personal capture box. This notice describes what the client actually stores.",
    "Account: Email and password, Google, or Browse (an anonymous session), are handled by Supabase Auth. Find email and password reset send email instructions. Google accounts sign in with Continue with Google. Scraps and media are visible only behind that account’s RLS.",
    "On this device: Language, appearance, and color theme stay in this browser. This build does not ship advertising cookies or trackers.",
    "Access and deletion: You can peel scraps in the app or Leave. The contact email is below. Empty fields read “To be shown”.",
    "Third parties: Google sign-in goes through Google and Supabase Auth. Sign-in and password-reset emails also go through Supabase Auth. Image auto-recognition goes to Claude through a server function, only with a signed-in request. The Anthropic key is never in the browser.",
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
