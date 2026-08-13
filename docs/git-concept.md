# 메모를 git 개념으로 다루기 — 설계 검토

원래 구상: **메모를 커밋한다 → 커밋은 참조 가능하다 → 참조로부터 브랜치(스레드)가 자란다.**
현재는 `commits` 테이블에 대한 CRUD까지만 구현되어 있다. 이 문서는 다음 단계를 어떤
순서로, 어디까지 가져갈지 결정하기 위한 검토다.

---

## 1. 현재 상태

| 영역 | 구현 |
| --- | --- |
| 스키마 | `users`, `commits` 2개 테이블. `commits`는 `id`(autoincrement), `message`, `emoji`, `created`, `updated`, `user_id` (`db/schema.ts:21`) |
| 조회 | 월 단위 목록 `getList`, 단건 `getItemById`, 최신 1건 `getLatestItem` (`services/Commit.ts`) |
| 쓰기 | `createItem`(insert), `updateItem`(**행 덮어쓰기**) |
| 화면 | 홈 = 월별 목록, `/commit` = 작성 폼, `/commit/[id]` = 수정 폼 |

즉 지금의 "커밋"은 **이름만 커밋이고 실체는 메모 행(row)** 이다.
git 개념이 실제로 코드에 반영된 부분은 아직 없다.

### 가장 중요한 지적

다음 단계로 브랜치를 먼저 떠올리기 쉽지만, 지금 코드에서 git 개념이 결정적으로 빠진
지점은 브랜치가 아니라 **수정(update)** 이다.

```ts
// services/Commit.ts:87
updateItem(params, body) {
  return db.update(commits).set(body).where(eq(commits.id, params.id))
}
```

행을 덮어쓰는 순간 과거 상태는 사라진다. 커밋이 불변이 아니면
"그 커밋을 참조한다"는 말도, "그 지점에서 브랜치를 딴다"는 말도 성립하지 않는다.
참조 대상이 언제든 바뀌는 포인터일 뿐이기 때문이다.

**따라서 순서는 `불변성 → 참조 → 브랜치`다. 브랜치를 먼저 만들면 기반이 없는 위에 쌓는 셈이 된다.**

---

## 2. 핵심 결정 — 은유를 어디까지 밀어붙일 것인가

| 안 | 내용 | 비용 | 결과 |
| --- | --- | --- | --- |
| **A. 얕게** | `parent_id` 컬럼 하나 추가해 답글 트리 | 매우 낮음 | 흔한 트위터 답글. git 색깔은 네이밍뿐 |
| **B. 중간 (권장)** | 커밋 불변 + 콘텐츠 해시 + 부모 참조 + 이름 붙은 ref(브랜치/HEAD) | 중간 | git의 **핵심 모델**을 그대로. 수정 이력·스레드·브랜치가 한 모델에서 나옴 |
| **C. 진짜 git** | blob/tree/commit 객체 저장소, merge, conflict 해소 | 높음 | 메모 앱에는 과잉. merge/conflict는 제품 가치가 거의 없음 |

**권장: B.**

이유는 비용 대비 개념 밀도다. A는 git이라 부를 이유가 없고, C는 merge·conflict처럼
사용자가 원하지 않는 문제를 만든다. B의 3요소 — 불변 객체, 부모 링크, 이름 붙은 포인터 —
만으로 git이 흥미로운 이유(이력이 지워지지 않고, 어느 시점이든 참조되며, 거기서 갈라짐)는
전부 재현된다. merge 없이도 성립한다.

---

## 3. git 개념 ↔ 제품 기능 매핑

