# MyBrary

## 이 프로젝트는 무엇인가

**MyBrary**는 웹에서 본 것, 사진, 파일을 한곳에 **꽂고 · 분류하고 · 다시 찾는** 개인용 스크랩 상자입니다. 팀 지식베이스나 레시피 앱이 아닙니다.

### 역할

| 역할 | 설명 |
| --- | --- |
| 붙이기 (Stick) | 붙여넣기, 드래그앤드롭, 클립보드·카메라·사진·파일로 조각을 넣습니다. |
| 분류 (Classify) | Claude(`/api/analyze`) 또는 MIME/URL 휴리스틱으로 유형·태그를 붙인 뒤 미리보고 저장합니다. |
| 찾기 (Find) | 최신순 목록에서 검색·유형·일자별 필터로 찾고, 상세(`/scrap/:id`)와 통계(`/dashboard`)로 봅니다. |

### 주요 기능

- 이메일 / Google / **둘러보기**(익명) 로그인, 아이디·비밀번호 찾기
- ChatGPT 스타일 **플로팅 입력창** (법적 Footer와 분리), 분류 드래프트는 입력창 위
- Supabase `scraps` + 비공개 `scrap-media`에 계정별 저장 (RLS)
- **둘러보기는 이 기기 localStorage에 저장** (파일 1.5MB, 합계 약 4MB). 첫 저장 때 1회 안내, 계정 로그인 시 옮길지 물어봄
- 회원 등급(무료 체험·중간·고급·관리자): 용량·광고·체험 정책 (결제 없음, 운영자 수동 변경)
- 설정: 언어·Look(기본/책장)·팔레트·테마, 저장 사용량, **DB 초기화**(내 조각·미디어만)
- KO / EN, 기본(한라봉)·현무암 팔레트, light / system / dark

### 문서 · 라이브

