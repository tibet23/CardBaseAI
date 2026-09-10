import React, { useState } from 'react';
import {
  X,
  Check,
  Zap,
  Sparkles,
  Crown,
  Ticket,
  ShieldCheck,
  Layers,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Smartphone,
  RefreshCw,
  Award,
  Flame,
  Globe,
  Loader2,
  Play
} from 'lucide-react';
import { UserBillingState, SubscriptionPlanType, CreditPackType } from '../types';
import { upgradeToSubscription, purchaseCreditPack, resetBillingToFree } from '../utils/storage';
import { executePlayPurchase, PLAY_STORE_SKUS, isGooglePlayEnvironment } from '../utils/googlePlayBilling';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  billing: UserBillingState;
  onBillingUpdated: (newBilling: UserBillingState) => void;
  triggerReason?: string;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  billing,
  onBillingUpdated,
  triggerReason,
}) => {
  const [activeTab, setActiveTab] = useState<'subscription' | 'event_passes' | 'compare'>('subscription');
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');
  const [purchaseSuccessMessage, setPurchaseSuccessMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isPlayStore = isGooglePlayEnvironment();

  if (!isOpen) return null;

  const handleSelectSubscription = async (plan: 'pro_monthly' | 'pro_annual') => {
    setIsProcessing(true);
    setErrorMessage(null);

    const sku = plan === 'pro_annual' ? PLAY_STORE_SKUS.PRO_ANNUAL_SUB : PLAY_STORE_SKUS.PRO_MONTHLY_SUB;
    const res = await executePlayPurchase(sku);

    setIsProcessing(false);

    if (res.success) {
      const updated = upgradeToSubscription(plan, billing);
      onBillingUpdated(updated);
      setPurchaseSuccessMessage(
        plan === 'pro_annual'
          ? '🎉 Welcome to CardBase Pro Annual! Unlimited scans & CRM sync are now fully unlocked via Google Play.'
          : '🎉 Welcome to CardBase Pro Monthly! Unlimited scans & CRM sync are now fully unlocked via Google Play.'
      );
      setTimeout(() => setPurchaseSuccessMessage(null), 5000);
    } else {
      setErrorMessage(res.error || 'Failed to complete Google Play subscription.');
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleBuyCredits = async (pack: CreditPackType) => {
    setIsProcessing(true);
    setErrorMessage(null);

    const skuMap: Record<CreditPackType, string> = {
      pack_50: PLAY_STORE_SKUS.PACK_50_CREDITS,
      pack_200: PLAY_STORE_SKUS.PACK_200_CREDITS,
      pack_500: PLAY_STORE_SKUS.PACK_500_CREDITS,
      pack_1000: PLAY_STORE_SKUS.PACK_1000_CREDITS,
    };

    const res = await executePlayPurchase(skuMap[pack]);

    setIsProcessing(false);

    if (res.success) {
      const updated = purchaseCreditPack(pack, billing);
      onBillingUpdated(updated);
      const creditsAdded = pack === 'pack_50' ? 50 : pack === 'pack_200' ? 200 : pack === 'pack_500' ? 500 : 1000;
      setPurchaseSuccessMessage(`🎉 Success! Added +${creditsAdded} Event Pass Credits to your vault via Google Play.`);
      setTimeout(() => setPurchaseSuccessMessage(null), 5000);
    } else {
      setErrorMessage(res.error || 'Failed to complete Google Play purchase.');
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleResetForTesting = () => {
    const updated = resetBillingToFree(billing);
    onBillingUpdated(updated);
    setPurchaseSuccessMessage('Reset account to Free Tier for testing.');
    setTimeout(() => setPurchaseSuccessMessage(null), 3000);
  };

  const freeRemaining = Math.max(0, billing.freeCardsLimit - billing.freeCardsUsed);
  const freePercent = Math.min(100, Math.round((billing.freeCardsUsed / billing.freeCardsLimit) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#090d16] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800/90 w-full max-w-4xl max-h-[92vh] overflow-y-auto flex flex-col my-auto">
        
        {/* Modal Top Header */}
        <div className="relative px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-transparent flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#090d16]/95 backdrop-blur-sm z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">CardBase AI Pricing</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60">
                  Hybrid Flexible Model
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Free for your first 20 cards. Choose between unlimited recurring subscriptions or one-time conference event passes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
            aria-label="Close pricing modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Trigger Reason Alert if fired due to quota limit */}
        {triggerReason && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-200">
              <span className="font-bold">Quota Notice: </span>
              {triggerReason}
            </div>
          </div>
        )}

        {/* Purchase Success Toast / Message */}
        {purchaseSuccessMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center space-x-3 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">
              {purchaseSuccessMessage}
            </span>
          </div>
        )}

        {/* Error Toast */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center space-x-3 animate-in fade-in">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <span className="text-xs font-semibold text-red-800 dark:text-red-200">
              {errorMessage}
            </span>
          </div>
        )}

        <div className="p-6 space-y-6">

          {/* Account Status / Live Quota Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Current Status:</span>
                {billing.isSubscribed ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-xs">
                    <Crown className="h-3 w-3 mr-1" />
                    Pro Unlimited Active ({billing.plan === 'pro_annual' ? 'Annual' : 'Monthly'})
                  </span>
                ) : billing.purchasedCredits > 0 ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <Ticket className="h-3 w-3 mr-1" />
                    Event Pass Active ({billing.purchasedCredits} Credits Left)
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                    Free Starter Plan (20 Cards Total)
                  </span>
                )}
              </div>

              {!billing.isSubscribed && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    <span>Free Quota Used: <strong>{billing.freeCardsUsed} / {billing.freeCardsLimit} cards</strong></span>
                    <span>{freeRemaining} free scan{freeRemaining === 1 ? '' : 's'} remaining</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        freePercent >= 100 ? 'bg-amber-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                      }`}
                      style={{ width: `${freePercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Status Stats */}
            <div className="flex items-center space-x-3 shrink-0 text-right">
              {billing.purchasedCredits > 0 && (
                <div className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-center">
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Pass Credits</div>
                  <div className="text-sm font-extrabold text-blue-700 dark:text-blue-300">+{billing.purchasedCredits} scans</div>
                </div>
              )}
              <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-center">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total Scanned</div>
                <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{billing.totalCardsScanned} cards</div>
              </div>
            </div>
          </div>

          {/* Navigation Model Selector Tabs */}
          <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800/80">
            <button
              onClick={() => setActiveTab('subscription')}
              className={`flex-1 min-h-[44px] flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'subscription'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Crown className="h-4 w-4 text-amber-500" />
              <span>Unlimited Subscriptions</span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                Most Popular
              </span>
            </button>
            <button
              onClick={() => setActiveTab('event_passes')}
              className={`flex-1 min-h-[44px] flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'event_passes'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Ticket className="h-4 w-4 text-blue-500" />
              <span>Conference Event Passes</span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold">
                No Subscriptions
              </span>
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`flex-1 min-h-[44px] flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'compare'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="h-4 w-4 text-indigo-500" />
              <span>Plan Comparison</span>
            </button>
          </div>

          {/* TAB 1: SUBSCRIPTION PLANS */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              
              {/* Billing Cycle Toggle (Annual vs Monthly) */}
              <div className="flex items-center justify-center space-x-3">
                <span className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                  Monthly Billed
                </span>
                <button
                  onClick={() => setBillingCycle(billingCycle === 'annual' ? 'monthly' : 'annual')}
                  className="w-14 h-7 rounded-full p-1 bg-slate-200 dark:bg-slate-800 transition-colors relative cursor-pointer"
                  aria-label="Toggle annual or monthly billing"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-blue-600 transition-transform ${
                      billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
                <div className="flex items-center space-x-1.5">
                  <span className={`text-xs font-bold ${billingCycle === 'annual' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                    Annual Billed
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    BEST VALUE
                  </span>
                </div>
              </div>

              {/* Grid of Subscriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Free Starter Card */}
                <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0b1120] flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Free Starter</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">For testing single &amp; batch AI OCR</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        $0 / Forever
                      </span>
                    </div>

                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      $0 <span className="text-xs font-medium text-slate-400">/ lifetime</span>
                    </div>

                    <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <li className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span><strong>20 Business Cards</strong> lifetime free limit</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span><strong>10-Card Batch OCR</strong> with auto boundary detection</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>Offline Tesseract engine in browser</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>Local device storage &amp; single .vcf download</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    disabled={billing.plan === 'free' && !billing.isSubscribed}
                    onClick={handleResetForTesting}
                    className="w-full min-h-[44px] py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {billing.plan === 'free' && !billing.isSubscribed ? 'Current Plan' : 'Switch to Free'}
                  </button>
                </div>

                {/* Pro Unlimited Card (Hero Highlight) */}
                <div className="p-5 rounded-3xl border-2 border-indigo-500 dark:border-indigo-500/80 bg-gradient-to-b from-indigo-500/5 via-blue-500/5 to-transparent dark:bg-[#0c1427] relative flex flex-col justify-between space-y-4 shadow-xl shadow-indigo-500/10">
                  <div className="absolute -top-3 right-6 px-3 py-1 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-md">
                    ★ RECOMMENDED FOR SALES
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          Pro Unlimited
                          <Sparkles className="h-4 w-4 text-amber-500" />
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Unlimited power for networking pros &amp; executives</p>
                      </div>
                    </div>

                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">
                        {billingCycle === 'annual' ? '$3.75' : '$3.99'}
                      </span>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        / month {billingCycle === 'annual' ? '(billed $44.99/year)' : '(billed monthly)'}
                      </span>
                    </div>

                    <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-200 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <li className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-indigo-500 shrink-0" />
                        <span><strong>Unlimited Card Scans</strong> (single + 10-card batch)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-indigo-500 shrink-0" />
                        <span><strong>1-Click CRM Direct Sync</strong> (Apollo.io, HubSpot, Salesforce, Google Contacts)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-indigo-500 shrink-0" />
                        <span><strong>Encrypted Multi-Device Cloud Backup</strong> &amp; Vault Sync</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-indigo-500 shrink-0" />
                        <span><strong>Bulk .CSV, .VCF 3.0 &amp; Print Sheets</strong> export</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-indigo-500 shrink-0" />
                        <span>High-Priority Gemini Vision &amp; Multilingual AI parsing</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleSelectSubscription(billingCycle === 'annual' ? 'pro_annual' : 'pro_monthly')}
                    className="w-full min-h-[46px] py-3 px-4 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 active:scale-95 transition-all shadow-lg shadow-indigo-500/25 cursor-pointer border border-indigo-400/30 flex items-center justify-center space-x-2"
                  >
                    <Crown className="h-4 w-4 text-amber-300" />
                    <span>
                      {billing.isSubscribed
                        ? `Switch to Pro ${billingCycle === 'annual' ? 'Annual ($44.99/yr)' : 'Monthly ($3.99/mo)'}`
                        : `Upgrade to Pro Unlimited (${billingCycle === 'annual' ? '$44.99/yr' : '$3.99/mo'})`}
                    </span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: CONFERENCE & EVENT PASSES (PAY-PER-CARD PACKS) */}
          {activeTab === 'event_passes' && (
            <div className="space-y-6">
              
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-transparent border border-blue-500/20 flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Ticket className="h-4 w-4 text-blue-500" />
                    Prepaid Event Passes — Zero Monthly Commitments
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Heading to an expo, conference, or trade show? Buy a bundle of card scan credits that <strong>never expire</strong>.
                  </p>
                </div>
                <div className="hidden sm:block text-right">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                    Credits Never Expire
                  </span>
                </div>
              </div>

              {/* 4 Event Pass Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                
                {/* 50 Cards Pack */}
                <div className="p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1120] flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Expo Starter
                      </span>
                      <span className="text-[11px] text-slate-400">10¢ / card</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      $4.99 <span className="text-xs font-normal text-slate-400">one-time</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center">
                      <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">50</div>
                      <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Card Scan Credits</div>
                    </div>
                    <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <li className="flex items-center space-x-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Ideal for 1-day events</span>
                      </li>
                      <li className="flex items-center space-x-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Batch &amp; single scans</span>
                      </li>
                      <li className="flex items-center space-x-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Full CSV &amp; VCF export</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleBuyCredits('pack_50')}
                    className="w-full min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    Buy 50 Credits ($4.99)
                  </button>
                </div>

                {/* 200 Cards Summit Pass */}
                <div className="p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1120] flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Summit Pass
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">7.5¢ / card</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      $14.99 <span className="text-xs font-normal text-slate-400">one-time</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center">
                      <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">200</div>
                      <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Card Scan Credits</div>
                    </div>
                    <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <li className="flex items-center space-x-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Best for 2-3 day events</span>
                      </li>
                      <li className="flex items-center space-x-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Direct CRM Sync unlocked</span>
                      </li>
                      <li className="flex items-center space-x-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Save 25% vs Starter pack</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleBuyCredits('pack_200')}
                    className="w-full min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    Buy 200 Credits ($14.99)
                  </button>
                </div>

                {/* 500 Cards Pro Event Pass (Featured / Most Popular) */}
                <div className="p-4 sm:p-5 rounded-3xl border-2 border-blue-500 dark:border-blue-500 bg-gradient-to-b from-blue-500/10 to-transparent dark:bg-[#0c1427] flex flex-col justify-between space-y-4 relative shadow-lg shadow-blue-500/10">
                  <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white shadow-xs">
                    MOST POPULAR
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Pro Event Pass
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">6¢ / card</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      $29.99 <span className="text-xs font-normal text-slate-400">one-time</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
                      <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">500</div>
                      <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">Card Scan Credits</div>
                    </div>
                    <ul className="text-xs space-y-2 text-slate-700 dark:text-slate-200 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <li className="flex items-center space-x-1.5">
                        <Check className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <span>Major summits &amp; expos</span>
                      </li>
                      <li className="flex items-center space-x-1.5">
                        <Check className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <span>CRM Sync &amp; AI Email Drafts</span>
                      </li>
                      <li className="flex items-center space-x-1.5">
                        <Check className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <span>Save 40% vs Starter pack</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleBuyCredits('pack_500')}
                    className="w-full min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-md shadow-blue-600/30 cursor-pointer border border-blue-400/30"
                  >
                    Buy 500 Credits ($29.99)
                  </button>
                </div>

                {/* 1,000 Cards Executive Enterprise Pack */}
                <div className="p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1120] flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Enterprise Summit
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">4¢ / card</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      $39.99 <span className="text-xs font-normal text-slate-400">one-time</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center">
                      <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">1,000</div>
                      <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Card Scan Credits</div>
                    </div>
                    <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <li className="flex items-center space-x-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>For booths &amp; sales reps</span>
                      </li>
                      <li className="flex items-center space-x-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Lowest cost per card (60% off)</span>
                      </li>
                      <li className="flex items-center space-x-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Full CRM &amp; batch exports</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleBuyCredits('pack_1000')}
                    className="w-full min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    Buy 1,000 Credits ($39.99)
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: FEATURE MATRIX COMPARISON */}
          {activeTab === 'compare' && (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">
                    <th className="py-3 px-4 font-bold">Capabilities</th>
                    <th className="py-3 px-4 font-bold text-center">Free Starter</th>
                    <th className="py-3 px-4 font-bold text-center">Event Pass (Prepaid)</th>
                    <th className="py-3 px-4 font-bold text-center text-indigo-600 dark:text-indigo-400">Pro Unlimited</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="py-3 px-4 font-medium">Card Scan Quota</td>
                    <td className="py-3 px-4 text-center">20 Cards Total</td>
                    <td className="py-3 px-4 text-center">50, 200, 500, or 1,000 Credits</td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-600 dark:text-indigo-400">Unlimited Scans</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">10-Card Overhead Batch OCR</td>
                    <td className="py-3 px-4 text-center"><Check className="h-4 w-4 text-emerald-500 mx-auto" /></td>
                    <td className="py-3 px-4 text-center"><Check className="h-4 w-4 text-emerald-500 mx-auto" /></td>
                    <td className="py-3 px-4 text-center"><Check className="h-4 w-4 text-emerald-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Offline Tesseract.js Scanning</td>
                    <td className="py-3 px-4 text-center"><Check className="h-4 w-4 text-emerald-500 mx-auto" /></td>
                    <td className="py-3 px-4 text-center"><Check className="h-4 w-4 text-emerald-500 mx-auto" /></td>
                    <td className="py-3 px-4 text-center"><Check className="h-4 w-4 text-emerald-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">HubSpot &amp; Salesforce Direct Sync</td>
                    <td className="py-3 px-4 text-center text-slate-400">—</td>
                    <td className="py-3 px-4 text-center"><Check className="h-4 w-4 text-emerald-500 mx-auto" /></td>
                    <td className="py-3 px-4 text-center"><Check className="h-4 w-4 text-emerald-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Bulk .CSV &amp; .VCF Exports</td>
                    <td className="py-3 px-4 text-center text-slate-400">Single Only</td>
                    <td className="py-3 px-4 text-center"><Check className="h-4 w-4 text-emerald-500 mx-auto" /></td>
                    <td className="py-3 px-4 text-center"><Check className="h-4 w-4 text-emerald-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Cross-Device Encrypted Cloud Backup</td>
                    <td className="py-3 px-4 text-center text-slate-400">—</td>
                    <td className="py-3 px-4 text-center text-slate-400">—</td>
                    <td className="py-3 px-4 text-center"><Check className="h-4 w-4 text-emerald-500 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Quick FAQ / Guarantee */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-start space-x-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 dark:text-slate-200">No Risk Guarantee</strong>
                <p>Cancel monthly/annual subscriptions anytime with 1 click.</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Ticket className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 dark:text-slate-200">Non-Expiring Passes</strong>
                <p>Event pass credits roll over forever with zero monthly charges.</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Smartphone className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 dark:text-slate-200">Full Mobile Support</strong>
                <p>Use your account seamlessly on mobile, tablet, and desktop.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#0b1120]/80 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-10">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2">
            <span>Secure payment processed via Google Play / Stripe</span>
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="min-h-[42px] px-5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
