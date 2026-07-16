# TODO — 로드맵

memos / Reflect 오픈소스 검토에서 도출한 개선 항목 정리.

## ✅ 완료 (memos 검토 반영)

- [x] **Markdown 렌더링** — react-markdown + remark-gfm, 목록 읽기 뷰
- [x] **태그 `#tag`** — 파싱(한글 지원) · 태그 필터 · 필터 바
- [x] **검색** — message LIKE 검색(전체 기간), 무JS GET 폼
- [x] **활동 히트맵** — 일자별 카운트, 26주 잔디형 그리드
- [x] **고정(Pin)** — `commits.pinned` 컬럼, 상단 정렬 · 토글

## 🔜 백로그 (우선순위순)

권장 진행 순서: **1 → 5 → 2 → 3 → 4** (저비용 우선, AI는 마지막)

### 1. 태그 페이지 (백링크형) — 🟢 낮음 · Reflect

- `#tag` 필터를 `/tag/[name]` 전용 페이지로 승격
- 해당 태그의 모든 커밋 + 함께 자주 쓰인 **연관 태그** 표시
- 재사용: `parseTags` / `CommitService.getTags`
- 스키마 변경 없음

### 2. ⌘K 커맨드 팔레트 — 🟡 중간 · Reflect

- 어디서든 빠른 검색 + 바로 새 커밋 작성 모달
- 재사용: `SearchBox` / 검색 로직
- 클라이언트 컴포넌트 + 키바인딩

### 3. Visibility + 공유 링크 — 🟡 중간 · memos / Reflect(`private`)

- 커밋별 공개 범위(비공개 / 공개)
- 공개 permalink 라우트
- 재사용: `pinned` 때의 컬럼 추가 패턴 (`drizzle-kit push`)
- 4번(AI) 노출 여부(`private`)와 같은 개념 → AI 진행 시 함께

### 4. AI "내 저널에 묻기" — 🔴 높음 · Reflect(⌘J)

- 사용자 제공 API 키(Anthropic 등)로 저널 질의
- 응답에 **출처 커밋 인용**
- 3번 visibility(`private` 제외)와 연동
- API 키 관리 + LLM 연동 필요 → 마지막 권장

### 5. Export (Markdown / JSON) — 🟢 낮음 · memos / Reflect

- 내 데이터 내보내기 서버 액션
- "내 데이터는 내 것" 이식성
- 스키마 변경 없음

## 참고 — 이식 대상 아님

스택/범위 불일치로 제외 (가치는 아이디어에만):

- 오디오 메모(녹음·전사), 브라우저 확장 캡처, CLI 도구
- iCloud / git 파일 동기화, Tauri/Rust 데스크톱 앱
- Go / gRPC / self-host 인프라 (memos)
