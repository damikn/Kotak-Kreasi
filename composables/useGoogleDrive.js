// composables/useGoogleDrive.js
// Helper composable untuk upload gambar ke Google Drive via server API

export function useGoogleDrive() {
  const isUploading = ref(false)
  const uploadError = ref('')

  /**
   * Upload base64 image ke Google Drive melalui server endpoint
   * @param {object} payload - Data pantun + imageBase64
   * @returns {Promise<{driveUrl: string, sessionId: string, filename: string}>}
   */
  async function uploadPantun(payload) {
    isUploading.value = true
    uploadError.value = ''

    try {
      const result = await $fetch('/api/save-pantun', {
        method: 'POST',
        body: payload,
      })
      return result
    } catch (err) {
      const msg = err?.data?.statusMessage ?? err?.message ?? 'Upload gagal.'
      uploadError.value = msg
      throw new Error(msg)
    } finally {
      isUploading.value = false
    }
  }

  return {
    isUploading: readonly(isUploading),
    uploadError: readonly(uploadError),
    uploadPantun,
  }
}
