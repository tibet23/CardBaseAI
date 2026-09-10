import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, CheckCircle2, ShieldAlert, RefreshCw, Database } from 'lucide-react';
import { ContactCard, UserBillingState } from '../types';

interface DataSafetyDeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: ContactCard[];
  onPurgeAllData: () => void;
}

export const DataSafetyDeletionModal: React.FC<DataSafetyDeletionModalProps> = ({
  isOpen,
  onClose,
  cards,
  onPurgeAllData,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleted, setIsDeleted] = useState(false);

  if (!isOpen) return null;

  const handleExecutePurge = () => {
    if (confirmText.trim().toUpperCase() === 'DELETE') {
      onPurgeAllData();
      setIsDeleted(true);
      setTimeout(() => {
        setIsDeleted(false);
        setConfirmText('');
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#090d16] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800/90 w-full max-w-lg overflow-hidden flex flex-col my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-red-100 dark:border-red-950/50 bg-red-50/50 dark:bg-red-950/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Data Safety &amp; Account Deletion
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Google Play Data Safety Mandate Compliant
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

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {isDeleted ? (
            <div className="p-6 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">All Data Purged Successfully</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All business cards, images, and cached credentials have been permanently deleted from this device.
              </p>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start space-x-3 text-xs text-amber-900 dark:text-amber-200">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Permanent Action:</strong>
                  <p className="mt-1">
                    This will permanently delete all <strong>{cards.length} saved business cards</strong>, high-resolution cropped photos, CRM sync histories, and vault encryption keys from your device.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <p>To confirm permanent data deletion, type <strong className="font-mono text-red-600 dark:text-red-400">DELETE</strong> below:</p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-red-500 outline-hidden"
                />
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        {!isDeleted && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#0b1120]/80 flex items-center justify-between">
            <button
              onClick={onClose}
              className="min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={confirmText.trim().toUpperCase() !== 'DELETE'}
              onClick={handleExecutePurge}
              className="min-h-[40px] px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <Trash2 className="h-4 w-4" />
              <span>Purge All Contact Data</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
