import React, { useState } from 'react';
import {
  Layers,
  Camera,
  Moon,
  Sun,
  Plus,
  Download,
  FileSpreadsheet,
  Contact,
  Printer,
  Share2,
  Sparkles,
  X
} from 'lucide-react';
import { ContactCard, UserBillingState } from '../types';
import { exportToCSV, exportToVCF, printContactSheet } from '../utils/exportUtils';

interface NavbarProps {
  cards?: ContactCard[];
  cardCount?: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenBatchScanner: () => void;
  onOpenSingleScanner?: () => void;
  onOpenCameraScanner?: () => void;
  onAddNewManualCard?: () => void;
  onOpenCrmSync?: () => void;
  onOpenPricing?: () => void;
  billing?: UserBillingState;
  selectedCards?: ContactCard[];
  onExportCSV?: () => void;
  onExportVCF?: () => void;
  onPrint?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cards = [],
  darkMode,
  onToggleDarkMode,
  onOpenBatchScanner,
  onOpenSingleScanner,
  onOpenCameraScanner,
  onAddNewManualCard,
  onOpenCrmSync,
  onOpenPricing,
  billing,
  selectedCards = [],
  onExportCSV,
  onExportVCF,
  onPrint,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const targetCards = selectedCards && selectedCards.length > 0 ? selectedCards : cards;
  const handleSingleCamera = onOpenSingleScanner || onOpenCameraScanner;

  return (
    <header className="sticky top-0 z-40 border-b backdrop-blur-md transition-colors bg-white/95 dark:bg-[#090d16]/95 border-slate-200 dark:border-slate-800/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
                  CardBase
                </span>
                <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  10-in-1 OCR
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 hidden min-[360px]:block">
                Multi-Card Scanner
              </p>
            </div>
          </div>

          {/* Desktop Controls (Tablet & Desktop: all features in one bar) */}
          <div className="hidden sm:flex items-center space-x-2 shrink-0">
            
            {/* 1. Scan 10 Cards */}
            <button
              id="btn-batch-scan"
              onClick={onOpenBatchScanner}
              className="inline-flex items-center justify-center min-h-[40px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-xs cursor-pointer"
              title="Scan up to 10 business cards from 1 photo"
            >
              <Layers className="h-4 w-4 mr-1.5 shrink-0" />
              <span>Scan 10 Cards</span>
            </button>

            {/* 2. Single */}
            {handleSingleCamera && (
              <button
                id="btn-single-camera-scan"
                onClick={handleSingleCamera}
                className="inline-flex items-center justify-center min-h-[40px] px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700/80 active:scale-95 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                title="Scan a single card with camera"
              >
                <Camera className="h-4 w-4 mr-1.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Single</span>
              </button>
            )}

            {/* 3. +Add */}
            {onAddNewManualCard && (
              <button
                id="btn-manual-add"
                onClick={onAddNewManualCard}
                className="inline-flex items-center justify-center min-h-[40px] px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                title="Add contact manually"
              >
                <Plus className="h-4 w-4 mr-1 text-slate-500" />
                <span>+Add</span>
              </button>
            )}

            {/* 4. CRM Sync */}
            {onOpenCrmSync && (
              <button
                id="btn-navbar-crm-sync"
                onClick={onOpenCrmSync}
                className="inline-flex items-center justify-center min-h-[40px] px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/50 hover:bg-violet-100 dark:hover:bg-violet-900/60 active:scale-95 transition-all border border-violet-200 dark:border-violet-800 cursor-pointer"
                title="Synchronize contacts with CRM"
              >
                <Share2 className="h-4 w-4 mr-1.5 text-violet-600 dark:text-violet-400 shrink-0" />
                <span className="font-semibold">CRM Sync</span>
              </button>
            )}

            {/* 5. Export Dropdown Trigger */}
            <div className="relative">
              <button
                id="btn-navbar-export-menu"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center justify-center min-h-[40px] px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                title="Export contacts"
              >
                <Download className="h-4 w-4 mr-1.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Export</span>
              </button>
            </div>

            {/* 6. Pricing */}
            {onOpenPricing && (
              <button
                id="btn-navbar-pricing"
                onClick={onOpenPricing}
                className="inline-flex items-center justify-center min-h-[40px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 active:scale-95 transition-all border border-amber-200/80 dark:border-amber-800/60 cursor-pointer shadow-2xs"
                title="View Pricing Plans & Event Passes"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-amber-500 fill-amber-500/20 shrink-0" />
                <span>
                  {billing?.isSubscribed || billing?.plan === 'pro' ? 'Pro Plan' : 'Pricing'}
                </span>
              </button>
            )}

            {/* 7. dark/light mode */}
            <button
              id="btn-toggle-dark-mode"
              onClick={onToggleDarkMode}
              className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 active:scale-95 transition-all cursor-pointer"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark/light mode"
            >
              {darkMode ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600" />
              )}
            </button>
          </div>

          {/* Mobile Top Row Controls: Pricing & dark/light mode */}
          <div className="flex sm:hidden items-center space-x-2 shrink-0">
            {/* 6. Pricing (Visible on Mobile) */}
            {onOpenPricing && (
              <button
                id="btn-mobile-pricing"
                onClick={onOpenPricing}
                className="inline-flex items-center justify-center min-h-[36px] px-2.5 py-1.5 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 active:scale-95 transition-all border border-amber-200/80 dark:border-amber-800/60 cursor-pointer shadow-2xs"
                title="View Pricing Plans"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-500 fill-amber-500/20 shrink-0" />
                <span>{billing?.isSubscribed || billing?.plan === 'pro' ? 'Pro' : 'Pricing'}</span>
              </button>
            )}

