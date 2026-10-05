// server/utils/works-repo.js
// Supabase-backed data access for student works (replaces the Google Sheets helpers).
//
// The shape returned by rowToWork() is the contract the Vue pages already
// consume (`nama`, `baris[]`, `skorAuto`, `nilai`, `status`, `tampilGaleri`, ...),
// so the pages stay untouched when the storage layer changes.
import { getSupabase, getBucket } from './supabase'
import { initialsOf } from './name'

export const STATUS_BELUM = 'BELUM DINILAI'
export const STATUS_SUDAH = 'SUDAH DINILAI'

const TABLE = 'works'

// Teacher dashboard link/route for a work image. Kept under the historical
// `driveUrl` key so the existing UI keeps working without changes.
export function imageApiPath(kode) {
  return `/api/karya/gambar/${encodeURIComponent(kode)}`
}

function formatTanggal(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// Map a `works` row onto the object shape used across the app.
export function rowToWork(row) {
  const t = (v) => (v ?? '').toString().trim()
  return {
    id: row.id,
    kode: t(row.kode),
    tanggal: t(row.date_label) || formatTanggal(row.created_at),
    createdAt: row.created_at,
    nama: t(row.student_name),
    displayName: initialsOf(row.student_name),
    kelas: t(row.class_name),
    absen: row.absen_no === null || row.absen_no === undefined ? null : Number(row.absen_no),
    fenomena: t(row.fenomena),
    gagasan: t(row.gagasan),
    pesan: t(row.pesan),
    tampilGaleri: !!row.gallery,
    pola: t(row.pola),
    rimaSuffix: t(row.rima_suffix),
    kataRima: t(row.rima_words),
    baris: [t(row.line1), t(row.line2), t(row.line3), t(row.line4)],
    imagePath: row.image_path || '',
    driveUrl: row.image_path ? imageApiPath(row.kode) : t(row.drive_url),
    skorAuto: row.auto_score === null || row.auto_score === undefined ? null : Number(row.auto_score),
    nilai: row.grade === null || row.grade === undefined ? null : Number(row.grade),
    komentar: t(row.comment),
    status: t(row.status) || STATUS_BELUM,
  }
}

// ── reads ────────────────────────────────────────────────────────────────────

// All works, oldest first (same order the teacher dashboard had with Sheet1).
export async function listWorks(config) {
  const sb = getSupabase(config)
  const { data, error } = await sb
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []).map(rowToWork)
}

export async function findWorkByKode(config, kode) {
  const sb = getSupabase(config)
  const { data, error } = await sb
    .from(TABLE)
    .select('*')
    .eq('kode', kode)
    .maybeSingle()

  if (error) throw error
  return data ? rowToWork(data) : null
}

// Gallery feed: teacher-approved works only, newest first.
export async function listGalleryWorks(config, limit = 12) {
  const sb = getSupabase(config)
  const { data, error } = await sb
    .from(TABLE)
    .select('*')
    .eq('gallery', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []).map(rowToWork)
}

// ── writes ───────────────────────────────────────────────────────────────────

export async function insertWork(config, payload) {
  const sb = getSupabase(config)
  const { data, error } = await sb
    .from(TABLE)
    .insert(payload)
    .select('*')
    .single()

  if (error) throw error
  return rowToWork(data)
}

// Partial update by kode. `patch` uses database column names.
export async function updateWork(config, kode, patch) {
  const sb = getSupabase(config)
  const { data, error } = await sb
    .from(TABLE)
    .update(patch)
    .eq('kode', kode)
    .select('*')
    .maybeSingle()

  if (error) throw error
  return data ? rowToWork(data) : null
}

export async function countWorks(config) {
  const sb = getSupabase(config)
  const { count, error } = await sb.from(TABLE).select('id', { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
}

// ── storage ──────────────────────────────────────────────────────────────────

// Upload a data-URL (or raw base64) JPEG for a work. Returns { path, error }.
export async function uploadWorkImage(config, kode, imageBase64) {
  const sb = getSupabase(config)
  const bucket = getBucket(config)
  const base64 = String(imageBase64).replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64, 'base64')
  const path = `works/${kode}.jpg`

  const { error } = await sb.storage
    .from(bucket)
    .upload(path, buffer, { contentType: 'image/jpeg', upsert: true })

  if (error) return { path: null, error }
  return { path, error: null }
}

// Short-lived signed URL for a stored image. The bucket is private.
export async function createImageSignedUrl(config, imagePath, expiresIn = 300) {
  const sb = getSupabase(config)
  const bucket = getBucket(config)
  const { data, error } = await sb.storage
    .from(bucket)
    .createSignedUrl(imagePath, expiresIn)

  if (error) throw error
  return data?.signedUrl ?? ''
}
