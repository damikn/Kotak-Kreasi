// server/utils/teacher-auth.js
// Minimal teacher PIN gate for the guru dashboard.
// PIN lives in env as GURU_PIN (never in client code). Requests must send
// { pin } in the body or `x-guru-pin` header; a signed session cookie can be
// set after the first successful login but the simplest correct gate is to
// require the pin on every mutating call.

import { createError } from 'h3'

export function validGuruPin(config, input) {
  const expected = config.guruPin || ''
  if (!expected) return false
  return String(input ?? '') === String(expected)
}

export function requireGuruPin(event) {
  const config = useRuntimeConfig()
  const body = event.context?.body ?? {}

  const headerPin = getHeader(event, 'x-guru-pin') ?? ''
  const bodyPin = body?.pin ?? ''

  if (!validGuruPin(config, headerPin || bodyPin)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'PIN guru salah.',
    })
  }
}

// Call inside a handler BEFORE reading body via readBody so we can inspect it.
export async function readBodyWithPin(event) {
  const body = await readBody(event)
  const config = useRuntimeConfig()
  const pin = getHeader(event, 'x-guru-pin') ?? body?.pin

  if (!validGuruPin(config, pin)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'PIN guru salah.',
    })
  }
  return body
}