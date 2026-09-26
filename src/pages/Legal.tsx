import { Link, useLocation } from "react-router-dom";
import { t } from "../i18n";
import { usePrefs } from "../context/Prefs";

const TERMS = {
  ko: [
    "MyBrary는 웹에서 본 것, 사진, 파일을 한곳에 모아 나만의 서재로 만드는 개인용 서비스입니다. 팀 공간이나 쇼핑몰이 아닙니다.",
    "이용: 이메일이나 Google로 들어오거나 둘러보기로 들어선 뒤 붙여넣기, 파일 첨부, 분류, 목록 찾기를 사용할 수 있습니다. 기록은 그 세션의 본인만 다룹니다.",
    "저장: 항목은 Supabase Postgres에, 파일은 비공개 Storage에 계정별로 남습니다. 환경 변수가 없으면 서재를 열 수 없습니다.",
    "운영: 운영 주체, 대표, 주소, 연락처는 아래에 표시합니다. 값이 없으면 「표시 예정」입니다. 이 문서는 없는 번호를 만들지 않습니다.",
    "책임: 담은 내용의 권리는 담은 사람에게 있습니다. 자동 분류는 도울 뿐, 외부 사이트의 내용을 보증하지 않습니다.",
    "등급: Free는 가입 후 14일 체험과 100MB 업로드 한도, 한 번에 파일 1개, 광고가 있습니다. Middle은 500MB와 파일 3개, 광고가 있습니다. High·Admin은 1GB(Admin은 무제한)와 파일 무제한, 광고 없음입니다. 결제 연동은 준비 중이며, 이후 유료 플랜으로 사용자가 등급을 선택합니다. 자세한 비교는 등급 안내 페이지를 보세요.",
  ],
  en: [
    "MyBrary is a personal library for things you saw on the web, photos, and files. It is not a team space or a store.",
    "Use: After email, Google, or Browse you can paste, attach, classify, and find items. Only that session’s owner manages their records.",
    "Storage: Items live in Supabase Postgres. Files go in a private Storage bucket per account. Without env vars the library does not open.",
    "Operator: Operator, representative, address, and contact appear below. Empty fields read “To be shown”. This page does not invent registration numbers.",
    "Responsibility: Rights in saved material stay with the person who saved it. Auto-classify helps. It does not guarantee third-party pages.",
    "Plans: Free includes a 14-day trial, 100MB upload, one file per stick, and ads. Middle allows 500MB and three files with ads. High and Admin allow 1GB (Admin unlimited) with unlimited files and no ads. Payment is not wired yet. Later, paid plans will let users choose their tier. See the Plans page for a side-by-side compare.",
  ],
};

const PRIVACY = {
  ko: [
    "MyBrary는 개인 서재입니다. 이 방침은 지금 클라이언트가 실제로 저장하는 것만 말합니다.",
    "계정: 이메일과 비밀번호, Google, 또는 둘러보기(익명 세션)는 Supabase Auth가 다룹니다. 아이디 찾기와 비밀번호 재설정은 이메일 안내를 보냅니다. Google 계정은 Google로 계속으로 들어옵니다. 항목과 미디어는 해당 계정 RLS 뒤로만 보입니다.",
    "이 기기: 언어, 화면 모드, 컬러 테마만 이 브라우저에 남습니다. 광고 쿠키나 추적 스크립트는 실지 않습니다.",
    "열람과 삭제: 앱에서 항목을 빼거나 나가기를 할 수 있습니다. 문의 이메일은 아래에 있으며, 값이 없으면 「표시 예정」입니다.",
    "제3자: Google 로그인은 Google과 Supabase Auth를 거칩니다. 로그인 안내·비밀번호 재설정 메일도 Supabase Auth가 보냅니다. 이미지 자동 인식은 로그인된 요청만 서버 함수를 통해 Claude API로 갑니다. Anthropic 키는 브라우저에 두지 않습니다.",
  ],
  en: [
    "MyBrary is a personal library. This notice describes what the client actually stores.",
    "Account: Email and password, Google, or Browse (an anonymous session), are handled by Supabase Auth. Find email and password reset send email instructions. Google accounts sign in with Continue with Google. Items and media are visible only behind that account’s RLS.",
    "On this device: Language, appearance, and color theme stay in this browser. This build does not ship advertising cookies or trackers.",
    "Access and deletion: You can remove items in the app or Leave. The contact email is below. Empty fields read “To be shown”.",
    "Third parties: Google sign-in goes through Google and Supabase Auth. Sign-in and password-reset emails also go through Supabase Auth. Image auto-recognition goes to Claude through a server function, only with a signed-in request. The Anthropic key is never in the browser.",
  ],
};

export function Legal() {
  const { lang } = usePrefs();
  const privacy = useLocation().pathname.endsWith("privacy");
  const title = t(lang, privacy ? "privacy" : "terms");
  const paragraphs = privacy ? PRIVACY[lang] : TERMS[lang];

  return (
    <article className="legal-page">
      <h1 className="legal-title">{title}</h1>
      <p className="legal-updated">{t(lang, "legalUpdated")}</p>
      {paragraphs.map((p) => (
        <p key={p} className="legal-body">
          {p}
        </p>
      ))}
      <p className="legal-home">
        <Link to="/upgrade" className="text-magnet">
          {t(lang, "upgradeTitle")}
        </Link>
        {" · "}
        <Link to="/" className="text-magnet">
          {t(lang, "appName")}
        </Link>
      </p>
    </article>
  );
}
