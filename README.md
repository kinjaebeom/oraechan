# 오래찬 (Oraechan)

> 오늘의 마음에, 오래된 찬양 한 곡

감정과 현재 상황에 맞는 전통 찬송가와 오래 사랑받은 CCM을 발견하는 큐레이션 웹 서비스입니다. 음악 스트리밍을 대체하지 않고, 직접 작성한 소개와 추천 이유를 통해 찬양의 배경과 메시지를 전합니다.

## 현재 상태

**Phase 0 — 초기 개발 환경과 기획 문서만 구성했습니다.** 시작 페이지에는 서비스명과 슬로건만 표시합니다. 추천·검색·재생·즐겨찾기·다국어는 아직 구현하지 않았습니다.

디자인 기준은 사용자가 제공한 [파송 UI 프로토타입](docs/references/pasong-ui-prototype.html)입니다. 시각적 방향을 채택하되 실제 브랜드명은 **오래찬**을 사용합니다. 참고 파일의 동작과 콘텐츠는 제품 구현이나 검증된 데이터가 아닙니다.

## 기술 스택

- Node.js 24.x / pnpm 10.23.0
- Next.js 16.4.3 — **Pages Router**
- React / React DOM 19.3.1
- TypeScript 5.9.x, strict 모드
- Tailwind CSS 4.3.3 / PostCSS
- ESLint 9.39.5 / eslint-config-next 16.4.3

정확한 설치 버전은 `pnpm-lock.yaml`을 기준으로 합니다. TypeScript는 Next.js 생태계와의 호환성을 고려해 5.9 계열로 시작합니다. 상태 관리·테스트·다국어 도구는 필요 시점에 도입합니다.

ESLint 10은 현재 설치되는 Next.js의 React/import/jsx-a11y 플러그인 peer 범위를 벗어나므로 9.39.5로 맞췄습니다. 설치 시 지원 종료 경고가 발생하며, 해당 플러그인이 ESLint 10을 지원하면 함께 업그레이드해야 합니다.

이 Windows 환경에서 Turbopack의 PostCSS 자식 프로세스 연결이 실패해 개발/빌드는 Next.js가 지원하는 Webpack 모드를 사용합니다. TypeScript는 개발/빌드 생성 타입의 중복을 방지하기 위해 `.next/dev`를 제외합니다.

## 로컬 실행

Node.js 24.x와 pnpm 10.23.0을 준비합니다. pnpm이 없다면 `npm install -g pnpm@10.23.0`으로 설치할 수 있습니다.

```bash
pnpm install
pnpm dev
```

[로컬 개발 서버](http://localhost:3000)를 엽니다. 종료는 터미널에서 `Ctrl+C`입니다.

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm start
```

`start`는 `build` 성공 후 사용하는 프로덕션 서버입니다. Next.js 16은 빌드에서 lint를 자동 실행하지 않으므로 lint와 build를 별도로 실행합니다. 다른 포트가 필요하면 `pnpm dev --port 3001`을 사용합니다.

## 폴더 구조

```text
src/
  pages/
    _app.tsx          # 전역 스타일 연결
    _document.tsx     # 한국어 문서 설정
    index.tsx         # 최소 시작 화면
  styles/globals.css  # Tailwind 및 파송 기반 색상
docs/
  product-requirements.md
  architecture.md
  design-system.md
  roadmap.md
  references/pasong-ui-prototype.html
```

루트에는 Next.js·TypeScript·ESLint·PostCSS 설정, 패키지/잠금 파일, `.nvmrc`, `.gitignore`가 있습니다. 컴포넌트·기능·데이터 폴더는 실제 코드가 생기는 시점에 추가합니다.

`AGENTS.md`는 Next.js 개발 서버가 자동 생성한 에이전트용 안내입니다.

## 초기 검증 기록 (2026-11-02)

- `pnpm install`: 완료, lockfile 생성. ESLint 지원 종료 경고는 위 호환성 설명 참고.
- `pnpm lint`: 경고/오류 없이 통과.
- `pnpm typecheck`: 통과.
- `pnpm build`: Webpack 모드 통과, `/`와 `/404` 정적 생성.
- `pnpm dev`: 기동 후 `/` HTTP 200, 서비스명·슬로건·`lang="ko"` 응답 확인. 검증 후 서버 종료.
- 참고 HTML의 SHA-256이 제공 원본과 일치함을 확인.

검증은 명령 실행과 HTTP 응답 확인 기준이며, 브라우저 시각 검수는 이번 최소 시작 화면 단계에서 수행하지 않았습니다.

## 기획 문서

- [서비스 요구사항](docs/product-requirements.md)
- [아키텍처와 렌더링 전략](docs/architecture.md)
- [파송 UI 기반 디자인 시스템](docs/design-system.md)
- [단계별 개발 로드맵](docs/roadmap.md)

## 배포 및 Git

저장소: [kinjaebeom/oraechan](https://github.com/kinjaebeom/oraechan)

향후 Vercel에서 Next.js 프리셋, Node.js 24, `pnpm build`로 배포할 계획입니다. 이번 단계에서는 실제 배포·원격 push·PR을 수행하지 않습니다. 초기 환경에는 환경 변수가 필요하지 않습니다. `.env*`, 인증키, 빌드 산출물은 Git에서 제외하며, 향후 `NEXT_PUBLIC_`에는 공개 가능한 값만 넣습니다.

추천 초기 커밋 메시지: `chore: initialize Oraechan frontend and planning docs`

설정 참고: [Next.js Pages Router 설치](https://nextjs.org/docs/pages/getting-started/installation), [Tailwind CSS 설치](https://tailwindcss.com/docs/installation/framework-guides/nextjs).
