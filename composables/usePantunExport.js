// composables/usePantunExport.js
// Mengambil screenshot elemen #pantun-preview dan mengonversinya ke base64 JPG
// Menggunakan html2canvas (import dynamic — client-side only)

export function usePantunExport() {
  const isExporting = ref(false)
  const exportError = ref('')

  /**
   * Export elemen dengan ID tertentu ke base64 JPG
   * @param {string} elementId - ID elemen DOM target (default: 'pantun-preview')
   * @param {number} scale - Resolusi export (default: 2 = 2x resolusi normal)
   * @returns {Promise<string>} - base64 string data URL
   */
  async function exportToBase64(elementId = 'pantun-preview', scale = 2) {
    if (import.meta.server) {
      throw new Error('exportToBase64 hanya bisa dijalankan di sisi client (browser).')
    }

    isExporting.value = true
    exportError.value = ''

    try {
      const el = document.getElementById(elementId)
      if (!el) {
        throw new Error(`Elemen dengan ID "${elementId}" tidak ditemukan di DOM.`)
      }

      // Import html2canvas secara dynamic agar tidak bundle ke server
      const html2canvas = (await import('html2canvas')).default

      const canvas = await html2canvas(el, {
        scale,
        useCORS: true,
        backgroundColor: '#FFFDE7',
        logging: false,
        removeContainer: true,
      })

      return canvas.toDataURL('image/jpeg', 0.95)
    } catch (err) {
      exportError.value = err?.message ?? 'Gagal mengexport gambar.'
      throw err
    } finally {
      isExporting.value = false
    }
  }

  /**
   * Download gambar pantun langsung ke browser
   * @param {string} filename - Nama file (default: 'pantun-kreasi.jpg')
   */
  async function downloadImage(filename = 'pantun-kreasi.jpg') {
    const base64 = await exportToBase64()
    const link = document.createElement('a')
    link.href = base64
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return {
    isExporting: readonly(isExporting),
    exportError: readonly(exportError),
    exportToBase64,
    downloadImage,
  }
}
