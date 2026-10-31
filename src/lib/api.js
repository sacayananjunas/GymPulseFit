// Thin client for the /api functions. Never talks to the database directly.

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

const timezone = (() => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
})()

export async function api(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: { 'x-timezone': timezone, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError("Can't reach PulseFit. Check your internet connection and try again.", 0, 'NETWORK')
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    /* non-JSON response, e.g. the dev proxy when the API server is down */
  }

  if (!res.ok) {
    if (!data?.message) {
      throw new ApiError("The PulseFit server isn't responding. Give it a moment and try again.", res.status, 'SERVER_DOWN')
    }
    throw new ApiError(data.message, res.status, data.error)
  }
  return data
}