| git | 이 앱에서의 의미 | 판정 |
| --- | --- | --- |
| commit | 메모 한 개. **불변** | 1단계 |
| commit hash | 메모의 영구 주소. URL이 됨 (`/c/a1b2c3d`) | 1단계 |
| `--amend` | 메모 수정 = 새 커밋 생성, 이전 버전은 이력에 남음 | 1단계 |
| parent | 이 메모가 이어 쓰는 대상 | 2단계 |
| log | 스레드를 뿌리부터 따라 읽기 | 2단계 |
| branch (ref) | 이름 붙은 스레드 (`main`, `읽은책`, `2026-회고`) | 3단계 |
| HEAD / checkout | "지금 이어 쓰고 있는 곳". 작성 폼의 기본 문맥 | 3단계 |
| tag | 핀 / 북마크 | 4단계 |
| cherry-pick | 다른 스레드의 메모를 내 타임라인으로 인용 | 4단계 |
| revert | 철회 메모 (원문은 남기고 취소 사실을 기록) | 4단계 |
| diff | 수정 이력 비교 화면 | 4단계 |
| merge | 두 스레드 합치기 | **보류** — UX가 어렵고 사용자 요구가 없음 |
| conflict | — | **버림** |
| blob / tree | 첨부파일 | 보류 (첨부 기능이 생기면 재검토) |
| clone / remote / push | 타인 스레드 구독·포크 | 보류 (멀티유저 공개 기능이 생기면) |

merge를 버리는 것이 이 설계의 가장 중요한 생략이다. merge를 포기하면 커밋 그래프는
DAG가 아니라 **트리**로 유지되고, 이 단순화 덕분에 `root_id` 하나로 스레드 전체를
인덱스 스캔 한 번에 가져올 수 있다(§5). 나중에 정말 필요해지면 `commit_parents`
조인 테이블로 확장 가능하니 되돌릴 수 없는 선택은 아니다.

---

## 4. 데이터 모델

### 4.1 `commits` 변경

```ts
export const commits = sqliteTable('commits', {
  id: integer('id').primaryKey(),
  // 콘텐츠 주소. 표시·URL은 앞 7자
  hash: text('hash').notNull().unique(),

  message: text('message').notNull(),
  emoji: text('emoji').notNull(),
  created: text('created').notNull(),
  user_id: text('user_id').notNull().references(() => users.id),

  // ── 스레드 구조 ──
  parent_id: integer('parent_id').references((): AnySQLiteColumn => commits.id),
  root_id: integer('root_id').references((): AnySQLiteColumn => commits.id),
  depth: integer('depth').notNull().default(0),

  // ── 수정 이력 ──
  amends_id: integer('amends_id').references((): AnySQLiteColumn => commits.id),
  superseded_by: integer('superseded_by').references((): AnySQLiteColumn => commits.id),
})
```

- `updated` 컬럼은 **제거**한다. 불변 객체에는 수정 시각이 없다. 수정은 새 행이다.
  (현재도 `updateItem`이 `updated`를 갱신하지 않아 사실상 죽은 컬럼이다.)
- `root_id`, `depth`는 비정규화다. 스레드 조회를 재귀 CTE 없이 인덱스 한 번으로
  끝내기 위한 것이고, 값은 insert 시점에 부모로부터 확정되므로 이후 변하지 않는다.
- `superseded_by`는 유일하게 사후에 갱신되는 필드다(다음 버전이 생길 때 1회).
  개념상 "이 객체를 가리키는 ref"에 가깝고, `WHERE superseded_by IS NULL`로
  최신 버전만 뽑는 쿼리가 단순해지는 대가로 받아들인다.

필요한 인덱스:

```sql
CREATE INDEX commits_user_created  ON commits (user_id, created DESC);
CREATE INDEX commits_root          ON commits (root_id, created);
CREATE INDEX commits_parent        ON commits (parent_id);
CREATE UNIQUE INDEX commits_hash   ON commits (hash);
```

### 4.2 해시 설계

git의 커밋 객체 포맷을 그대로 흉내 낸다.

```ts
// lib/hash.ts
import { createHash } from 'node:crypto'

export function commitHash(input: {
  parent: string | null
  user_id: string
  created: string
  emoji: string
  message: string
}) {
  const body =
    `parent ${input.parent ?? ''}\n` +
    `author ${input.user_id}\n` +
    `created ${input.created}\n` +
    `\n${input.emoji} ${input.message}\n`

  return createHash('sha256')
    .update(`commit ${Buffer.byteLength(body)}\0${body}`)
    .digest('hex')
}
```

