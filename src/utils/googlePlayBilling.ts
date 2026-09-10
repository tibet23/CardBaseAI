/**
 * Google Play In-App Billing & Digital Goods API Bridge
 * 
 * Supports Trusted Web Activities (TWA) / Bubblewrap / Capacitor on Google Play Store
 * Uses the standard Digital Goods API (window.getDigitalGoodsService) for Play Billing,
 * with graceful fallback to standard web payment simulation or Stripe.
 */

import { SubscriptionPlanType, CreditPackType, UserBillingState } from '../types';

export const PLAY_STORE_PACKAGE_ID = 'com.cardbase.ai';

// Google Play In-App Product & Subscription SKUs
export const PLAY_STORE_SKUS = {
  // Recurring Subscriptions
  PRO_MONTHLY_SUB: 'sub_pro_monthly',
  PRO_ANNUAL_SUB: 'sub_pro_annual',
  
  // One-Time Consumable Credit Packs (Event Passes)
  PACK_50_CREDITS: 'pack_50_credits',
  PACK_200_CREDITS: 'pack_200_credits',
  PACK_500_CREDITS: 'pack_500_credits',
  PACK_1000_CREDITS: 'pack_1000_credits',
} as const;

export interface PlayStoreProductDetails {
  itemId: string;
  title: string;
  description: string;
  price: {
    currency: string;
    value: string;
  };
  type: 'inapp' | 'subs';
}

/**
 * Detects if app is running inside a Google Play Store Trusted Web Activity (TWA)
 */
export function isGooglePlayEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  
  // 1. Check for Digital Goods API availability (available in TWA on Android)
  if ('getDigitalGoodsService' in window) {
    return true;
  }

  // 2. Check document.referrer (TWA often has android-app:// referrer)
  if (document.referrer.startsWith('android-app://')) {
    return true;
  }

  // 3. Check custom userAgent or Android webview flag if wrapped
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('wv') || ua.includes('cardbase-twa') || ua.includes('bubblewrap')) {
    return true;
  }

  return false;
}

/**
 * Connect to Google Play Digital Goods Service
 */
export async function getPlayBillingService(): Promise<any | null> {
  try {
    if (typeof window !== 'undefined' && 'getDigitalGoodsService' in window) {
      // @ts-ignore
      const service = await window.getDigitalGoodsService('https://play.google.com/billing');
      return service;
    }
  } catch (err) {
    console.warn('Digital Goods Service initialization failed:', err);
  }
  return null;
}

/**
 * Query SKU details from Google Play Store
 */
export async function fetchPlayStoreProducts(): Promise<PlayStoreProductDetails[]> {
  const service = await getPlayBillingService();
  if (!service) {
    // Return static SKU catalog if outside Google Play TWA
    return [
      {
        itemId: PLAY_STORE_SKUS.PRO_MONTHLY_SUB,
        title: 'CardBase Pro Monthly',
        description: 'Unlimited single & batch card scans with CRM sync',
        price: { currency: 'USD', value: '3.99' },
        type: 'subs',
      },
      {
        itemId: PLAY_STORE_SKUS.PRO_ANNUAL_SUB,
        title: 'CardBase Pro Annual Unlimited',
        description: 'Unlimited single & batch card scans for a full year',
        price: { currency: 'USD', value: '44.99' },
        type: 'subs',
      },
      {
        itemId: PLAY_STORE_SKUS.PACK_50_CREDITS,
        title: 'Expo Starter Pass (50 Credits)',
        description: '50 business card scans for expos & single-day events',
        price: { currency: 'USD', value: '4.99' },
        type: 'inapp',
      },
      {
        itemId: PLAY_STORE_SKUS.PACK_200_CREDITS,
        title: 'Summit Pass (200 Credits)',
        description: '200 business card scans with CRM sync (Most Popular)',
        price: { currency: 'USD', value: '14.99' },
        type: 'inapp',
      },
      {
        itemId: PLAY_STORE_SKUS.PACK_500_CREDITS,
        title: 'Pro Event Pass (500 Credits)',
        description: '500 business card scans for multi-day conventions & summits',
        price: { currency: 'USD', value: '29.99' },
        type: 'inapp',
      },
      {
        itemId: PLAY_STORE_SKUS.PACK_1000_CREDITS,
        title: 'Enterprise Summit Pass (1,000 Credits)',
        description: '1,000 business card scans for sales teams & booths',
        price: { currency: 'USD', value: '39.99' },
        type: 'inapp',
      },
    ];
  }

  try {
    const skuList = Object.values(PLAY_STORE_SKUS);
    const details = await service.getDetails(skuList);
    return details;
  } catch (err) {
    console.error('Failed to fetch details from Google Play Billing:', err);
    return [];
  }
}

/**
 * Execute a Google Play Purchase via Digital Goods API / Payment Request
 */
export async function executePlayPurchase(
  sku: string
): Promise<{ success: boolean; purchaseToken?: string; error?: string }> {
  try {
    const service = await getPlayBillingService();

    if (service && typeof window.PaymentRequest !== 'undefined') {
      const paymentMethod = [
        {
          supportedMethods: 'https://play.google.com/billing',
          data: {
            sku: sku,
          },
        },
      ];

      const paymentDetails = {
        total: {
          label: 'Total',
          amount: { currency: 'USD', value: '0.00' }, // Value populated by Google Play
        },
      };

      const request = new PaymentRequest(paymentMethod, paymentDetails);
      const paymentResponse = await request.show();
      const { purchaseToken } = paymentResponse.details;

      // Complete the payment transaction
      await paymentResponse.complete('success');

      // Acknowledge or consume purchase
      if (sku.startsWith('pack_')) {
        // Consumable credit pack
        await service.consume(purchaseToken);
      }

      return {
        success: true,
        purchaseToken,
      };
    } else {
      // Running in browser preview / web mode -> simulate standard payment
      await new Promise((res) => setTimeout(res, 600));
      return {
        success: true,
        purchaseToken: `sim_gplay_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      };
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { success: false, error: 'Payment was cancelled by user.' };
    }
    return {
      success: false,
      error: err.message || 'Google Play purchase failed.',
    };
  }
}
