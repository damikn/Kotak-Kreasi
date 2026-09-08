// composables/useGoogleSheets.js
// Helper composable untuk berinteraksi dengan Google Sheets melalui server API
// (akses langsung ke googleapis dilakukan di server/api/save-pantun.post.js)

export function useGoogleSheets() {
  /**
   * Struktur header kolom Google Sheets (untuk referensi setup awal)
   * Kolom A-K sesuai spec
   */
  const sheetHeaders = [
    'Tanggal',        // A
    'Nama Siswa',     // B
    'Fenomena',       // C
    'Pola',           // D
    'Suffix Rima',    // E
    'Kata Rima',      // F
    'Baris 1',        // G
    'Baris 2',        // H
    'Baris 3',        // I
    'Baris 4',        // J
    'Link Drive',     // K
  ]

  return { sheetHeaders }
}