`created`와 `user_id`가 들어가므로 같은 내용을 두 번 써도 해시가 충돌하지 않는다
(git이 timestamp·committer를 포함시키는 이유와 같다). 부모 해시가 포함되므로
**조상 중 하나라도 다르면 해시가 다르다** — 이력 전체가 해시에 봉인된다.

### 4.3 amend 규칙 — 답글이 달린 커밋은 수정 불가

수정이 새 커밋을 만들면 "이미 답글이 달린 커밋을 수정하면 자식들은 어디를 가리키나"는
문제가 생긴다. git의 답은 rebase지만, 여기서는 그럴 필요가 없다.

> **자식(답글)이 없는 커밋만 amend할 수 있다. 자식이 있으면 수정 대신 "이어 쓰기"를 유도한다.**

이 규칙은 세 방향에서 맞아떨어진다.

- git의 실제 관행 — 공개(push)된 히스토리는 rewrite하지 않는다
- 트위터의 관행 — 반응이 달린 글은 수정하지 않는다
- 구현 — 자식 재작성(rebase)이 영원히 필요 없어진다

대부분의 수정은 올린 직후 오타 교정이므로 실사용에서 제약이 거의 느껴지지 않는다.
느슨한 변형(수정 허용 + 자식은 옛 커밋을 계속 참조 + 화면에서만 최신 버전으로 해석)도
가능하지만, 표시 로직이 복잡해지는 만큼의 값어치는 없다고 본다.

### 4.4 `refs` 테이블 (3단계)

```ts
export const refs = sqliteTable('refs', {
  id: integer('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),                    // 'main', '읽은책'
  kind: text('kind').notNull(),                    // 'branch' | 'tag'
  head_id: integer('head_id').notNull().references(() => commits.id),
  created: text('created').notNull(),
  updated: text('updated').notNull(),
}, (t) => [unique('refs_user_name').on(t.user_id, t.name)])
```

`users`에 `head_ref_id`를 추가하면 그것이 곧 HEAD(지금 이어 쓰는 브랜치)다.
브랜치에 커밋하면 `refs.head_id`만 앞으로 옮긴다 — git의 fast-forward 그대로다.

---

## 5. 서비스 / 쿼리 설계

`services/Commit.ts`의 메서드 재구성:

```ts
createItem(body)        // parent_id 옵션. 해시 계산, root_id/depth 상속
amendItem(params, body) // 새 커밋 insert + 이전 커밋의 superseded_by 갱신 (자식 없을 때만)
getTimeline(params)     // 월별 루트 커밋 목록 (홈)
getThread(params)       // root_id 기준 스레드 전체
getHistory(params)      // amends 체인 = 한 메모의 수정 이력
getItemByHash(params)   // 해시 prefix 조회
```

핵심 쿼리 3개:

```sql
-- 홈 타임라인: 스레드 루트의 최신 버전만
SELECT * FROM commits
WHERE user_id = ?
  AND parent_id IS NULL
  AND superseded_by IS NULL
  AND strftime('%Y-%m', created) = ?
ORDER BY created DESC;

-- 스레드 전체 (재귀 불필요 — 트리이고 root_id가 비정규화되어 있으므로)
SELECT * FROM commits
WHERE root_id = ? AND superseded_by IS NULL
ORDER BY created ASC;
-- 가져온 뒤 parent_id로 클라이언트에서 트리 구성

-- 해시 prefix 조회 (git의 짧은 해시)
SELECT * FROM commits WHERE user_id = ? AND hash LIKE ? || '%' LIMIT 2;
-- 2건 이상이면 git과 동일하게 "ambiguous" 처리
```

브랜치 로그(3단계)만 재귀 CTE가 필요하다:

