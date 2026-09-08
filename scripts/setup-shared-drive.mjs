// scripts/setup-shared-drive.mjs
// Buat Shared Drive baru dan update GOOGLE_DRIVE_FOLDER_ID di .env
// Jalankan: node scripts/setup-shared-drive.mjs

import { google } from 'googleapis'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnv() {
  const envPath = resolve(__dirname, '../.env')
  const content = readFileSync(envPath, 'utf-8')
  const env = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let val = trimmed.slice(eqIdx + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"'))) val = val.slice(1, -1)
    env[key] = val
  }
  return env
}

function updateEnvValue(key, newValue) {
  const envPath = resolve(__dirname, '../.env')
  let content = readFileSync(envPath, 'utf-8')
  const regex = new RegExp(`^${key}=.*$`, 'm')
  content = content.replace(regex, `${key}=${newValue}`)
  writeFileSync(envPath, content, 'utf-8')
  console.log(`✓ .env diupdate: ${key}=${newValue}`)
}

const env = loadEnv()

async function main() {
  console.log('\n🔧 Setup Shared Drive untuk Kotak Kreasi\n')

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: env.GOOGLE_CLIENT_EMAIL,
      private_key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
  })
  const client = await auth.getClient()
  const drive = google.drive({ version: 'v3', auth: client })

  // Cek dulu apakah sudah ada Shared Drive
  console.log('Mengecek Shared Drive yang sudah ada...')
  try {
    const listRes = await drive.drives.list({ pageSize: 20 })
    const drives = listRes.data.drives ?? []

    if (drives.length > 0) {
      console.log(`\nShared Drive ditemukan (${drives.length}):`)
      drives.forEach((d, i) => console.log(`  ${i + 1}. ${d.name} — ID: ${d.id}`))

      const existing = drives.find((d) =>
        d.name.toLowerCase().includes('kotak')
      )

      if (existing) {
        console.log(`\n✓ Menggunakan Shared Drive: "${existing.name}" (${existing.id})`)
        updateEnvValue('GOOGLE_DRIVE_FOLDER_ID', existing.id)

        // Test upload
        await testUpload(drive, existing.id)
        return
      }
    }
  } catch (e) {
    console.log('Info:', e.message)
  }

  // Buat Shared Drive baru
  console.log('\nMembuat Shared Drive baru...')
  try {
    const requestId = `kotak-kreasi-${Date.now()}`
    const newDrive = await drive.drives.create({
      requestId,
      requestBody: { name: 'Kotak Kreasi - Karya Siswa' },
    })

    console.log(`✓ Shared Drive dibuat: "${newDrive.data.name}" (${newDrive.data.id})`)
    updateEnvValue('GOOGLE_DRIVE_FOLDER_ID', newDrive.data.id)

    await testUpload(drive, newDrive.data.id)
  } catch (e) {
    console.error('✗ Gagal buat Shared Drive:', e.message)
    console.log('\n💡 Kemungkinan akun Google tidak mendukung Shared Drive.')
    console.log('   Coba buat manual di: https://drive.google.com/drive/shared-drives')
    console.log('   Lalu share ke:', env.GOOGLE_CLIENT_EMAIL, '(Content manager)')
    console.log('   Kemudian update GOOGLE_DRIVE_FOLDER_ID di .env\n')
  }
}

async function testUpload(drive, folderId) {
  console.log('\nMencoba upload test file...')
  try {
    const { Readable } = await import('stream')
    const stream = Readable.from(Buffer.from('Kotak Kreasi test - ' + new Date().toISOString()))

    const res = await drive.files.create({
      requestBody: {
        name: `_test_${Date.now()}.txt`,
        parents: [folderId],
        mimeType: 'text/plain',
      },
      media: { mimeType: 'text/plain', body: stream },
      fields: 'id,webViewLink',
      supportsAllDrives: true,
    })

    console.log('✓ Upload berhasil! ID:', res.data.id)

    // Set public permission
    await drive.permissions.create({
      fileId: res.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
      supportsAllDrives: true,
    })
    console.log('✓ Permission publik di-set')

    // Hapus test file
    await drive.files.delete({ fileId: res.data.id, supportsAllDrives: true })
    console.log('✓ File test dihapus')

    console.log('\n🎉 GOOGLE DRIVE SIAP DIGUNAKAN!')
    console.log('   Jalankan: node scripts/test-api.mjs — untuk verifikasi final\n')
  } catch (e) {
    console.error('✗ Upload gagal:', e.message)
  }
}

main().catch((e) => {
  console.error('Fatal:', e.message)
  process.exit(1)
})
