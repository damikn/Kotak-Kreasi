// server/utils/google-auth.js
// Shared Google service-account auth for all server API handlers.
import { google } from 'googleapis'

export function getGoogleAuth(config) {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: config.googleClientEmail,
      private_key: config.googlePrivateKey?.replace(/\\n/g, '\n'),
    },
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  })
}

export async function getSheetsClient(config) {
  const auth = getGoogleAuth(config)
  const authClient = await auth.getClient()
  return google.sheets({ version: 'v4', auth: authClient })
}

export async function getDriveClient(config) {
  const auth = getGoogleAuth(config)
  const authClient = await auth.getClient()
  return google.drive({ version: 'v3', auth: authClient })
}