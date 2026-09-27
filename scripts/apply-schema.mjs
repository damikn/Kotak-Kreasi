// scripts/apply-schema.mjs
// Applies supabase/provision.sql to the project database over the Supabase
// connection pooler (IPv4) — the direct db.<ref>.supabase.co host is IPv6-only
// and unreachable from IPv4-only hosts.
//
// Usage:
//   SUPABASE_DB_PASSWORD=<db password> node scripts/apply-schema.mjs
//   node scripts/apply-schema.mjs --check          # only report what exists
//
// The password can also live in .env as SUPABASE_DB_PASSWORD.
import { readFileSync } from 'node:fs'
import { Client } from 'pg'

const CHECK_ONLY = process.argv.includes('--check')

function loadEnv(path = '.env') {
  const out = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (!line || line.trim().startsWith('#') || !line.includes('=')) continue
    const i = line.indexOf('=')
    out[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"|"$/g, '')
  }
  return out
}

const env = loadEnv()
const url = env.SUPABASE_URL || ''
const ref = url.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1]
const password = process.env.SUPABASE_DB_PASSWORD || env.SUPABASE_DB_PASSWORD

if (!ref) {
  console.error('Could not derive the project ref from SUPABASE_URL in .env')
  process.exit(1)
}
if (!password) {
  console.error('Missing database password: set SUPABASE_DB_PASSWORD (env or .env)')
  process.exit(1)
}

// Supabase poolers are region-specific; newer projects use the aws-1 prefix.
const REGIONS = [
  'ap-southeast-1', 'ap-northeast-1', 'ap-south-1', 'ap-southeast-2',
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-north-1',
  'ca-central-1', 'sa-east-1',
]

async function connect() {
  for (const prefix of ['aws-1', 'aws-0']) {
    for (const region of REGIONS) {
      const host = `${prefix}-${region}.pooler.supabase.com`
      const client = new Client({
        host,
        port: 5432,
        user: `postgres.${ref}`,
        password,
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 8000,
        statement_timeout: 60000,
      })
      try {
        await client.connect()
        console.log(`Connected via ${host} (region ${region})`)
        return client
      } catch (e) {
        await client.end().catch(() => {})
        const msg = String(e.message || '')
        if (/password authentication failed/i.test(msg)) {
          console.error(`Reached ${host} but the password was rejected — check SUPABASE_DB_PASSWORD`)
          process.exit(1)
        }
        if (!/tenant|not found|ENOTFOUND|ECONNREFUSED|timeout|terminat/i.test(msg)) {
          console.error(`${host}: ${msg}`)
        }
      }
    }
  }
  console.error('No pooler accepted the connection. Check the project ref and the database password.')
  process.exit(1)
}

const client = await connect()

const report = async (label) => {
  const { rows } = await client.query(`
    select
      (select count(*) from information_schema.tables where table_schema='public' and table_name='works') as works_table,
      (select count(*) from storage.buckets where id='works-images') as bucket,
      (select count(*) from pg_indexes where schemaname='public' and tablename='works') as works_indexes,
      (select relrowsecurity from pg_class where oid='public.works'::regclass) as rls_enabled
  `).catch((e) => ({ rows: [{ error: e.message }] }))
  console.log(`${label}: ${JSON.stringify(rows[0])}`)
}

if (CHECK_ONLY) {
  await report('state')
  await client.end()
  process.exit(0)
}

const sql = readFileSync('supabase/provision.sql', 'utf8')
console.log(`Applying supabase/provision.sql (${sql.length} chars)…`)
await client.query(sql)

await report('after apply')
await client.end()
console.log('Schema applied.')
