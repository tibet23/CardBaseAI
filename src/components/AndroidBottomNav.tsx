import React from 'react';
import { Layers, Users, Share2, Sparkles } from 'lucide-react';

export type AndroidTab = 'scanner' | 'leads' | 'integrations';

interface AndroidBottomNavProps {
  activeTab: AndroidTab;
  onTabChange: (tab: AndroidTab) => void;
  leadCount: number;
  onOpenPricing?: () => void;
  isPro?: boolean;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeTab,
  onTabChange,
  leadCount,
  onOpenPricing,
  isPro = false,
}) => {
  return (
    <nav
      id="android-native-bottom-nav"
      aria-label="Bottom Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#090d16]/95 dark:bg-[#070a12]/98 backdrop-blur-lg border-t border-slate-800 text-slate-400 pb-safe shadow-2xl"
    >
      <div className="grid grid-cols-4 h-16 max-w-md mx-auto items-center px-1">
        
        {/* Tab 1: Scanner */}
        <button
          id="nav-tab-scanner"
          onClick={() => onTabChange('scanner')}
          className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center py-1 transition-colors cursor-pointer relative ${
            activeTab === 'scanner'
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-selected={activeTab === 'scanner'}
          role="tab"
        >
          {activeTab === 'scanner' && (
            <span className="absolute top-1 w-8 h-1 bg-blue-500 rounded-full" />
          )}
          <div className="p-1 rounded-full flex items-center justify-center">
            <Layers className="h-5 w-5" />
          </div>
          <span className="text-[11px] leading-tight mt-0.5 tracking-tight font-medium">
            Scanner
          </span>
        </button>

        {/* Tab 2: Scanned Leads */}
        <button
          id="nav-tab-leads"
          onClick={() => onTabChange('leads')}
          className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center py-1 transition-colors cursor-pointer relative ${
            activeTab === 'leads'
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-selected={activeTab === 'leads'}
          role="tab"
        >
          {activeTab === 'leads' && (
            <span className="absolute top-1 w-8 h-1 bg-blue-500 rounded-full" />
          )}
          <div className="relative p-1 rounded-full flex items-center justify-center">
            <Users className="h-5 w-5" />
            {leadCount > 0 && (
              <span className="absolute -top-0.5 -right-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-600 text-white min-w-[16px] text-center border border-slate-900">
                {leadCount > 99 ? '99+' : leadCount}
              </span>
            )}
          </div>
          <span className="text-[11px] leading-tight mt-0.5 tracking-tight font-medium">
            Leads
          </span>
        </button>

        {/* Tab 3: Integrations (CRM) */}
        <button
          id="nav-tab-integrations"
          onClick={() => onTabChange('integrations')}
          className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center py-1 transition-colors cursor-pointer relative ${
            activeTab === 'integrations'
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-selected={activeTab === 'integrations'}
          role="tab"
        >
          {activeTab === 'integrations' && (
            <span className="absolute top-1 w-8 h-1 bg-blue-500 rounded-full" />
          )}
          <div className="p-1 rounded-full flex items-center justify-center">
            <Share2 className="h-5 w-5" />
          </div>
          <span className="text-[11px] leading-tight mt-0.5 tracking-tight font-medium">
            Integrations
          </span>
        </button>

        {/* Tab 4: Plan / Pricing */}
        <button
          id="nav-tab-pricing"
          onClick={onOpenPricing}
          className="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center py-1 transition-colors cursor-pointer text-amber-400 hover:text-amber-300"
          role="button"
          aria-label="View Pricing & Plans"
        >
          <div className="p-1 rounded-full flex items-center justify-center">
            <Sparkles className="h-5 w-5 fill-amber-400/20" />
          </div>
          <span className="text-[11px] leading-tight mt-0.5 tracking-tight font-bold">
            {isPro ? 'Pro Active' : 'Upgrade'}
          </span>
        </button>

      </div>
    </nav>
  );
};
