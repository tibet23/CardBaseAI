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
  Sparkles
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Minimal Brand */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                  CardBase
                </span>
                <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  10-in-1 OCR
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Multi-Card Scanner
              </p>
            </div>
          </div>

          {/* Minimal Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            
            {/* Primary Action: 10-in-1 Multi-Card Batch Scan */}
            <button
              id="btn-batch-scan"
              onClick={onOpenBatchScanner}
              className="inline-flex items-center justify-center min-h-[40px] px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-xs cursor-pointer"
              title="Scan up to 10 business cards from 1 photo"
            >
              <Layers className="h-4 w-4 mr-1.5 shrink-0" />
              <span>Scan 10 Cards</span>
            </button>

            {/* Single Card Camera Scan */}
            {handleSingleCamera && (
              <button
                id="btn-single-camera-scan"
                onClick={handleSingleCamera}
                className="hidden sm:inline-flex items-center justify-center min-h-[40px] px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700/80 active:scale-95 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                title="Scan a single card with camera"
              >
                <Camera className="h-4 w-4 mr-1.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Single</span>
              </button>
            )}

            {/* Add Manual Contact */}
            {onAddNewManualCard && (
              <button
                id="btn-manual-add"
                onClick={onAddNewManualCard}
                className="hidden md:inline-flex items-center justify-center min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                title="Add contact manually"
              >
                <Plus className="h-4 w-4 mr-1 text-slate-500" />
                <span>Add</span>
              </button>
            )}

            {/* CRM Sync Gateway Button */}
            {onOpenCrmSync && (
              <button
                id="btn-navbar-crm-sync"
                onClick={onOpenCrmSync}
                className="inline-flex items-center justify-center min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/50 hover:bg-violet-100 dark:hover:bg-violet-900/60 active:scale-95 transition-all border border-violet-200 dark:border-violet-800 cursor-pointer"
                title="Synchronize contacts with Apollo.io, HubSpot, Salesforce, or Google Contacts"
              >
                <Share2 className="h-4 w-4 sm:mr-1.5 text-violet-600 dark:text-violet-400" />
                <span className="hidden sm:inline font-semibold">CRM Sync</span>
              </button>
            )}

            {/* Clean Export Dropdown */}
            <div className="relative">
              <button
                id="btn-navbar-export-menu"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center justify-center min-h-[40px] px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                title="Export contacts"
              >
                <Download className="h-4 w-4 sm:mr-1.5 text-slate-500" />
                <span className="hidden sm:inline">Export</span>
              </button>

              {showExportMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                      Export {targetCards.length} {targetCards.length === 1 ? 'Contact' : 'Contacts'}
                    </div>

                    <button
                      id="export-csv-option"
                      onClick={() => {
                        if (onExportCSV) onExportCSV();
                        else exportToCSV(targetCards);
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 cursor-pointer"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                      <span>Export as CSV</span>
                    </button>

                    <button
                      id="export-vcf-option"
                      onClick={() => {
                        if (onExportVCF) onExportVCF();
                        else exportToVCF(targetCards);
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 cursor-pointer"
                    >
                      <Contact className="h-4 w-4 text-blue-600" />
                      <span>Export as vCard (.vcf)</span>
                    </button>

                    <button
                      id="export-print-option"
                      onClick={() => {
                        if (onPrint) onPrint();
                        else printContactSheet(targetCards);
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 cursor-pointer"
                    >
                      <Printer className="h-4 w-4 text-slate-500" />
                      <span>Print Contact Sheet</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Pricing Feature Button (Between Export and Dark Mode) */}
            {onOpenPricing && (
              <button
                id="btn-navbar-pricing"
                onClick={onOpenPricing}
                className="inline-flex items-center justify-center min-h-[40px] px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 active:scale-95 transition-all border border-amber-200/80 dark:border-amber-800/60 cursor-pointer shadow-2xs"
                title="View Pricing Plans & Event Passes"
              >
                <Sparkles className="h-4 w-4 sm:mr-1.5 text-amber-500 fill-amber-500/20 shrink-0" />
                <span className="font-semibold">Pricing</span>
                {billing?.isSubscribed && (
                  <span className="hidden md:inline-flex ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 leading-none">
                    PRO
                  </span>
                )}
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              id="btn-toggle-dark-mode"
              onClick={onToggleDarkMode}
              className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 active:scale-95 transition-all cursor-pointer"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600" />
              )}
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
