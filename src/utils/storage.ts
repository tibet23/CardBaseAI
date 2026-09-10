import { ContactCard, CRMConfig, CRMProvider, CategoryConfig, UserBillingState, SubscriptionPlanType, CreditPackType } from '../types';
import { INITIAL_SAMPLE_CARDS, DEFAULT_CATEGORIES } from './sampleCards';
import { encryptData, decryptData } from './encryption';

const STORAGE_KEY_CARDS = 'cardsnap_contacts_v3';
const STORAGE_KEY_CATEGORIES = 'cardsnap_categories_v3';
const STORAGE_KEY_CRM = 'cardsnap_crm_config_v1';
const STORAGE_KEY_SETTINGS = 'cardsnap_settings_v1';
const STORAGE_KEY_OFFLINE_QUEUE = 'cardsnap_offline_queue_v1';
const STORAGE_KEY_BILLING = 'cardsnap_user_billing_v1';

export const DEFAULT_BILLING: UserBillingState = {
  plan: 'free',
  isSubscribed: false,
  freeCardsLimit: 20,
  freeCardsUsed: 14, // Initial realistic state for sample library demo
  purchasedCredits: 0,
  totalCardsScanned: 14,
};

export interface AppSettings {
  darkMode: boolean;
  privacyMode: boolean; // Masks sensitive emails/phones in preview
  autoCloudBackup: boolean;
  cloudSyncKey: string;
  lastCloudBackup?: string;
  defaultExportFormat: 'vcf' | 'csv';
}

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  privacyMode: false,
  autoCloudBackup: true,
  cloudSyncKey: 'cardsnap_vault_master',
  defaultExportFormat: 'vcf',
};

const DEFAULT_CRM_CONFIGS: CRMConfig[] = [
  {
    provider: 'Apollo',
    name: 'Apollo.io CRM & Leads',
    connected: true,
    apiKey: 'apl_live_sample_token_839210',
    autoSyncOnScan: true,
    lastSyncAt: new Date().toISOString(),
    fieldMapping: {
      nameField: 'first_name,last_name',
      companyField: 'organization_name',
      emailField: 'email',
      phoneField: 'sanitized_phone',
      titleField: 'title',
    },
  },
  {
    provider: 'HubSpot',
    name: 'HubSpot CRM',
    connected: true,
    apiKey: 'pat-na1-39294-sample-hubspot-token',
    portalId: '2981029',
    autoSyncOnScan: true,
    lastSyncAt: new Date().toISOString(),
    fieldMapping: {
      nameField: 'firstname,lastname',
      companyField: 'company',
      emailField: 'email',
      phoneField: 'phone',
      titleField: 'jobtitle',
    },
  },
  {
    provider: 'Salesforce',
    name: 'Salesforce Sales Cloud',
    connected: true,
    apiKey: '00D50000000Ixxxxxx!AQ0AQ.sample.salesforce',
    autoSyncOnScan: false,
    lastSyncAt: new Date().toISOString(),
    fieldMapping: {
      nameField: 'Name',
      companyField: 'Account.Name',
      emailField: 'Email',
      phoneField: 'Phone',
      titleField: 'Title',
    },
  },
  {
    provider: 'GoogleContacts',
    name: 'Google Contacts Workspace',
    connected: true,
    apiKey: 'ya29.sample-oauth-gcontacts',
    autoSyncOnScan: true,
    lastSyncAt: new Date().toISOString(),
    fieldMapping: {
      nameField: 'names.givenName',
      companyField: 'organizations.name',
      emailField: 'emailAddresses.value',
      phoneField: 'phoneNumbers.value',
      titleField: 'organizations.title',
    },
  },
];

export function getSavedCards(): ContactCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CARDS);
    if (!raw) {
      // Seed with initial 20 sample cards on first run
      saveCards(INITIAL_SAMPLE_CARDS);
      return INITIAL_SAMPLE_CARDS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    saveCards(INITIAL_SAMPLE_CARDS);
    return INITIAL_SAMPLE_CARDS;
  } catch (err) {
    console.error('Failed to load cards from storage:', err);
    return INITIAL_SAMPLE_CARDS;
  }
}

export function resetToSampleCards(): ContactCard[] {
  saveCards(INITIAL_SAMPLE_CARDS);
  return INITIAL_SAMPLE_CARDS;
}

