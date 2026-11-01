# 기술 아키텍처

## 현재 구현

단일 Next.js Pages Router 프로젝트입니다. React, TypeScript strict, Tailwind CSS v4, ESLint flat config를 사용합니다. `src/pages/_app.tsx`가 전역 CSS를 로드하고 `_document.tsx`가 한국어 문서 언어를 지정합니다. `index.tsx`는 정적 최적화 가능한 최소 페이지입니다. App Router, API 라우트, 별도 서버와 DB는 없습니다.

패키지는 pnpm과 lockfile로 관리합니다. Node.js는 24.x를 사용합니다. 경로 별칭은 `@/*` → `src/*`입니다. 빌드·lint·타입 검사는 독립 명령으로 실행합니다. 외부 폰트 요청 없이 시스템 폰트만 사용합니다.

TypeScript 검사에서 `.next/dev`를 제외하고 프로덕션 생성 타입 `.next/types`를 검사합니다. Next.js 16.4.3의 Pages Router가 생성하는 개발/빌드 validator 파일의 같은 타입명이 전역에서 충돌하는 것을 방지합니다. 실제 `src` 코드는 모두 검사합니다.

## 향후 렌더링 전략

| 화면/기능 | 전략 | 이유 |
| --- | --- | --- |
| 홈·서비스 소개 | SSG/정적 최적화 | 공통 콘텐츠의 빠른 첫 응답 |
| 탐색 기본 목록 | SSG | 로컬 곡 데이터로 초기 HTML 제공 |
| 찬양 상세 | `getStaticPaths` + `getStaticProps` | 곡별 URL을 빌드 시 생성 |
| 감정·메시지 선택, 추천 상호작용 | CSR | 개인 선택은 React 상태에서 처리 |
| 검색·필터·즐겨찾기·실험 UI | CSR | 브라우저 상태에 따른 변경 |
| 요청 시점 데이터 POC | 필요성이 확인될 때 SSR | MVP에는 필수 SSR 화면 없음 |

SSG 페이지에 CSR 상호작용을 결합합니다. SSR 사용을 위한 불필요한 서버 호출은 추가하지 않습니다. Vercel의 Next.js 관리형 실행 환경을 사용할 계획이며 정적 export는 현재 강제하지 않습니다.

## 향후 데이터와 책임 분리

- `data/songs`: 로컬 TypeScript/JSON 곡 메타데이터. 고유 ID, slug, 장르, 감정/메시지 태그, 검증된 크레딧, 영상 ID와 출처를 관리할 예정입니다.
- 소개글: 로컬 JSON을 우선 검토하고 풍부한 문서 표현이 필요할 때 MDX를 검토합니다.
- `features/recommendations`: 입력과 곡 목록을 받아 결과/점수/이유를 반환하는 순수 TypeScript 함수. 가중치·동점·일치 없음 정책은 구현 시 확정합니다.
- `features/emotions`, `songs`, `favorites`, `experiments`: 해당 기능이 생길 때 생성합니다.
- `components/common`, `layout`, `song`: 반복되는 UI가 생길 때 추출합니다.
- `i18n`: Pages Router와 호환되는 i18next 계열 구성을 Phase 2에서 결정합니다. 콘텐츠도 한국어/영어를 분리합니다.

즐겨찾기는 hydration 후 localStorage에서 읽습니다. 서버 렌더 중 `window`에 접근하지 않고, 잘못된 JSON·저장소 차단·기존 곡 삭제를 처리합니다. 서버 HTML과 초기 클라이언트 렌더가 달라지지 않도록 합니다. 감정 선택은 초기에는 React 상태로만 관리합니다.

## 품질과 확장

접근성을 기능 개발부터 반영하고 Phase 2에서 집중 점검합니다. Phase 3에서 추천 함수의 경계 사례와 사용자 흐름에 맞춰 Vitest/RTL, Storybook, 접근성 검사, GitHub Actions, Lighthouse를 도입합니다. 썸네일이 생기면 `next/image`, 크기 지정과 원격 이미지 허용 범위를 검토합니다.

기능 플래그와 이벤트 기록은 Phase 4 POC입니다. 개인정보나 감정 정보를 불필요하게 수집하지 않도록 이벤트 범위를 먼저 정합니다. 실제 사용자 규모가 작다면 통계적 결론을 내리지 않습니다.

Workspaces/Turborepo는 실제 공통 패키지 분리 필요가 있을 때만 도입합니다. Module Federation은 독립 배포 앱이 없다면 도입하지 않습니다. 환경 변수는 현재 필요하지 않으며, 비밀값을 공개 번들이나 `NEXT_PUBLIC_`에 넣지 않습니다.
