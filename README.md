# 링크나무

내 모든 링크를 한 페이지에 모아 하나의 URL로 공유하는 Link in Bio 서비스입니다.
(기획: `PRD.md`, 화면 설계: `wireframe.png`)

## 기술 스택

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (다크모드: `class` 전략)
- MongoDB Atlas (링크 클릭 수 저장)
- Vercel (배포)

## 시작하기

```bash
npm install
```

MongoDB 연결 문자열을 `.env.local` 파일에 넣습니다. 이 파일은 커밋하지 않습니다.

```bash
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
```

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

## 콘텐츠 수정

프로필(이름, 소개, 사진)과 링크 목록은 `src/data/profile.ts` 에서 수정합니다.
링크 `id` 는 클릭 수 집계의 키이므로 한 번 정하면 바꾸지 마세요.

## 구조

```
src/
├── app/
│   ├── page.tsx              # 메인 링크나무 페이지
│   ├── layout.tsx            # 공통 레이아웃, 테마 초기화 스크립트
│   └── api/click/route.ts    # 링크 클릭 수 기록 (POST)
├── components/
│   ├── ProfileHeader.tsx     # 프로필 사진, 이름, 한 줄 소개
│   ├── LinkCard.tsx          # 링크 카드 (클릭 시 집계)
│   └── ThemeToggle.tsx       # 다크모드 토글
├── data/profile.ts           # 프로필 및 링크 데이터
└── lib/mongodb.ts            # MongoDB 클라이언트 (개발 모드 캐시)
```

MongoDB 의 `linknamu` 데이터베이스 `link_clicks` 컬렉션에 `{ _id: <링크 id>, count, updatedAt }` 형태로 저장됩니다.

## 배포

Vercel 에 프로젝트를 연결하고 환경 변수 `MONGODB_URI` 를 설정하면 됩니다.
