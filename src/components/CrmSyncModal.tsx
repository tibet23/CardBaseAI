import React, { useState } from 'react';
import {
  X,
  Share2,
  CheckCircle2,
  RefreshCw,
  Settings,
  Link,
  Unlink,
  Layers,
  ArrowRight,
  Database,
  ShieldCheck,
  Check,
  AlertCircle
} from 'lucide-react';
import { CRMConfig, CRMProvider, ContactCard } from '../types';

interface CrmSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  crmConfigs: CRMConfig[];
  onUpdateCrmConfigs: (configs: CRMConfig[]) => void;
  cards: ContactCard[];
  onCardsSynced: (updatedCards: ContactCard[], provider: CRMProvider) => void;
}

export const CrmSyncModal: React.FC<CrmSyncModalProps> = ({
  isOpen,
  onClose,
  crmConfigs,
  onUpdateCrmConfigs,
  cards,
  onCardsSynced,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<CRMProvider>('Apollo');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'integrations' | 'mapping'>('integrations');

  if (!isOpen) return null;

  const currentConfig = crmConfigs.find((c) => c.provider === selectedProvider) || crmConfigs[0];

  const handleToggleConnect = (provider: CRMProvider) => {
    const updated = crmConfigs.map((c) =>
      c.provider === provider
        ? {
            ...c,
            connected: !c.connected,
            lastSyncAt: !c.connected ? new Date().toISOString() : c.lastSyncAt,
          }
        : c
    );
    onUpdateCrmConfigs(updated);
  };

  const handleUpdateApiKey = (provider: CRMProvider, apiKey: string) => {
    const updated = crmConfigs.map((c) =>
      c.provider === provider ? { ...c, apiKey } : c
    );
    onUpdateCrmConfigs(updated);
  };

  const handleToggleAutoSync = (provider: CRMProvider) => {
    const updated = crmConfigs.map((c) =>
      c.provider === provider ? { ...c, autoSyncOnScan: !c.autoSyncOnScan } : c
    );
    onUpdateCrmConfigs(updated);
  };

  const handleRunFullSync = async (provider: CRMProvider) => {
    setIsSyncing(true);
    setSyncStatusMsg(`Preparing contacts for ${provider} API...`);

    const unsyncedCards = cards.filter(
      (c) => !c.crmSyncStatus?.[provider]?.synced
    );
    const targetList = unsyncedCards.length > 0 ? unsyncedCards : cards;

    try {
      setSyncStatusMsg(`Transmitting ${targetList.length} contacts to ${provider} API...`);
      
      const response = await fetch('/api/crm/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          contacts: targetList,
          apiKey: currentConfig.apiKey,
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Sync failed');

      // Update card states
      const updatedCards = cards.map((c) => {
        const found = targetList.find((t) => t.id === c.id);
        if (found) {
          return {
            ...c,
            crmSyncStatus: {
              ...(c.crmSyncStatus || {}),
              [provider]: {
                synced: true,
                syncedAt: new Date().toISOString(),
                remoteId: `${provider.toLowerCase()}_${Math.random().toString(36).substring(2, 8)}`,
                provider,
              },
            },
          };
        }
        return c;
      });

      onCardsSynced(updatedCards, provider);
      setSyncStatusMsg(`Successfully synchronized ${targetList.length} contacts!`);
    } catch (err: any) {
      console.error('CRM sync error:', err);
      setSyncStatusMsg(`Sync error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const getProviderIconColor = (p: CRMProvider) => {
    switch (p) {
      case 'Apollo': return 'text-violet-600 bg-violet-100 dark:bg-violet-950/60';
      case 'HubSpot': return 'text-orange-500 bg-orange-100 dark:bg-orange-950/60';
      case 'Salesforce': return 'text-sky-500 bg-sky-100 dark:bg-sky-950/60';
      case 'GoogleContacts': return 'text-blue-500 bg-blue-100 dark:bg-blue-950/60';
      default: return 'text-blue-500 bg-blue-100';
    }
  };

  const unsyncedForSelected = cards.filter(
    (c) => !c.crmSyncStatus?.[selectedProvider]?.synced
  ).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-violet-600 text-white shadow-sm shadow-violet-500/20">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center">
                CRM &amp; Contact Sync Hub
                <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                  Real-time Gateway
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Synchronize contacts directly with Apollo.io, HubSpot, Salesforce, and Google Contacts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex px-6 border-b border-slate-200 dark:border-slate-800 space-x-8 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('integrations')}
            className={`min-h-[48px] py-3 border-b-2 transition-colors cursor-pointer flex items-center ${
              activeTab === 'integrations'
                ? 'border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Connected CRMs
          </button>
          <button
            onClick={() => setActiveTab('mapping')}
            className={`min-h-[48px] py-3 border-b-2 transition-colors cursor-pointer flex items-center ${
              activeTab === 'mapping'
                ? 'border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Field Mapping
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {activeTab === 'integrations' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: List of CRM Providers */}
              <div className="md:col-span-5 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Select Platform
                </div>

                <div className="space-y-2">
                  {crmConfigs.map((cfg) => {
                    const isSelected = cfg.provider === selectedProvider;
                    const iconStyle = getProviderIconColor(cfg.provider);

                    return (
                      <div
                        key={cfg.provider}
                        onClick={() => setSelectedProvider(cfg.provider)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`h-9 w-9 rounded-lg flex items-center justify-center font-bold text-xs ${iconStyle}`}>
                            {cfg.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-white">
                              {cfg.name}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {cfg.connected ? 'Connected' : 'Not configured'}
                            </div>
                          </div>
                        </div>

                        {cfg.connected ? (
                          <span className="h-2 w-2 rounded-full bg-emerald-500" title="Connected" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Settings & Sync Action for Selected CRM */}
              <div className="md:col-span-7 space-y-5">
                
                {/* Active Platform Header */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {currentConfig.name} Integration
                      </h3>
                      <p className="text-xs text-slate-500">
                        {currentConfig.connected
                          ? 'Active connection ready for bidirectional data push'
                          : 'Connect your API token or OAuth credentials'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggleConnect(currentConfig.provider)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        currentConfig.connected
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 hover:bg-rose-100'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {currentConfig.connected ? 'Disconnect' : 'Connect CRM'}
                    </button>
                  </div>

                  {/* API Credentials Input */}
                  <div className="space-y-2 text-xs">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      API Access Token / Private App Token
                    </label>
                    <input
                      type="password"
                      value={currentConfig.apiKey || ''}
                      onChange={(e) => handleUpdateApiKey(currentConfig.provider, e.target.value)}
                      placeholder={`Enter your ${currentConfig.name} API Key...`}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-[11px]"
                    />
                  </div>

                  {/* Auto-Sync Toggle */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white">
                        Auto-sync on Card Scan
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Automatically push new business card scans to {currentConfig.name}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentConfig.autoSyncOnScan}
                      onChange={() => handleToggleAutoSync(currentConfig.provider)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Instant Sync Action Card */}
                <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Sync Card Library ({cards.length} Total Contacts)
                    </span>
                    <span className="px-2 py-0.5 rounded font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {unsyncedForSelected} Unsynced
                    </span>
                  </div>

                  {syncStatusMsg && (
                    <div className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                      {syncStatusMsg}
                    </div>
                  )}

                  <button
                    onClick={() => handleRunFullSync(currentConfig.provider)}
                    disabled={isSyncing || !currentConfig.connected}
                    className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 transition-all flex items-center justify-center shadow-md shadow-indigo-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Synchronizing Contacts...
                      </>
                    ) : (
                      <>
                        <Share2 className="h-4 w-4 mr-2" />
                        Push All {unsyncedForSelected > 0 ? unsyncedForSelected : cards.length} Contacts to {currentConfig.name}
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'mapping' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  CardBase AI ➔ {currentConfig.name} Field Schema Mapping
                </h4>
                <p className="text-slate-500 mb-4">
                  Match OCR detected contact fields to your CRM lead and contact properties.
                </p>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 pb-2 border-b font-bold text-slate-500">
                    <div>CardBase OCR Field</div>
                    <div>{currentConfig.name} Property</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 items-center">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Person Full Name</span>
                    <input
                      type="text"
                      defaultValue={currentConfig.fieldMapping.nameField}
                      className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 items-center">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Company Name</span>
                    <input
                      type="text"
                      defaultValue={currentConfig.fieldMapping.companyField}
                      className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 items-center">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Email Address</span>
                    <input
                      type="text"
                      defaultValue={currentConfig.fieldMapping.emailField}
                      className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 items-center">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Phone Number</span>
                    <input
                      type="text"
                      defaultValue={currentConfig.fieldMapping.phoneField}
                      className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 items-center">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Job Title</span>
                    <input
                      type="text"
                      defaultValue={currentConfig.fieldMapping.titleField}
                      className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