export function saveCards(cards: ContactCard[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(cards));
    return true;
  } catch (err: any) {
    console.error('Failed to save cards to storage:', err);
    // Detect browser storage quota exceeded
    if (
      err.name === 'QuotaExceededError' ||
      err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err.code === 22 ||
      err.code === 1014
    ) {
      // Recovery strategy: Strip heavy multi-card original frames and secondary back images
      // to preserve all contact details, names, phones, notes, tags, and CRM statuses.
      try {
        const lightweightCards = cards.map((c) => ({
          ...c,
          cardBackImage: undefined,
          originalMultiCardImage: undefined,
        }));
        localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(lightweightCards));
        console.warn('Saved cards in lightweight mode due to browser storage quota limit.');
        return true;
      } catch (innerErr) {
        console.error('Lightweight save also exceeded storage quota:', innerErr);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cardbase:storage-quota-exceeded'));
        }
      }
    }
    return false;
  }
}

export function getSavedCategories(): CategoryConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (!raw) {
      saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    saveCategories(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  } catch (err) {
    console.error('Failed to load categories from storage:', err);
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: CategoryConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  } catch (err) {
    console.error('Failed to save categories to storage:', err);
  }
}

export function resetCategoriesToDefault(): CategoryConfig[] {
  saveCategories(DEFAULT_CATEGORIES);
  return DEFAULT_CATEGORIES;
}

const STORAGE_KEY_CRM_SALT = 'cardsnap_crm_device_salt_v1';
const STORAGE_KEY_SESSION_PIN = 'cardsnap_crm_session_pin_v1';
const CRM_ENC_PREFIX = 'enc:v1:';

// Synchronous in-memory decrypted cache for instantaneous zero-latency component reads
let decryptedCrmCache: CRMConfig[] | null = null;

/**
 * Derives a high-entropy device-bound secret tied to the user's local session and device PIN/salt.
 * Generates a cryptographically random 128-bit salt and persists it in localStorage,
 * coupled with a session PIN stored in sessionStorage.
 * This ensures credentials cannot be recovered simply by copying the raw localStorage dump to another device.
 */
export function getOrCreateDevicePinSecret(): string {
  let sessionPin: string | null = null;
  if (typeof sessionStorage !== 'undefined') {
    sessionPin = sessionStorage.getItem(STORAGE_KEY_SESSION_PIN);
    if (!sessionPin) {
      const pinBuf = new Uint8Array(16);
      crypto.getRandomValues(pinBuf);
      sessionPin = Array.from(pinBuf).map((b) => b.toString(16).padStart(2, '0')).join('');
      sessionStorage.setItem(STORAGE_KEY_SESSION_PIN, sessionPin);
    }
  } else {
    sessionPin = 'fallback_session_pin_node';
  }

  let deviceSalt: string | null = null;
  if (typeof localStorage !== 'undefined') {
    deviceSalt = localStorage.getItem(STORAGE_KEY_CRM_SALT);
    if (!deviceSalt) {
      const saltBuf = new Uint8Array(16);
      crypto.getRandomValues(saltBuf);
      deviceSalt = Array.from(saltBuf).map((b) => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(STORAGE_KEY_CRM_SALT, deviceSalt);
    }
  } else {
    deviceSalt = 'fallback_device_salt_node';
  }

  return `crm_pin_${sessionPin}_${deviceSalt}`;
}

/**
 * Encrypts a CRM API key before writing to browser storage.
 * Uses PBKDF2 (100,000 iterations) + AES-GCM 256-bit with chunked base64 encoding from encryption.ts.
 */
export async function encryptCrmApiKey(apiKey: string): Promise<string> {
  if (!apiKey || apiKey.startsWith(CRM_ENC_PREFIX)) return apiKey;
  const secret = getOrCreateDevicePinSecret();
  const ciphertext = await encryptData(apiKey, secret);
  return `${CRM_ENC_PREFIX}${ciphertext}`;
}

/**
 * Decrypts a stored CRM API key using the device session PIN.
 * Recovers cleartext token strictly for in-memory CRM API dispatches.
 */
export async function decryptCrmApiKey(encryptedKey: string): Promise<string> {
  if (!encryptedKey || !encryptedKey.startsWith(CRM_ENC_PREFIX)) return encryptedKey;
  try {
    const raw = encryptedKey.slice(CRM_ENC_PREFIX.length);
    const secret = getOrCreateDevicePinSecret();
    return await decryptData(raw, secret);
  } catch (err) {
    console.warn('Failed to decrypt CRM token using device PIN:', err);
    return '';
  }
}

/**
 * Asynchronously encrypts all user-provided CRM API keys before persisting to localStorage.
 * Guarantees zero plaintext tokens exist in unencrypted browser storage.
 */
export async function saveCrmConfigsAsync(configs: CRMConfig[]): Promise<void> {
  decryptedCrmCache = configs;
  try {
    const encrypted = await Promise.all(
      configs.map(async (c) => {
        if (!c.apiKey) return c;
        const encryptedKey = await encryptCrmApiKey(c.apiKey);
        return { ...c, apiKey: encryptedKey };
      })
    );
    localStorage.setItem(STORAGE_KEY_CRM, JSON.stringify(encrypted));
  } catch (err) {
    console.error('Failed to securely store encrypted CRM credentials:', err);
  }
}

export function saveCrmConfigs(configs: CRMConfig[]): void {
  decryptedCrmCache = configs;
  // Non-blocking asynchronous AES-GCM encryption & persistence
  saveCrmConfigsAsync(configs).catch((err) => {
    console.error('Background CRM encryption error:', err);
  });
}

/**
 * Loads CRM configurations from storage and decrypts all encrypted API tokens using the device PIN.
 */
export async function loadEncryptedCrmConfigs(): Promise<CRMConfig[]> {
  const allowed: CRMProvider[] = ['Apollo', 'HubSpot', 'Salesforce', 'GoogleContacts'];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CRM);
    if (!raw) {
      decryptedCrmCache = DEFAULT_CRM_CONFIGS;
      return DEFAULT_CRM_CONFIGS;
    }
    const parsed: CRMConfig[] = JSON.parse(raw);
    const decrypted = await Promise.all(
      parsed.map(async (c) => {
        if (!c.apiKey) return c;
        const plainKey = await decryptCrmApiKey(c.apiKey);
        return { ...c, apiKey: plainKey };
      })
    );
    const filtered = decrypted.filter((c) => allowed.includes(c.provider));
    for (const def of DEFAULT_CRM_CONFIGS) {
      if (!filtered.some((f) => f.provider === def.provider)) {
        filtered.push(def);
      }
    }
    decryptedCrmCache = filtered;
    return filtered;
  } catch (err) {
    console.error('Failed to load/decrypt CRM configs:', err);
    return DEFAULT_CRM_CONFIGS;
  }
}

