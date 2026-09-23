# maco

메모를 git 커밋처럼 다루는 로컬퍼스트 메모 앱입니다.

**https://maco-chi.vercel.app**

- **커밋처럼 쌓이는 메모**: 메모는 이모지 하나와 한 줄 메시지로 남기고, 월별 타임라인으로 봅니다.
- **불변 리비전**: 수정하면 기존 행을 덮어쓰지 않고 새 리비전을 쌓습니다. 수정 이력은 `/commit/[note_id]/history`에서 봅니다.
- **스레드**: 메모에 이어 쓰면 원본 메모 아래로 스레드가 자랍니다.
- **로컬퍼스트 쓰기**: 쓰기는 먼저 브라우저의 IndexedDB 아웃박스에 들어가고, 백그라운드에서 서버로 동기화됩니다.

## 어떻게 동작하나

`commits` 테이블의 한 행은 메모 하나의 **불변 리비전**입니다.

| 필드 | 의미 |
| --- | --- |
| `hash` | 브라우저가 내용에서 계산한 해시이자 PK. 같은 리비전을 여러 번 보내도 결과가 같습니다(멱등) |
| `note_id` | 수정해도 바뀌지 않는 메모의 정체성 |
| `parent_hash` | 같은 메모의 직전 리비전 |
| `deleted` | 삭제는 행을 지우지 않고 톰스톤 리비전을 쌓습니다 |
| `reply_to_note_id` · `root_note_id` | 스레드 구조. 답글은 리비전이 아니라 메모를 가리킵니다 |

메모의 현재 내용은 같은 `note_id` 중 `hlc`(하이브리드 논리 시계)가 가장 큰 리비전입니다. 서버는 세션의 `user_id`로 해시를 다시 계산해 맞지 않으면 거절하고, 요청 본문의 `user_id`는 믿지 않습니다.

설계 배경은 [`docs/`](docs)에 있습니다.

- [`local-first.md`](docs/local-first.md): git 객체 모델에서 무엇을 가져오고 무엇을 버렸는지, 동기화 설계
- [`git-concept.md`](docs/git-concept.md): 메모를 커밋·참조·스레드로 다루는 구상과 진행 현황
- [`instant-navigations.md`](docs/instant-navigations.md): Next.js 16.3 Instant Navigations 도입 검토

## 기술 스택

- [Next.js](https://nextjs.org) 16 (App Router, Server Components, Server Actions) · React 19
- [Effect](https://effect.website): 서비스 계층, 의존성 주입, 태그 기반 오류 처리
- [Drizzle ORM](https://orm.drizzle.team) + [Turso](https://turso.tech)(libSQL)
- [Auth.js](https://authjs.dev)(NextAuth v5): GitHub OAuth
- Tailwind CSS · CSS Modules · Framer Motion

## 로컬 실행

pnpm이 필요합니다.

```bash
pnpm install
```

`.env.local`에 환경 변수를 넣습니다.

```bash
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...

AUTH_SECRET=...            # npx auth secret 으로 생성
AUTH_GITHUB_ID=...         # GitHub OAuth App
AUTH_GITHUB_SECRET=...
```

GitHub OAuth App의 콜백 URL은 `http://localhost:3000/api/auth/callback/github`입니다.

```bash
pnpm db:migrate   # drizzle/ 마이그레이션 적용
pnpm dev
```

## 명령

| 명령 | 설명 |
| --- | --- |
| `pnpm dev` | 개발 서버 |
| `pnpm build` · `pnpm start` | 프로덕션 빌드와 실행 |
| `pnpm lint` | ESLint |
| `pnpm db:generate` | `db/schema.ts`에서 마이그레이션 생성 |
| `pnpm db:migrate` | 마이그레이션 적용 |
| `pnpm db:studio` | Drizzle Studio |
| `pnpm db:migrate-legacy [-- --dry]` | 옛 덮어쓰기 모델의 `commits`를 리비전 모델로 이관. 새 데이터베이스에는 필요 없습니다 |

## 구조

```
app/        라우트와 컴포넌트 (/, /commit/[id], /commit/[id]/history, /account)
services/   Effect 서비스 — Commit, User, Sql, NextAuth
lib/        해시, HLC, 리비전, 아웃박스, 동기화, 인증, 날짜·타임존
runtime/    Effect 실행 경계 (앱 런타임, 서버 렌더·액션에서 실행)
db/         Drizzle 스키마
drizzle/    마이그레이션
docs/       설계 문서
scripts/    데이터 이관 스크립트
```
