import { Config, Layer } from 'effect'
import * as SqliteDrizzle from '@effect/sql-drizzle/Sqlite'
import { LibsqlClient } from '@effect/sql-libsql'

const SqlLive = LibsqlClient.layerConfig({
  url: Config.string('TURSO_DATABASE_URL'),
  authToken: Config.redacted('TURSO_AUTH_TOKEN'),
})

const DrizzleLive = SqliteDrizzle.layer.pipe(Layer.provide(SqlLive))

export const DatabaseLive = Layer.mergeAll(SqlLive, DrizzleLive)
