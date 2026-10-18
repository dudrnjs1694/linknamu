# 인수인계: 배그 감도 찾기 작업 (PC방 로컬 폴더로 이어서 하기)

> 이 파일을 새 Claude 세션에 가장 먼저 읽히면 된다. "docs/HANDOFF.md 읽고 이어서 하자"라고 말하면 된다.

## 1. 지금까지 한 것
- 기획서: `docs/pubg-sensitivity-finder-plan.md` (v0.6.2, 6차 리뷰 치명 0건, 구현 착수 가능 판정)
- PC방 체크리스트: `docs/phase0-checklist.md`
- 실측 결과: `docs/phase0-results.md` (A 환경 완료, B 설정 메뉴 거의 완료)
- 구현: `src/lib/sens/` 도메인 로직 + vitest 27건 통과
  - `bisect.ts` 일반 감도 탐색(기획서 §6-B), `compare.ts`, `math.ts`, `presets.ts`, `interp.ts`, `schema.ts`, `storage.ts`, `constants.ts`
- UI(`src/app/sens/`)는 아직 없음. Phase 0 D2(명중 피드백) 결과 후 시작.

## 2. 사용자 전제
- 개인용, PC방 플레이, 폰 = iPhone 14 Pro(iOS)
- 마우스 = 로지텍 G102 LIGHTSYNC, DPI 800 · 보고율 1000 고정(G HUB에서 800 단계만 남김)
- 평소 감도: 일반 30, 수직 1.15, 조준 30, 스코프 모드 30, 통합 스코프 OFF, 2x 28 / 3x 25 / 4x 23 / 6x 20 / 8x 18 / 15x 15
- 앵글 손잡이는 게임에서 삭제됨

## 3. 다음 할 일 (순서대로)
1. Phase 0 남은 항목: B3 소수 입력, **D2 정지 표적 명중 피드백**, D1·D3~D6, **E1 같은 감도 1바퀴 5회**, **E2 감도 20/35/50/65/80 1바퀴 거리**, E3~E5, C1 설정 보존, F
2. 결과를 `docs/phase0-results.md`에 기록하고 `src/lib/sens/constants.ts` 상수 갱신
3. `src/app/sens/` 퀵 모드 UI 구현 (기획서 §4, §7)

## 4. PC방 컴퓨터에서 여는 법
1. 브라우저에서 GitHub에 로그인한 상태로 아래 주소를 연다 (ZIP 다운로드)
   `https://github.com/dudrnjs1694/linknamu/archive/refs/heads/claude/battlegrounds-sensitivity-finder-plan-ilt4lb.zip`
2. 압축을 풀고 그 폴더를 Claude 앱(Claude Code)에서 작업 폴더로 연다
3. 테스트까지 돌리려면 Node.js가 필요하다: 폴더에서 `npm ci` → `npm test`
   (Node가 없고 설치도 막혀 있으면 문서 작업과 실측 기록만 하고, 코드 실행은 클라우드 세션에서)

## 5. 주의 (PC방)
- **PC방 컴퓨터는 재부팅하면 폴더가 사라질 수 있다.** 작업 원본은 GitHub 브랜치 `claude/battlegrounds-sensitivity-finder-plan-ilt4lb`다.
- ZIP으로 받은 폴더에는 git 연결이 없다. 바뀐 파일은 나가기 전에 GitHub에 올리거나(웹 업로드 또는 git), 클라우드 Claude 세션에 내용을 붙여 넣어 반영한다.
- GitHub에 로그인했다면 **나갈 때 로그아웃**하고, 브라우저 저장 비밀번호도 지운다.