- 로드맵: [ROADMAP.md](ROADMAP.md) · 제품: [PRODUCT.md](PRODUCT.md) · 디자인: [DESIGN.md](DESIGN.md) · 구조: [ARCHITECTURE.md](ARCHITECTURE.md)
- 라이브: [https://mybrary-snuu09.web.app](https://mybrary-snuu09.web.app)

스택: Vite + React (TypeScript) SPA · Firebase Hosting(`mybrary-snuu09`) · Auth/DB/Storage는 Supabase · 분류는 Cloud Function `/api/analyze`(Netlify Function 트윈 있음).

---

## 로컬 실행

```bash
cp .env.example .env
# VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 입력
npm install
npm run dev
```

보통 [http://localhost:5173](http://localhost:5173) 입니다. `@netlify/vite-plugin`으로 함수도 같은 개발 서버에서 붙습니다.

```bash
npm run build
```

## 환경 변수

| 이름 | 위치 | 역할 |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Vite (`dist`에 포함) | 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Vite (`dist`에 포함) | anon / publishable 키 (`service_role` 금지) |
| `VITE_ADMOB_PUBLISHER_ID` | Vite (선택) | AdMob/AdSense `ca-pub-…` (무료·중간 등급 배너) |
| `VITE_ADMOB_BANNER_SLOT` | Vite (선택) | 배너 슬롯 ID |
| `ANTHROPIC_API_KEY` | Cloud / Netlify Function | Anthropic SDK. 브라우저에 두지 않음 |
| `SUPABASE_URL` | Cloud Function만 | JWT 검증용 프로젝트 URL |
| `SUPABASE_ANON_KEY` | Cloud Function만 | JWT 검증용 anon 키 |

## 사용 흐름

1. 인트로 **책장을 연다** 또는 헤더 **로그인**: chooser(Google / 이메일 / 둘러보기), 회원가입 확인 비밀번호, 찾기/재설정. env가 비면 설정 안내가 나옵니다.
2. 책장에서 플로팅 Stick(한 줄 compact)으로 붙여넣기·드롭·**+**(스크림). 분류는 함수가 살아 있으면 Claude, 아니면 MIME/URL. URL은 OG도 붙입니다. 드래프트는 입력 알약 위에 뜹니다.
3. 태그 확인 후 저장 → Supabase. 최신순 목록. 검색·유형·**일자별**은 AND. 행 탭 → `/scrap/:id`. 헤더 **통계** → `/dashboard`.
4. 등급·체험·용량은 설정에서 확인. **DB 초기화**는 그 계정의 조각·미디어만 지웁니다. 언어·Look·테마·팔레트는 이 기기에만. **나가기**로 인트로.
5. **둘러보기**는 계정이 아니라 이 브라우저(`mybrary.guest.*`)에 저장합니다. 첫 저장 전에 안내 시트가 한 번 뜨고, 같은 브라우저로 다시 둘러보기하면 그 조각을 이어서 봅니다. 다른 브라우저·시크릿·기록 삭제는 복구 경로가 없습니다. 이메일·Google로 로그인하면 이 기기의 조각을 계정으로 옮길지 한 번 물어봅니다.

## 배포 (Firebase Hosting)

라이브: [https://mybrary-snuu09.web.app](https://mybrary-snuu09.web.app) · [https://mybrary-snuu09.firebaseapp.com](https://mybrary-snuu09.firebaseapp.com)

### Push → 라이브 (무료)

`main`에 push하면 [`.github/workflows/firebase-hosting.yml`](.github/workflows/firebase-hosting.yml)이 `dist`를 빌드해 Hosting **live**에 올립니다. 공개 저장소 GitHub Actions 분 + Hosting Spark 할당량만 쓰며, Cloud Functions는 이 워크플로에서 배포하지 않습니다.

한 번만 GitHub Actions secrets가 필요합니다 (`Settings → Secrets and variables → Actions`):

| Secret | 용도 |
| --- | --- |
| `FIREBASE_SERVICE_ACCOUNT_MYBRARY_SNUU09` | Hosting 배포용 서비스 계정 JSON (`firebase init hosting:github`가 만들어 줌) |
| `VITE_SUPABASE_URL` | 빌드 시 Vite에 주입 |
| `VITE_SUPABASE_ANON_KEY` | 빌드 시 Vite에 주입 |
| `VITE_ADMOB_PUBLISHER_ID` / `VITE_ADMOB_BANNER_SLOT` | 선택 |

로컬에서 서비스 계정 시크릿만 만들 때: `npx -y firebase-tools@latest init hosting:github --project mybrary-snuu09` (저장소 `snuu09/myScrap`). Vite 시크릿은 `.env` 값을 repo secrets에 수동으로 넣거나 `gh secret set`로 넣습니다.

로컬 수동 배포는 그대로 `npm run deploy:hosting`입니다.

### 백엔드 · Auth

1. Supabase Auth에서 Email, Google, Anonymous 활성화. 마이그레이션 순서: [20260820140000_scraps_media_realtime.sql](supabase/migrations/20260820140000_scraps_media_realtime.sql) → [20260829143000_profiles_plans.sql](supabase/migrations/20260829143000_profiles_plans.sql) → [20260905100000_scrap_engagement.sql](supabase/migrations/20260905100000_scrap_engagement.sql). Redirect URL에 위 Hosting 도메인 추가. 등급/관리자 수동 설정은 [supabase/README.md](supabase/README.md).
2. 분류: [functions/src/index.ts](functions/src/index.ts), Hosting rewrite `/api/analyze`. 2세대 Functions는 Blaze 필요. 미배포 시 클라이언트 MIME/URL 폴백. Blaze면 `functions/.env`에 `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` 후 `npx -y firebase-tools@latest deploy --only functions,hosting`.
3. 모델 ID는 `claude-sonnet-4-5` (과제명의 `claude-sonnet-5`는 현재 id가 아님).

Netlify는 선택: `npm run build`, publish `dist`, 동일 Vite 키 + 사이트 env의 `ANTHROPIC_API_KEY`. Netlify 분석 함수는 [netlify/functions/analyze.ts](netlify/functions/analyze.ts).

## 폴더 구조

```
src/                   React UI, Plan, 필터, 둘러보기 로컬 저장, AdMob 슬롯, i18n
public/assets/         파비콘, 인트로 스틸
firebase.json          Hosting(dist) + /api/analyze rewrite
functions/             Cloud Function 분류 (JWT 필요)
netlify/functions/     Netlify용 동일 분류
supabase/              scraps RLS, profiles/plans, scrap-media, 선택 og-preview
```