            {/* 7. dark/light mode (Visible on Mobile) */}
            <button
              id="btn-mobile-toggle-dark-mode"
              onClick={onToggleDarkMode}
              className="inline-flex items-center justify-center min-h-[36px] min-w-[36px] p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 active:scale-95 transition-all cursor-pointer"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark/light mode"
            >
              {darkMode ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600" />
              )}
            </button>
          </div>

        </div>

        {/* Mobile Action Bar: All 5 Primary Action Buttons Visibly Displayed on Mobile View */}
        <div className="sm:hidden px-0.5 pb-2.5 pt-1 border-t border-slate-100 dark:border-slate-800/70">
          <div className="grid grid-cols-5 gap-1.5">
            
            {/* 1. Scan 10 Cards */}
            <button
              id="btn-mobile-batch-scan"
              onClick={onOpenBatchScanner}
              className="min-h-[46px] rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex flex-col items-center justify-center p-1 active:scale-95 transition-all shadow-xs cursor-pointer"
              title="Scan up to 10 cards from 1 photo"
            >
              <Layers className="h-4 w-4 shrink-0" />
              <span className="text-[10px] font-bold leading-tight mt-0.5 text-center truncate w-full">
                Scan 10
              </span>
            </button>

            {/* 2. Single */}
            <button
              id="btn-mobile-single-scan"
              onClick={handleSingleCamera}
              className="min-h-[46px] rounded-xl font-semibold bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-1 active:scale-95 transition-all cursor-pointer"
              title="Scan single card camera"
            >
              <Camera className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="text-[10px] leading-tight mt-0.5 text-center truncate w-full">
                Single
              </span>
            </button>

            {/* 3. +Add */}
            <button
              id="btn-mobile-manual-add"
              onClick={onAddNewManualCard}
              className="min-h-[46px] rounded-xl font-semibold bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-1 active:scale-95 transition-all cursor-pointer"
              title="Add contact manually"
            >
              <Plus className="h-4 w-4 text-slate-600 dark:text-slate-300 shrink-0" />
              <span className="text-[10px] leading-tight mt-0.5 text-center truncate w-full">
                +Add
              </span>
            </button>

            {/* 4. CRM Sync */}
            <button
              id="btn-mobile-crm-sync"
              onClick={onOpenCrmSync}
              className="min-h-[46px] rounded-xl font-semibold bg-violet-50 dark:bg-violet-950/50 hover:bg-violet-100 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 flex flex-col items-center justify-center p-1 active:scale-95 transition-all cursor-pointer"
              title="Synchronize contacts with CRM"
            >
              <Share2 className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0" />
              <span className="text-[10px] leading-tight mt-0.5 text-center truncate w-full">
                CRM Sync
              </span>
            </button>

            {/* 5. Export */}
            <button
              id="btn-mobile-export"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="min-h-[46px] rounded-xl font-semibold bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-1 active:scale-95 transition-all cursor-pointer"
              title="Export contacts"
            >
              <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-[10px] leading-tight mt-0.5 text-center truncate w-full">
                Export
              </span>
            </button>

          </div>
        </div>

      </div>

      {/* Shared Export Popover / Bottom Sheet (Desktop Dropdown + Mobile Sheet) */}
      {showExportMenu && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none"
            onClick={() => setShowExportMenu(false)}
          />
          <div className="fixed sm:absolute bottom-4 sm:bottom-auto sm:top-full inset-x-4 sm:inset-x-auto sm:right-6 md:right-8 sm:w-64 rounded-2xl shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in sm:zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Export {targetCards.length} {targetCards.length === 1 ? 'Contact' : 'Contacts'}
              </div>
              <button
                onClick={() => setShowExportMenu(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1 pt-1.5">
              <button
                id="export-vcf-option"
                onClick={() => {
                  if (onExportVCF) onExportVCF();
                  else exportToVCF(targetCards);
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2.5 text-xs font-medium rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2.5 cursor-pointer active:scale-98 transition-all"
              >
                <Contact className="h-4 w-4 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-white">vCard (.vcf)</div>
                  <div className="text-[10px] text-slate-400">Import to Apple / Android Contacts</div>
                </div>
              </button>

              <button
                id="export-csv-option"
                onClick={() => {
                  if (onExportCSV) onExportCSV();
                  else exportToCSV(targetCards);
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2.5 text-xs font-medium rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2.5 cursor-pointer active:scale-98 transition-all"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-white">Spreadsheet (.csv)</div>
                  <div className="text-[10px] text-slate-400">Excel, Google Sheets, CRM tables</div>
                </div>
              </button>

              <button
                id="export-print-option"
                onClick={() => {
                  if (onPrint) onPrint();
                  else printContactSheet(targetCards);
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2.5 text-xs font-medium rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2.5 cursor-pointer active:scale-98 transition-all"
              >
                <Printer className="h-4 w-4 text-slate-500 shrink-0" />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-white">Print Contact Sheet</div>
                  <div className="text-[10px] text-slate-400">Print or save as high-res PDF</div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

