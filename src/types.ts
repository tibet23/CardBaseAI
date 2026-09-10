export type CRMProvider =
  | 'Apollo'
  | 'HubSpot'
  | 'Salesforce'
  | 'GoogleContacts';

export interface CardAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  full?: string;
}

export interface CardSocial {
  linkedin?: string;
  twitter?: string;
  github?: string;
  instagram?: string;
}

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface CRMSyncRecord {
  synced: boolean;
  syncedAt?: string;
  remoteId?: string;
  provider: CRMProvider;
  error?: string;
}

export interface CategoryConfig {
  id: string;
  name: string;
  color: string;
  description?: string;
  isDefault?: boolean;
}

export interface ContactCard {
  id: string;
  fullName: string;
  jobTitle: string;
  company: string;
  department?: string;
  email: string;
  phone: string;
  mobilePhone?: string;
  website?: string;
  address: CardAddress;
  social: CardSocial;
  category: string; // e.g. "Technology", "Healthcare", "Finance & Banking", "Executive"
  tags: string[];
  notes?: string;
  cardImage: string; // Base64 or Object URL of cropped card
  cardBackImage?: string;
  originalMultiCardImage?: string; // If part of a 10-card photo
  boundingBox?: BoundingBox;
  confidenceScore: number; // 0 - 100
  scannedAt: string; // ISO string
  updatedAt: string; // ISO string
  isFavorite: boolean;
  isOfflineScanned?: boolean;
  cloudBackedUp?: boolean;
  primaryColorHex?: string;
  crmSyncStatus: Partial<Record<CRMProvider, CRMSyncRecord>>;
}

export interface CRMConfig {
  provider: CRMProvider;
  name: string;
  connected: boolean;
  apiKey?: string;
  portalId?: string;
  autoSyncOnScan: boolean;
  lastSyncAt?: string;
  fieldMapping: {
    nameField: string;
    companyField: string;
    emailField: string;
    phoneField: string;
    titleField: string;
  };
}

export interface BatchScanResult {
  detectedCardCount: number;
  cards: Array<{
    cardIndex: number;
    fullName: string;
    jobTitle?: string;
    company: string;
    department?: string;
    email?: string;
    phone?: string;
    mobilePhone?: string;
    website?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    linkedin?: string;
    twitter?: string;
    category?: string;
    suggestedTags?: string[];
    notes?: string;
    primaryColorHex?: string;
    confidenceScore: number;
    boundingBox: BoundingBox;
    croppedImageDataUrl?: string;
  }>;
}

export interface BackupMetadata {
  cardCount: number;
  createdAt: string;
  appVersion: string;
  checksum: string;
}

export interface CloudBackupRecord {
  backupKey: string;
  encryptedPayload: string; // Encrypted JSON string
  metadata: BackupMetadata;
  updatedAt: string;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  internalDate: string;
  isUnread?: boolean;
  bodyPreview?: string;
}

export interface EmailThreadSummary {
  threadId: string;
  subject: string;
  snippet: string;
  lastMessageDate: string;
  messageCount: number;
  participants: string[];
  messages: EmailMessage[];
}

export type SubscriptionPlanType = 'free' | 'pro_monthly' | 'pro_annual';
export type CreditPackType = 'pack_50' | 'pack_200' | 'pack_500' | 'pack_1000';

export interface UserBillingState {
  plan: SubscriptionPlanType;
  isSubscribed: boolean;
  subscribedAt?: string;
  freeCardsLimit: number; // default: 20
  freeCardsUsed: number;
  purchasedCredits: number; // Credits from Event Passes
  totalCardsScanned: number;
  billingCycleEnd?: string;
  lastPurchaseDate?: string;
  lastPurchaseDescription?: string;
}
