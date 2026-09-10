import { EmailMessage, EmailThreadSummary } from '../types';
import { encryptData, decryptData } from './encryption';
import { getOrCreateDevicePinSecret } from './storage';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string; expires_in?: number }) => void;
            error_callback?: (err: any) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
          hasGrantedAllScopes: (token: any, ...scopes: string[]) => boolean;
        };
      };
    };
  }
}

const GMAIL_TOKEN_KEY = 'cardsnap_gmail_token';
const GMAIL_USER_KEY = 'cardsnap_gmail_user';
const GMAIL_ENC_PREFIX = 'enc:v1:';

export interface StoredGmailAuth {
  accessToken: string;
  expiresAt: number;
  email?: string;
}

// In-memory decrypted cache for zero-latency synchronous access without cleartext disk persistence
let decryptedGmailAuthCache: StoredGmailAuth | null = null;

// Immediately kick off background decryption on module load
if (typeof window !== 'undefined') {
  loadSavedGmailAuthAsync().catch((err) => {
    console.warn('Initial background Gmail token decryption error:', err);
  });
}

/**
 * Asynchronously decrypts and retrieves stored OAuth credentials.
 */
export async function loadSavedGmailAuthAsync(): Promise<StoredGmailAuth | null> {
  try {
    const raw = localStorage.getItem(GMAIL_TOKEN_KEY);
    if (!raw) {
      decryptedGmailAuthCache = null;
      return null;
    }

    let payloadString = raw;
    if (raw.startsWith(GMAIL_ENC_PREFIX)) {
      const ciphertext = raw.slice(GMAIL_ENC_PREFIX.length);
      const secret = getOrCreateDevicePinSecret();
      payloadString = await decryptData(ciphertext, secret);
    } else {
      // Legacy unencrypted token migration: upgrade immediately to encrypted storage
      try {
        const parsedLegacy = JSON.parse(raw);
        if (parsedLegacy.accessToken) {
          await saveGmailAuth(
            parsedLegacy.accessToken,
            Math.max(60, Math.floor((parsedLegacy.expiresAt - Date.now()) / 1000)),
            parsedLegacy.email
          );
        }
      } catch {
        // Ignore JSON parsing failure for corrupted migration
      }
    }

    const parsed: StoredGmailAuth = JSON.parse(payloadString);
    if (Date.now() > parsed.expiresAt - 60000) {
      // Token is expired or within 1 minute of expiring
      decryptedGmailAuthCache = null;
      return null;
    }

    decryptedGmailAuthCache = parsed;
    return parsed;
  } catch (e) {
    console.warn('Failed to decrypt stored Gmail auth:', e);
    decryptedGmailAuthCache = null;
    return null;
  }
}

/**
 * Gets cached token if valid (synchronous lookup backed by decrypted in-memory state).
 */
export function getSavedGmailAuth(): StoredGmailAuth | null {
  if (decryptedGmailAuthCache) {
    if (Date.now() > decryptedGmailAuthCache.expiresAt - 60000) {
      decryptedGmailAuthCache = null;
      return null;
    }
    return decryptedGmailAuthCache;
  }

  try {
    const raw = localStorage.getItem(GMAIL_TOKEN_KEY);
    if (!raw) return null;

    // If it's already an encrypted token, background loader will populate decryptedGmailAuthCache
    if (raw.startsWith(GMAIL_ENC_PREFIX)) {
      loadSavedGmailAuthAsync().catch(() => {});
      return null;
    }

    // Legacy unencrypted token support
    const parsed: StoredGmailAuth = JSON.parse(raw);
    if (Date.now() > parsed.expiresAt - 60000) {
      return null;
    }
    decryptedGmailAuthCache = parsed;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Saves Gmail token to storage using AES-GCM 256-bit encryption with a device/session-bound key (SEC-04).
 */
export async function saveGmailAuth(token: string, expiresInSeconds: number = 3600, email?: string): Promise<void> {
  const payload: StoredGmailAuth = {
    accessToken: token,
    expiresAt: Date.now() + expiresInSeconds * 1000,
    email: email || localStorage.getItem(GMAIL_USER_KEY) || undefined,
  };

  // 1. Immediately update volatile in-memory cache for synchronous consumer access
  decryptedGmailAuthCache = payload;

  // 2. Encrypt token before persisting to disk / localStorage to prevent cleartext token extraction
  try {
    const secret = getOrCreateDevicePinSecret();
    const payloadString = JSON.stringify(payload);
    const encrypted = await encryptData(payloadString, secret);
    localStorage.setItem(GMAIL_TOKEN_KEY, `${GMAIL_ENC_PREFIX}${encrypted}`);
    if (email) {
      localStorage.setItem(GMAIL_USER_KEY, email);
    }
  } catch (err) {
    console.error('Failed to encrypt Gmail OAuth token before persistence:', err);
  }
}

/**
 * Clears stored Gmail Auth from memory and localStorage.
 */
export function clearGmailAuth() {
  decryptedGmailAuthCache = null;
  localStorage.removeItem(GMAIL_TOKEN_KEY);
  localStorage.removeItem(GMAIL_USER_KEY);
}

/**
 * Prompt user to connect Google Account via Google Identity Services
 */
export async function connectGmailAccount(clientId?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(new Error('Google Identity Services SDK is not loaded yet. Please check your internet connection.'));
      return;
    }

    // Default OAuth client id (provided by Google AI Studio OAuth setup)
    const effectiveClientId = clientId || '819966147333-u3q09f19l320k9n20fl6g9eefu379ghm.apps.googleusercontent.com';

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: effectiveClientId,
      scope: 'https://www.googleapis.com/auth/gmail.readonly',
      callback: async (response) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }
        if (response.access_token) {
          saveGmailAuth(response.access_token, response.expires_in || 3600);
          
          // Optionally fetch user profile email
          try {
            const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
              headers: { Authorization: `Bearer ${response.access_token}` },
            });
            if (profileRes.ok) {
              const profile = await profileRes.json();
              if (profile.emailAddress) {
                saveGmailAuth(response.access_token, response.expires_in || 3600, profile.emailAddress);
              }
            }
          } catch (e) {
            // Profile fetch optional
          }

          resolve(response.access_token);
        } else {
          reject(new Error('No access token received from Google.'));
        }
      },
      error_callback: (err) => {
        reject(err || new Error('Google authorization prompt was cancelled or closed.'));
      },
    });

    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