export function getCrmConfigs(): CRMConfig[] {
  if (decryptedCrmCache) {
    return decryptedCrmCache;
  }
  const allowed: CRMProvider[] = ['Apollo', 'HubSpot', 'Salesforce', 'GoogleContacts'];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CRM);
    if (!raw) {
      saveCrmConfigs(DEFAULT_CRM_CONFIGS);
      decryptedCrmCache = DEFAULT_CRM_CONFIGS;
      return DEFAULT_CRM_CONFIGS;
    }
    const parsed: CRMConfig[] = JSON.parse(raw);
    const filtered = parsed.filter((c) => allowed.includes(c.provider));
    for (const def of DEFAULT_CRM_CONFIGS) {
      if (!filtered.some((f) => f.provider === def.provider)) {
        filtered.push(def);
      }
    }
    // Asynchronously decrypt into cache in background if encrypted tokens exist
    loadEncryptedCrmConfigs().catch((err) => {
      console.error('Async CRM token decryption failed:', err);
    });
    return filtered;
  } catch {
    return DEFAULT_CRM_CONFIGS;
  }
}

export function getAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveAppSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save app settings:', err);
  }
}

export function getOfflineQueue(): Array<{ id: string; imageData: string; timestamp: string }> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OFFLINE_QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToOfflineQueue(item: { id: string; imageData: string; timestamp: string }): void {
  try {
    const queue = getOfflineQueue();
    queue.push(item);
    localStorage.setItem(STORAGE_KEY_OFFLINE_QUEUE, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to add to offline queue:', err);
  }
}

export function clearOfflineQueue(): void {
  localStorage.removeItem(STORAGE_KEY_OFFLINE_QUEUE);
}

export function getUserBilling(): UserBillingState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BILLING);
    if (!raw) {
      saveUserBilling(DEFAULT_BILLING);
      return DEFAULT_BILLING;
    }
    return { ...DEFAULT_BILLING, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_BILLING;
  }
}

export function saveUserBilling(billing: UserBillingState): void {
  try {
    localStorage.setItem(STORAGE_KEY_BILLING, JSON.stringify(billing));
  } catch (err) {
    console.error('Failed to save user billing:', err);
  }
}