```sql
WITH RECURSIVE log(id, hash, parent_id, message, emoji, created) AS (
  SELECT id, hash, parent_id, message, emoji, created FROM commits WHERE id = :head
  UNION ALL
  SELECT c.id, c.hash, c.parent_id, c.message, c.emoji, c.created
  FROM commits c JOIN log l ON c.id = l.parent_id
)
SELECT * FROM log LIMIT 50;
```

Turso/LibSQL은 재귀 CTE를 지원하므로 그대로 쓸 수 있다.

에러 타입은 기존 `NotFoundError` 패턴을 따라 추가한다:
`AmbiguousHashError`, `AmendNotAllowedError`(자식 존재), `ParentNotFoundError`.

---

## 6. 화면 / 라우팅

현재 `/commit/[id]`가 **수정 폼**인 것이 문제다. 커밋을 열었을 때 나와야 하는 것은
수정 폼이 아니라 **그 커밋과 거기서 자란 것들**이다.

| 경로 | 현재 | 제안 |
| --- | --- | --- |
| `/` | 월별 목록 | 그대로. 단 스레드 루트만 + 답글 수 배지 |
| `/commit` | 작성 폼 | 그대로 (HEAD에 커밋) |
| `/commit/[id]` | 수정 폼 | → `/c/[hash]` 로 이전 |
| `/c/[hash]` | — | 커밋 상세 = 내용 + 조상 경로 + 답글 트리 + 이어쓰기 폼 |
| `/c/[hash]/amend` | — | 수정 (자식 없을 때만 진입 가능) |
| `/c/[hash]/history` | — | 수정 이력 (4단계에서 diff 뷰) |
| `/b/[name]` | — | 브랜치 로그 (3단계) |

`app/commit/[id]/page.tsx:38`의 `Schema.NumberFromString` 파싱은 해시 문자열
파싱으로 교체된다. 기존 숫자 URL은 `/commit/[id]` → `/c/[hash]` 리다이렉트로 살려둘 수 있다.

해시를 URL에 노출하는 것은 장식이 아니다. **"이 메모의 주소가 곧 그 내용과 이력의 지문"**
이라는 것이 사용자가 이 앱을 git처럼 느끼는 가장 직접적인 지점이다.

---

## 7. 마이그레이션

현재 `drizzle-kit`이 devDependency에 있지만 실행 스크립트가 없고(`package.json:5`)
`drizzle/` 마이그레이션 폴더도 없다. 스키마를 건드리기 전에 먼저 정리한다.

```json
"db:generate": "drizzle-kit generate",
"db:migrate":  "drizzle-kit migrate",
"db:studio":   "drizzle-kit studio"
```

기존 행 백필 순서 (SQLite 제약 주의):

1. 새 컬럼을 **nullable로** 추가 (`ALTER TABLE ADD COLUMN`)
   — SQLite는 `ADD COLUMN`에 `UNIQUE`를 붙일 수 없으므로 `hash`는 일단 nullable
2. 백필 스크립트로 기존 커밋마다 `hash` 계산, `root_id = id`, `depth = 0`, `parent_id = NULL`
3. 그 다음에 `CREATE UNIQUE INDEX commits_hash ON commits (hash)`
4. `updated` 컬럼 제거는 코드에서 참조가 사라진 뒤 마지막에

`app/components/CommitItem.tsx:22`가 `commit.updated`를 title로 쓰고 있으므로
4번 전에 교체가 필요하다.

---

## 8. 지금 먼저 고쳐야 할 것 (0단계)

git 모델은 쓰기 경로를 전부 다시 만든다. 그 전에 현재 쓰기 경로의 결함을 정리해야
같은 실수를 새 코드로 옮기지 않는다.

**① 작성 시 `user_id`를 클라이언트가 정한다**

```tsx
// app/commit/page.tsx:14
<input type="hidden" name="user_id" defaultValue={session.user?.id} />
```

이 값이 `parseCreateFormData`(`services/CommitSchemaService.ts:16`)를 거쳐 그대로
insert된다. 폼 값을 조작하면 **타인 명의의 메모를 만들 수 있다.**
`user_id`는 폼이 아니라 서버에서 `NextAuthService.getUserId()`로 얻어야 한다
(`CommitListServer`와 `/commit/[id]`는 이미 그렇게 하고 있다 — 작성 경로만 예외다).

