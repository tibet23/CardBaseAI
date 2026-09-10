/**
 * Native Android Utilities & Google Play Review Prompt
 */

export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.cardbase.ai';

/**
 * Trigger native Android Share Sheet or fallback
 */
export async function shareViaAndroid(data: {
  title: string;
  text: string;
  url?: string;
  files?: File[];
}): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      if (data.files && navigator.canShare && navigator.canShare({ files: data.files })) {
        await navigator.share(data);
        return true;
      } else {
        await navigator.share({
          title: data.title,
          text: data.text,
          url: data.url || window.location.origin,
        });
        return true;
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Native share failed:', err);
      }
    }
  }
  return false;
}

/**
 * Request In-App Review or open Google Play Store listing
 */
export function openPlayStoreReview(): void {
  window.open(PLAY_STORE_URL, '_blank');
}
