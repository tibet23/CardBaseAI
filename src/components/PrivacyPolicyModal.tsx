import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Eye, FileText, Camera, Database, CreditCard, RefreshCw, CheckCircle2 } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'privacy' | 'terms' | 'permissions';
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'permissions'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#090d16] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800/90 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#0b1120]/80 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Privacy Policy &amp; Legal Center
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Google Play Store Compliant • Last Updated: 2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex px-6 pt-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#080d18] gap-2">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Privacy Policy</span>
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'permissions'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>App Permissions</span>
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'terms'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Terms of Service</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Zero Data Retention &amp; Selling Guarantee</div>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                    When using the cloud-based AI scanner, images are securely transmitted to our OCR provider solely for real-time text extraction. These images are processed ephemerally and immediately discarded. We do not store, log, or train models on your business cards. All extracted contact data remains saved strictly on your local device.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">1. Information We Collect &amp; Ephemeral AI Processing</h3>
                <p>
                  When using the cloud-based AI scanner, images are securely transmitted to our OCR provider solely for real-time text extraction. These images are processed ephemerally and immediately discarded. We do not store, log, or train models on your business cards. All extracted contact data remains saved strictly on your local device.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">2. Local-First Storage &amp; Encryption</h3>
                <p>
                  Your business card contacts remain stored directly within your device's isolated client database. Cloud backup archives are encrypted client-side using industry-standard AES-GCM encryption before transmission.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">3. In-App Purchases &amp; Billing</h3>
                <p>
                  All digital goods, event passes, and recurring subscriptions purchased on Android devices are processed securely through Google Play Billing. CardBase AI never handles or stores raw credit card numbers.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">4. User Rights &amp; Data Deletion</h3>
                <p>
                  In compliance with Google Play Data Safety standards, you hold full ownership of your data and can purge all stored contacts, cached images, and cloud backups at any time via the in-app Data Safety / Deletion center.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <p className="text-slate-500 dark:text-slate-400">
                CardBase AI requests only the essential device permissions required to scan and export business cards:
              </p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 flex items-start space-x-3">
                  <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Camera Access (android.permission.CAMERA)</div>
                    <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                      Required exclusively to capture live photos of physical business cards for single-card and 10-card batch OCR recognition. Video streams are never recorded or stored on remote servers.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 flex items-start space-x-3">
                  <Database className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Storage &amp; File Access</div>
                    <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                      Used to allow you to select desk photos from your gallery, save downloaded vCard (.vcf) contact files, and export CSV spreadsheets.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Google Play Billing (com.android.vending.BILLING)</div>
                    <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                      Enables secure native Google Play purchases for Pro subscriptions and conference event pass credit packs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">1. Acceptance of Terms</h3>
                <p>
                  By downloading, installing, or using CardBase AI, you agree to these Terms of Service. If you do not agree, please discontinue using the service.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">2. Hybrid Subscriptions &amp; Event Passes</h3>
                <p>
                  - <strong>Free Starter:</strong> Provides 20 complimentary card scans with core features.<br />
                  - <strong>Pro Subscriptions:</strong> Billed monthly or annually with automatic renewal. You may cancel at any time via your Google Play Subscriptions center.<br />
                  - <strong>Prepaid Event Passes:</strong> One-time consumable credits for conferences that do not expire and do not auto-renew.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">3. OCR Accuracy &amp; Disclaimers</h3>
                <p>
                  Optical Character Recognition accuracy depends on lighting, typography, and card condition. While CardBase AI employs high-precision AI parsing, users are encouraged to verify contact details before CRM export.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#0b1120]/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            CardBase AI • Play Store Release Edition
          </span>
          <button
            onClick={onClose}
            className="min-h-[40px] px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors cursor-pointer"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
};