**② 수정 시 소유권 검증이 없다**

```ts
// services/Commit.ts:87
db.update(commits).set(body).where(eq(commits.id, params.id))
```

`user_id` 조건이 없어 임의의 `id`를 폼에 넣으면 **타인의 메모를 수정할 수 있다.**
`getItemById`는 `user_id`를 확인하는데 `updateItem`만 빠져 있다.

**③ `updated`가 갱신되지 않는다** — `set(body)`에 `updated`가 없다.
(§4.1대로 컬럼 자체를 없앨 예정이라 ①②를 고치는 김에 같이 정리하면 된다.)

①②는 git 개념과 무관하게 지금 존재하는 취약점이므로 **1단계 착수와 별개로 먼저**
처리하는 것을 권한다. 다행히 `parent_id` 도입 시 "부모가 내 소유인가" 검증이 반드시
필요해지므로, 소유권 검사를 서비스 계층에 자리잡게 하는 작업은 어차피 해야 한다.

---

## 9. 단계별 로드맵

| 단계 | 내용 | 산출물 | 규모 |
| --- | --- | --- | --- |
| **0** | 소유권 검증 수정, drizzle 마이그레이션 스크립트 도입 | 취약점 제거 + 스키마 변경 기반 | 작음 |
| **1** | 불변 커밋: `hash` 추가, `updateItem` → `amendItem`, `/c/[hash]` 라우트 | 수정해도 이력이 남는다. 메모에 영구 주소가 생긴다 | 중간 |
| **2** | 참조: `parent_id`/`root_id`/`depth`, 이어쓰기 폼, 스레드 뷰 | **스레드 완성.** 구상의 핵심이 여기서 동작 | 중간 |
| **3** | `refs` 테이블, HEAD, 브랜치 만들기/전환, `/b/[name]` 로그 | 이름 붙은 스레드, "지금 쓰는 곳" 개념 | 중간 |
| **4** | tag(핀), cherry-pick(인용), revert(철회), diff 뷰 | 개념 확장. 각각 독립적이라 원하는 것만 골라도 됨 | 작음×4 |

**2단계까지가 원래 구상("커밋을 참조해 브랜치를 만든다")의 최소 완성형이다.**
3단계 브랜치는 스레드에 *이름*을 붙이는 층이고, 그것 없이도 2단계에서 이미 스레드는
동작한다. 그래서 2단계에서 한 번 멈춰 써 보고 이름이 실제로 아쉬운지 확인한 뒤
3단계를 판단하는 편이 좋다.

---

## 10. 검토 중 남는 질문

이후 결정이 필요한 부분이며, 지금 답이 없어도 1~2단계 진행에는 지장이 없다.

1. **홈 타임라인에 답글을 섞을 것인가?** 루트만 보여주면 깔끔하지만 스레드 중간 글이
   묻힌다. `parent_id IS NULL` 필터를 토글로 두는 방안.
2. **월별 조회와 스레드의 충돌** — 스레드가 여러 달에 걸치면 `getList`의 월 필터에
   걸려 일부만 보인다. 스레드 뷰는 월 필터를 적용하지 않는 것으로 정리해 두었으나
   홈에서의 표시 규칙은 결정 필요.
3. **`getLatestItem`은 현재 호출부가 없다**(`services/Commit.ts:65`, 정의만 존재).
   3단계의 HEAD가 이 자리를 대신하므로, 그때까지 남겨 둘지 지금 지울지 결정할 것.
4. **`created`의 타임존** — `getList`가 `strftime('%Y-%m', created)`로 UTC ISO
   문자열을 자르는데(`services/Commit.ts:36`), 화면은 사용자 타임존으로 렌더한다
   (`lib/timezone.ts`). 월 경계 근처 메모가 다른 달에 묶일 수 있다. git 개념과는
   무관한 기존 이슈지만 쿼리를 손대는 김에 같이 볼 것.
