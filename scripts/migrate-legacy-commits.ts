/**
 * 기존 `commits` 테이블(서버 autoincrement id + 덮어쓰기 수정)을
 * 리비전 모델로 옮긴다.
 *
 *   pnpm db:migrate-legacy               # 실제 이관
 *   pnpm db:migrate-legacy -- --dry      # 계획만 출력
 *
 * Node 22의 타입 스트리핑으로 그대로 실행된다(별도 실행기 불필요).
 *
 * 옛 테이블은 `commits_legacy`로 남겨 둔다. 확인 후 직접 DROP할 것.
 * 새로 만드는 데이터베이스라면 이 스크립트가 필요 없다 — `pnpm db:migrate`만 돌리면 된다.
 */
// Node가 직접 실행하므로(타입 스트리핑) 상대 경로에 확장자를 붙인다.
import 'dotenv/config'
import { createClient } from '@libsql/client'
import { commitHash } from '../lib/hash.ts'
import { encodeHlc } from '../lib/hlc.ts'
import { uuidv7 } from '../lib/uuid.ts'

const LEGACY_DEVICE_ID = 'legacy'

type LegacyRow = {
  id: number
  message: string
  emoji: string
  created: string
  user_id: string
}

const CREATE_COMMITS = `
CREATE TABLE \`commits\` (
  \`hash\` text PRIMARY KEY NOT NULL,
  \`note_id\` text NOT NULL,
  \`parent_hash\` text,
  \`message\` text NOT NULL,
  \`emoji\` text NOT NULL,
  \`deleted\` integer DEFAULT false NOT NULL,
  \`user_id\` text NOT NULL,
  \`device_id\` text NOT NULL,
  \`hlc\` text NOT NULL,
  \`created\` text NOT NULL,
  FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE no action
)`

const CREATE_INDEXES = [
  'CREATE INDEX `commits_note_hlc` ON `commits` (`note_id`,`hlc`)',
  'CREATE INDEX `commits_user_created` ON `commits` (`user_id`,`created`)',
]

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

const dryRun = process.argv.includes('--dry')

async function hasColumn(table: string, column: string) {
  const result = await client.execute(`PRAGMA table_info(${table})`)

  return result.rows.some((row) => row.name === column)
}

async function main() {
  if (!(await hasColumn('commits', 'id'))) {
    console.log('이미 리비전 모델입니다. 할 일이 없습니다.')

    return
  }

  const legacy = await client.execute(
    'SELECT id, message, emoji, created, user_id FROM commits ORDER BY created ASC, id ASC'
  )
  const rows = legacy.rows as unknown as LegacyRow[]

  console.log(`옮길 메모 ${rows.length}개`)

  // 옛 메모는 각각 리비전 하나짜리 메모가 된다. 수정 이력이 남아 있지 않으므로
  // 부모도 없고, 논리 시계는 작성 시각에서 만든다.
  const revisions = await Promise.all(
    rows.map(async (row, index) => {
      const millis = new Date(row.created).getTime()
      const revision = {
        note_id: uuidv7(millis),
        parent_hash: null,
        message: row.message,
        emoji: row.emoji,
        deleted: false,
        user_id: row.user_id,
        device_id: LEGACY_DEVICE_ID,
        hlc: encodeHlc({
          millis,
          counter: index % 0xffff,
          device_id: LEGACY_DEVICE_ID,
        }),
        created: row.created,
      }

      return { ...revision, hash: await commitHash(revision) }
    })
  )

  if (dryRun) {
    console.log(revisions.slice(0, 3))
    console.log('--dry 이므로 여기서 멈춥니다.')

    return
  }

  await client.batch(
    [
      'ALTER TABLE commits RENAME TO commits_legacy',
      CREATE_COMMITS,
      ...CREATE_INDEXES,
    ],
    'write'
  )

  for (const revision of revisions) {
    await client.execute({
      sql: `INSERT INTO commits
        (hash, note_id, parent_hash, message, emoji, deleted, user_id, device_id, hlc, created)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT DO NOTHING`,
      args: [
        revision.hash,
        revision.note_id,
        revision.parent_hash,
        revision.message,
        revision.emoji,
        revision.deleted ? 1 : 0,
        revision.user_id,
        revision.device_id,
        revision.hlc,
        revision.created,
      ],
    })
  }

  console.log(
    `완료. ${revisions.length}개를 옮겼습니다. 확인 후 commits_legacy를 지우세요.`
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => client.close())