export function checkCanScanCards(
  requestedCount: number,
  billing: UserBillingState
): { allowed: boolean; remainingQuota: number; reason?: string } {
  if (billing.isSubscribed) {
    return { allowed: true, remainingQuota: Infinity };
  }

  const freeRemaining = Math.max(0, billing.freeCardsLimit - billing.freeCardsUsed);
  const totalAvailable = freeRemaining + billing.purchasedCredits;

  if (totalAvailable >= requestedCount) {
    return { allowed: true, remainingQuota: totalAvailable };
  }

  return {
    allowed: false,
    remainingQuota: totalAvailable,
    reason: `You have ${totalAvailable} card scan${totalAvailable === 1 ? '' : 's'} available (Limit: 20 free cards). You need ${requestedCount}. Upgrade to Pro Unlimited or grab an Event Pass to continue scanning.`
  };
}

export function consumeScanQuota(count: number, billing: UserBillingState): UserBillingState {
  if (billing.isSubscribed) {
    return {
      ...billing,
      totalCardsScanned: billing.totalCardsScanned + count,
    };
  }

  let remainingToDeduct = count;
  let newFreeUsed = billing.freeCardsUsed;
  let newPurchasedCredits = billing.purchasedCredits;

  // First consume free quota up to freeCardsLimit
  const availableFree = Math.max(0, billing.freeCardsLimit - newFreeUsed);
  const freeDeduction = Math.min(availableFree, remainingToDeduct);
  newFreeUsed += freeDeduction;
  remainingToDeduct -= freeDeduction;

  // Next consume purchased event pass credits
  if (remainingToDeduct > 0) {
    const creditsDeduction = Math.min(newPurchasedCredits, remainingToDeduct);
    newPurchasedCredits -= creditsDeduction;
    remainingToDeduct -= creditsDeduction;
  }

  const updated: UserBillingState = {
    ...billing,
    freeCardsUsed: newFreeUsed,
    purchasedCredits: newPurchasedCredits,
    totalCardsScanned: billing.totalCardsScanned + count,
  };

  saveUserBilling(updated);
  return updated;
}

export function upgradeToSubscription(
  plan: 'pro_monthly' | 'pro_annual',
  current: UserBillingState
): UserBillingState {
  const updated: UserBillingState = {
    ...current,
    plan,
    isSubscribed: true,
    subscribedAt: new Date().toISOString(),
    billingCycleEnd: new Date(Date.now() + (plan === 'pro_annual' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
    lastPurchaseDate: new Date().toISOString(),
    lastPurchaseDescription: plan === 'pro_annual' ? 'Pro Annual Plan ($44.99/year)' : 'Pro Monthly Plan ($3.99/month)',
  };
  saveUserBilling(updated);
  return updated;
}

export function purchaseCreditPack(
  pack: CreditPackType,
  current: UserBillingState
): UserBillingState {
  const creditsMap: Record<CreditPackType, { count: number; name: string; price: string }> = {
    pack_50: { count: 50, name: 'Expo Starter Pass (50 Cards)', price: '$4.99' },
    pack_200: { count: 200, name: 'Summit Pass (200 Cards)', price: '$14.99' },
    pack_500: { count: 500, name: 'Pro Event Pass (500 Cards)', price: '$29.99' },
    pack_1000: { count: 1000, name: 'Executive Enterprise Pass (1,000 Cards)', price: '$39.99' },
  };

  const packInfo = creditsMap[pack];
  const updated: UserBillingState = {
    ...current,
    purchasedCredits: current.purchasedCredits + packInfo.count,
    lastPurchaseDate: new Date().toISOString(),
    lastPurchaseDescription: `${packInfo.name} (${packInfo.price})`,
  };
  saveUserBilling(updated);
  return updated;
}

export function resetBillingToFree(current: UserBillingState): UserBillingState {
  const updated: UserBillingState = {
    ...current,
    plan: 'free',
    isSubscribed: false,
    freeCardsUsed: 0,
    purchasedCredits: 0,
  };
  saveUserBilling(updated);
  return updated;
}

// Aliases for convenience
export const loadCardsFromStorage = getSavedCards;
export const saveCardsToStorage = saveCards;
export const loadCategoriesFromStorage = getSavedCategories;
export const saveCategoriesToStorage = saveCategories;
export const loadCrmConfigs = getCrmConfigs;
export const loadSettings = getAppSettings;
export const saveSettings = saveAppSettings;
export const loadBilling = getUserBilling;
export const saveBilling = saveUserBilling;