/**
 * Fetches user profile from Gmail
 */
export async function fetchGmailUserProfile(token: string): Promise<{ emailAddress: string; messagesTotal: number } | null> {
  try {
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Searches Gmail for messages and conversation threads involving a specific email address.
 */
export async function fetchEmailHistoryWithContact(
  contactEmail: string,
  token: string
): Promise<EmailThreadSummary[]> {
  if (!contactEmail || !token) return [];

  const cleanEmail = contactEmail.trim().toLowerCase();
  // Search query in Gmail format: from:email OR to:email OR cc:email
  const query = encodeURIComponent(`from:${cleanEmail} OR to:${cleanEmail}`);

  try {
    const searchRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=15`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );

    if (!searchRes.ok) {
      if (searchRes.status === 401) {
        clearGmailAuth();
        throw new Error('Gmail authorization expired. Please reconnect your account.');
      }
      throw new Error(`Gmail API search failed with status ${searchRes.status}`);
    }

    const searchData = await searchRes.json();
    const messages = searchData.messages || [];

    if (messages.length === 0) {
      return [];
    }

    // Fetch message details in parallel
    const messageDetails: EmailMessage[] = await Promise.all(
      messages.slice(0, 15).map(async (item: { id: string; threadId: string }) => {
        try {
          const detailRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!detailRes.ok) return null;
          const msg = await detailRes.json();

          const headers = msg.payload?.headers || [];
          const getHeader = (name: string) => {
            const h = headers.find((x: { name: string; value: string }) => x.name.toLowerCase() === name.toLowerCase());
            return h ? h.value : '';
          };

          const subject = getHeader('Subject') || '(No Subject)';
          const from = getHeader('From') || '';
          const to = getHeader('To') || '';
          const date = getHeader('Date') || new Date().toISOString();

          return {
            id: msg.id,
            threadId: msg.threadId,
            snippet: decodeHtmlEntities(msg.snippet || ''),
            subject,
            from,
            to,
            date,
            internalDate: msg.internalDate || Date.now().toString(),
            isUnread: Array.isArray(msg.labelIds) && msg.labelIds.includes('UNREAD'),
          } as EmailMessage;
        } catch {
          return null;
        }
      })
    );

    const validMessages = messageDetails.filter((m): m is EmailMessage => m !== null);

    // Group messages by Thread
    const threadMap: Record<string, EmailMessage[]> = {};
    validMessages.forEach((msg) => {
      if (!threadMap[msg.threadId]) {
        threadMap[msg.threadId] = [];
      }
      threadMap[msg.threadId].push(msg);
    });

    const threads: EmailThreadSummary[] = Object.entries(threadMap).map(([threadId, msgs]) => {
      // Sort messages chronologically
      msgs.sort((a, b) => parseInt(b.internalDate, 10) - parseInt(a.internalDate, 10));
      const latestMsg = msgs[0];
      const participants = Array.from(
        new Set(msgs.flatMap((m) => [m.from, m.to]).filter(Boolean))
      );

      return {
        threadId,
        subject: latestMsg.subject,
        snippet: latestMsg.snippet,
        lastMessageDate: latestMsg.date,
        messageCount: msgs.length,
        participants,
        messages: msgs,
      };
    });

    // Sort threads by most recent
    threads.sort((a, b) => new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime());
    return threads;
  } catch (err: any) {
    console.error('Error fetching email history:', err);
    throw err;
  }
}

/**
 * Helper to decode HTML entities in email snippets
 */
function decodeHtmlEntities(str: string): string {
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}

/**
 * Format relative date for email list (e.g. "Aug 20, 2026" or "2 days ago")
 */
export function formatEmailDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    const now = new Date();
    const diffHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24 && now.getDate() === d.getDate()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    if (now.getFullYear() === d.getFullYear()) {
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    return d.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
}
