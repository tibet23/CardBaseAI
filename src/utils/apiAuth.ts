/**
 * Frontend CSRF & Request Authentication Service.
 * Retrieves cryptographically random CSRF tokens from /api/auth/csrf and caches them in session.
 * Protects against cross-site request forgery and automated quota-draining requests.
 * Eliminates static prefix fallbacks (SEC-02 remediation) so every token is validated against
 * the server's active cryptographic token registry.
 */

let cachedCsrfToken: string | null = null;

/**
 * Resets cached CSRF token (useful if session expires or 403 is received).
 */
export function clearCachedCsrfToken(): void {
  cachedCsrfToken = null;
}

/**
 * Retrieves valid CSRF headers strictly from the backend security endpoint.
 * No hardcoded or spoofable client-side prefix is accepted.
 */
export async function getCsrfHeaders(forceRefresh = false): Promise<Record<string, string>> {
  if (cachedCsrfToken && !forceRefresh) {
    return { 'X-CSRF-Token': cachedCsrfToken };
  }

  try {
    const res = await fetch('/api/auth/csrf', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.csrfToken === 'string' && data.csrfToken.length >= 32) {
        cachedCsrfToken = data.csrfToken;
        return { 'X-CSRF-Token': data.csrfToken };
      }
    }
  } catch (err) {
    console.error('Security alert: Failed to obtain server CSRF authorization token:', err);
  }

  // If server cannot be reached or token is missing, return empty header so server-side
  // verifyAuthOrCsrf will safely reject the request rather than relying on an insecure static bypass.
  return {};
}

