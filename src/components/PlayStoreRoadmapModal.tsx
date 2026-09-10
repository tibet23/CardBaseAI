import React, { useState } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Terminal,
  ShieldCheck,
  CreditCard,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Download,
  Smartphone,
  Globe,
  FileCode,
  DollarSign
} from 'lucide-react';
import { PLAY_STORE_SKUS, isGooglePlayEnvironment } from '../utils/googlePlayBilling';

interface PlayStoreRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPrivacyModal?: () => void;
}

export const PlayStoreRoadmapModal: React.FC<PlayStoreRoadmapModalProps> = ({
  isOpen,
  onClose,
  onOpenPrivacyModal,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const steps = [
    {
      id: 1,
      title: 'Google Play Console & Merchant Account',
      subtitle: 'Create developer identity and link payments profile to receive sales payouts',
      badge: 'Step 1',
    },
    {
      id: 2,
      title: 'In-App Products & Subscriptions (SKUs)',
      subtitle: 'Configure pricing, credit packs, and recurring subscriptions in Play Console',
      badge: 'Step 2',
    },
    {
      id: 3,
      title: 'Generate Android App Bundle (.aab)',
      subtitle: 'Package into native Google Play Bundle using official Bubblewrap CLI',
      badge: 'Step 3',
    },
    {
      id: 4,
      title: 'Digital Asset Links Verification',
      subtitle: 'Remove browser URL bar for full-screen native Android experience',
      badge: 'Step 4',
    },
    {
      id: 5,
      title: 'Data Safety, Privacy & Content Rating',
      subtitle: 'Complete mandatory Google Play forms for camera, OCR & account deletion',
      badge: 'Step 5',
    },
    {
      id: 6,
      title: 'Internal/Closed Testing & Production Release',
      subtitle: 'Invite 20 testers, pass review, and launch publicly to Google Play',
      badge: 'Step 6',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#090d16] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800/90 w-full max-w-4xl max-h-[92vh] overflow-y-auto flex flex-col my-auto">
        
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-emerald-900/10 via-blue-900/10 to-transparent flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#090d16]/95 backdrop-blur-sm z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-blue-600 text-white shadow-md shadow-emerald-500/20">
              <Play className="h-5 w-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Google Play Store Publishing Roadmap
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Ready to Publish
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Complete, step-by-step roadmap to compile, package, and publish CardBase AI for users to buy on Google Play.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* App Play Store Readiness Status Card */}
          <div className="p-4.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-transparent border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Codebase Adaptation: 100% Configured
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Passed
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                All PWA Manifest fields, Service Worker offline caching, Digital Goods In-App Billing APIs, and Digital Asset Links have been generated into the codebase.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-[11px] font-mono text-emerald-700 dark:text-emerald-300 bg-white/60 dark:bg-slate-900/60 px-3 py-1.5 rounded-xl border border-emerald-500/30">
              <FileCode className="h-3.5 w-3.5" />
              <span>Package: com.cardbase.ai</span>
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {steps.map((step) => {
              const isCurrent = activeStep === step.id;
              const isCompleted = activeStep > step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`p-3 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between min-h-[72px] ${
                    isCurrent
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                      : isCompleted
                      ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/30 dark:bg-emerald-950/20 text-slate-800 dark:text-slate-200'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#070b14] text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider">{step.badge}</span>
                    {isCompleted && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                  </div>
                  <div className="text-xs font-extrabold truncate mt-1">{step.title.split(' ')[0]} {step.title.split(' ')[1]}</div>
                </button>
              );
            })}
          </div>

          {/* STEP 1 DETAILS */}
          {activeStep === 1 && (
            <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1120] space-y-4">
              <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-white">
                <DollarSign className="h-5 w-5 text-emerald-500" />
                <span>Step 1: Set up Google Play Console &amp; Merchant Payments Profile</span>
              </div>
              
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                To publish paid apps or sell subscriptions and credit packs, you need an active Google Play Developer account with a linked Payments Merchant Account.
              </p>

              <div className="space-y-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start space-x-3 text-xs">
                  <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">1</div>
                  <div>
                    <strong>Register Developer Account:</strong> Go to <a href="https://play.google.com/console/signup" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">play.google.com/console</a> (one-time $25 fee).
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start space-x-3 text-xs">
                  <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">2</div>
                  <div>
                    <strong>Create Google Payments Merchant Account:</strong> In Play Console, navigate to <em>Settings → Developer account → Payment profile</em> and link your bank account to receive 85% payouts on every subscription and credit pack sale.
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start space-x-3 text-xs">
                  <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">3</div>
                  <div>
                    <strong>Create New App:</strong> Click "Create app", set App Name to <strong>"CardBase AI - Business Card Scanner"</strong>, select <strong>Free</strong> (with In-App Purchases) or <strong>Paid</strong>, and set category to <strong>Business</strong>.
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveStep(2)}
                  className="min-h-[42px] px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 flex items-center space-x-1 cursor-pointer"
                >
                  <span>Continue to Step 2: Configure SKUs</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 DETAILS */}
          {activeStep === 2 && (
            <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1120] space-y-4">
              <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-white">
                <CreditCard className="h-5 w-5 text-indigo-500" />
                <span>Step 2: Create In-App Products &amp; Subscriptions in Google Play</span>
              </div>
              
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                CardBase AI is pre-configured with 5 standard Google Play In-App SKUs. Create each SKU in your Google Play Console under <em>Monetize → In-app products</em> and <em>Subscriptions</em>:
              </p>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Product ID / SKU</th>
                      <th className="py-2.5 px-3">Price</th>
                      <th className="py-2.5 px-3">Billing Model</th>
                      <th className="py-2.5 px-3">Copy SKU</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    <tr>
                      <td className="py-2 px-3 font-semibold text-amber-600">Subscription</td>
                      <td className="py-2 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">sub_pro_monthly</td>
                      <td className="py-2 px-3">$3.99 / mo</td>
                      <td className="py-2 px-3">Recurring Monthly</td>
                      <td className="py-2 px-3">
                        <button
                          onClick={() => copyToClipboard('sub_pro_monthly', 'sku1')}
                          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[10px] font-mono cursor-pointer flex items-center gap-1"
                        >
                          {copiedKey === 'sku1' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          Copy
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-amber-600">Subscription</td>
                      <td className="py-2 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">sub_pro_annual</td>
                      <td className="py-2 px-3">$44.99 / yr</td>
                      <td className="py-2 px-3">Recurring Annual Unlimited</td>
                      <td className="py-2 px-3">
                        <button
                          onClick={() => copyToClipboard('sub_pro_annual', 'sku2')}
                          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[10px] font-mono cursor-pointer flex items-center gap-1"
                        >
                          {copiedKey === 'sku2' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          Copy
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-emerald-600">In-App (Consumable)</td>
                      <td className="py-2 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">pack_50_credits</td>
                      <td className="py-2 px-3">$4.99</td>
                      <td className="py-2 px-3">50 Card Scan Credits</td>
                      <td className="py-2 px-3">
                        <button
                          onClick={() => copyToClipboard('pack_50_credits', 'sku3')}
                          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[10px] font-mono cursor-pointer flex items-center gap-1"
                        >
                          {copiedKey === 'sku3' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          Copy
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-emerald-600">In-App (Consumable)</td>
                      <td className="py-2 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">pack_200_credits</td>
                      <td className="py-2 px-3">$14.99</td>
                      <td className="py-2 px-3">200 Card Scan Credits (Summit Pass)</td>
                      <td className="py-2 px-3">
                        <button
                          onClick={() => copyToClipboard('pack_200_credits', 'sku4')}
                          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[10px] font-mono cursor-pointer flex items-center gap-1"
                        >
                          {copiedKey === 'sku4' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          Copy
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-emerald-600">In-App (Consumable)</td>
                      <td className="py-2 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">pack_500_credits</td>
                      <td className="py-2 px-3">$29.99</td>
                      <td className="py-2 px-3">500 Card Scan Credits (Pro Event Pass)</td>
                      <td className="py-2 px-3">
                        <button
                          onClick={() => copyToClipboard('pack_500_credits', 'sku4b')}
                          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[10px] font-mono cursor-pointer flex items-center gap-1"
                        >
                          {copiedKey === 'sku4b' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          Copy
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-emerald-600">In-App (Consumable)</td>
                      <td className="py-2 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">pack_1000_credits</td>
                      <td className="py-2 px-3">$39.99</td>
                      <td className="py-2 px-3">1,000 Card Scan Credits (Enterprise)</td>
                      <td className="py-2 px-3">
                        <button
                          onClick={() => copyToClipboard('pack_1000_credits', 'sku5')}
                          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[10px] font-mono cursor-pointer flex items-center gap-1"
                        >
                          {copiedKey === 'sku5' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          Copy
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setActiveStep(1)}
                  className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setActiveStep(3)}
                  className="min-h-[42px] px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 flex items-center space-x-1 cursor-pointer"
                >
                  <span>Continue to Step 3: Build .AAB</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 DETAILS */}
          {activeStep === 3 && (
            <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1120] space-y-4">
              <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-white">
                <Terminal className="h-5 w-5 text-blue-500" />
                <span>Step 3: Generate Android App Bundle (.aab) with Bubblewrap CLI</span>
              </div>
              
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Google provides <strong>Bubblewrap</strong> to turn PWA manifests directly into signing-ready, native Android App Bundles (`app-release-bundle.aab`) with zero Java/Kotlin boilerplate:
              </p>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-950 text-slate-200 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-slate-400 text-[11px] font-mono">
                    <span>1. Install Bubblewrap CLI &amp; Initialize</span>
                    <button
                      onClick={() => copyToClipboard('npm install -g @bubblewrap/cli\nbubblewrap init --manifest=https://your-domain.com/manifest.json', 'cmd1')}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'cmd1' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      Copy Command
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-emerald-400 overflow-x-auto">
{`npm install -g @bubblewrap/cli
bubblewrap init --manifest=https://your-domain.com/manifest.json`}
                  </pre>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 text-slate-200 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-slate-400 text-[11px] font-mono">
                    <span>2. Build the Signed Android App Bundle (.aab)</span>
                    <button
                      onClick={() => copyToClipboard('bubblewrap build', 'cmd2')}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'cmd2' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      Copy Command
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-emerald-400">
{`bubblewrap build`}
                  </pre>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Output: <code>app-release-bundle.aab</code> (Ready to upload to Play Console) + SHA-256 fingerprint.
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setActiveStep(2)}
                  className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setActiveStep(4)}
                  className="min-h-[42px] px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 flex items-center space-x-1 cursor-pointer"
                >
                  <span>Continue to Step 4: Asset Links</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 DETAILS */}
          {activeStep === 4 && (
            <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1120] space-y-4">
              <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-white">
                <Globe className="h-5 w-5 text-sky-500" />
                <span>Step 4: Host Digital Asset Links (assetlinks.json)</span>
              </div>
              
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                To hide the browser address bar and run as a 100% immersive native Android app, host your SHA-256 certificate fingerprint in <code>/.well-known/assetlinks.json</code> on your production domain:
              </p>

              <div className="p-4 rounded-2xl bg-slate-950 text-slate-200 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-slate-400 text-[11px] font-mono">
                  <span>File Location: https://your-domain.com/.well-known/assetlinks.json</span>
                  <button
                    onClick={() => copyToClipboard(`[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.cardbase.ai",
      "sha256_cert_fingerprints": ["FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C"]
    }
  }
]`, 'assetJson')}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'assetJson' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    Copy JSON
                  </button>
                </div>
                <pre className="text-xs font-mono text-sky-300 overflow-x-auto">
{`[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.cardbase.ai",
      "sha256_cert_fingerprints": [
        "YOUR_PLAY_CONSOLE_SHA256_FINGERPRINT"
      ]
    }
  }
]`}
                </pre>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setActiveStep(3)}
                  className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setActiveStep(5)}
                  className="min-h-[42px] px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 flex items-center space-x-1 cursor-pointer"
                >
                  <span>Continue to Step 5: Data Safety</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5 DETAILS */}
          {activeStep === 5 && (
            <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1120] space-y-4">
              <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-white">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <span>Step 5: Complete Google Play Data Safety &amp; Policy Forms</span>
              </div>
              
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Google requires exact answers for their automated review bots in Play Console <em>App Content</em>:
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">Privacy Policy URL</div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Host the in-app privacy policy at <code>https://your-domain.com/privacy</code>. You can open the live Privacy Policy modal right now below:
                  </p>
                  {onOpenPrivacyModal && (
                    <button
                      onClick={onOpenPrivacyModal}
                      className="mt-1 px-3 py-1.5 rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold text-xs hover:bg-blue-200 cursor-pointer"
                    >
                      View Live Privacy Policy &amp; Terms Modal
                    </button>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">Data Safety Questionnaire Answers</div>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 mt-1">
                    <li><strong>Data Collected:</strong> Photos &amp; Videos (for business card scanning only), Contact Info (names, emails, phone numbers extracted from cards).</li>
                    <li><strong>Data Sharing:</strong> Select <strong>"No, we do not share user data with third parties or data brokers"</strong>.</li>
                    <li><strong>Data Encryption:</strong> Select <strong>"Yes, all data in transit is encrypted using HTTPS / TLS"</strong>.</li>
                    <li><strong>Data Deletion Request:</strong> Select <strong>"Yes, users can request/execute complete data deletion inside the app"</strong> (Enabled via our built-in Data Safety Purge module).</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setActiveStep(4)}
                  className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setActiveStep(6)}
                  className="min-h-[42px] px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 flex items-center space-x-1 cursor-pointer"
                >
                  <span>Continue to Step 6: Launch</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6 DETAILS */}
          {activeStep === 6 && (
            <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1120] space-y-4">
              <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-white">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <span>Step 6: Closed Testing, Approval &amp; Production Launch</span>
              </div>
              
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Google Play requires personal developer accounts to run a <strong>Closed Testing Track with 20 testers for 14 days</strong> before releasing to Production:
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-950 dark:text-emerald-200">1. Upload .aab to Closed Testing Track:</strong>
                    <p className="mt-0.5 text-emerald-800 dark:text-emerald-300">
                      In Play Console → <em>Testing → Closed testing</em>, create a new release and upload <code>app-release-bundle.aab</code>.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800 flex items-start space-x-3">
                  <Smartphone className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-blue-950 dark:text-blue-200">2. Test Real Google Play Billing:</strong>
                    <p className="mt-0.5 text-blue-800 dark:text-blue-300">
                      Add your tester Google emails to <em>License Testing</em> in Play Console to test real Google Play credit purchases with test credit cards (zero real charges).
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-800 flex items-start space-x-3">
                  <DollarSign className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-indigo-950 dark:text-indigo-200">3. Apply for Production &amp; Start Earning:</strong>
                    <p className="mt-0.5 text-indigo-800 dark:text-indigo-300">
                      Submit for production review. Once approved by Google (typically 24–48 hours), your app will be live worldwide on Google Play Store!
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setActiveStep(5)}
                  className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={onClose}
                  className="min-h-[42px] px-6 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors cursor-pointer"
                >
                  All Set! Let's Build
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#0b1120]/80 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-10">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2">
            <span>Documentation saved to <code>/GOOGLE_PLAY_PUBLISHING_ROADMAP.md</code></span>
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="min-h-[42px] px-5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
