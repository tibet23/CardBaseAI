import React, { useState } from 'react';
import {
  X,
  Cloud,
  Shield,
  Lock,
  Unlock,
  Download,
  Upload,
  Key,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Database,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { ContactCard } from '../types';
import { encryptData, decryptData, computeChecksum } from '../utils/encryption';
import { AppSettings, generateCryptographicVaultKey } from '../utils/storage';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: ContactCard[];
  onRestoreCards: (restoredCards: ContactCard[]) => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  cards,
  onRestoreCards,
  settings,
  onUpdateSettings,
}) => {
  const [password, setPassword] = useState('MySecureVault2026!');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [restoreJsonInput, setRestoreJsonInput] = useState('');
  const [activeTab, setActiveTab] = useState<'cloud' | 'local_file' | 'privacy'>('cloud');
  const [vaultKeyInput, setVaultKeyInput] = useState<string>(() => {
    return settings.cloudSyncKey && settings.cloudSyncKey !== 'cardsnap_vault_master'
      ? settings.cloudSyncKey
      : generateCryptographicVaultKey();
  });

  if (!isOpen) return null;

  const handleCreateCloudBackup = async () => {
    if (!password) {
      setErrorMessage('Please enter an encryption password.');
      return;
    }

    // SEC-01 Remediation: Enforce cryptographic UUIDv4 vault key, never fallback to shared static string
    const effectiveVaultKey = (vaultKeyInput.trim() && vaultKeyInput.trim() !== 'cardsnap_vault_master')
      ? vaultKeyInput.trim()
      : generateCryptographicVaultKey();

    if (effectiveVaultKey !== settings.cloudSyncKey) {
      onUpdateSettings({ ...settings, cloudSyncKey: effectiveVaultKey });
      setVaultKeyInput(effectiveVaultKey);
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage('Encrypting card database with AES-GCM 256-bit encryption...');

    try {
      const payloadString = JSON.stringify(cards);
      const encrypted = await encryptData(payloadString, password);
      const checksum = await computeChecksum(payloadString);

      // Compute SHA-256 verification hash bound to the backupKey and passphrase (SEC-01 remediation)
      const verificationHash = await computeChecksum(`v1_auth:${effectiveVaultKey}:${password}`);

      setStatusMessage('Uploading encrypted payload with cryptographic authorization hash...');

      const response = await fetch('/api/backup/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backupKey: effectiveVaultKey,
          verificationHash,
          encryptedPayload: encrypted,
          metadata: {
            cardCount: cards.length,
            createdAt: new Date().toISOString(),
            appVersion: '1.0.0',
            checksum,
          },
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Backup failed');

      onUpdateSettings({
        ...settings,
        cloudSyncKey: effectiveVaultKey,
        lastCloudBackup: data.timestamp,
      });

      setStatusMessage(`Encrypted cloud backup completed successfully! (${data.sizeBytes} bytes secured in vault ${effectiveVaultKey.slice(0, 14)}...)`);
    } catch (err: any) {
      console.error('Backup error:', err);
      setErrorMessage(err.message || 'Could not complete cloud backup.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreCloudBackup = async () => {
    if (!password) {
      setErrorMessage('Please provide your encryption password to decrypt cloud backup.');
      return;
    }

    const effectiveVaultKey = vaultKeyInput.trim() || settings.cloudSyncKey;
    if (!effectiveVaultKey || effectiveVaultKey === 'cardsnap_vault_master') {
      setErrorMessage('Please enter a valid unique Vault ID to restore from.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage('Retrieving encrypted vault from cloud backup server...');

    try {
      // Compute verification hash bound to the backupKey and passphrase
      const verificationHash = await computeChecksum(`v1_auth:${effectiveVaultKey}:${password}`);

      const response = await fetch('/api/backup/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backupKey: effectiveVaultKey,
          verificationHash,
        }),
      });

      const data = await response.json();
      if (!data.success || !data.backup?.data?.encryptedPayload) {
        throw new Error(data.error || 'No backup found');
      }

      setStatusMessage('Decrypting card records with your passphrase...');
      const decryptedString = await decryptData(
        data.backup.data.encryptedPayload,
        password
      );

      const parsedCards = JSON.parse(decryptedString);
      if (!Array.isArray(parsedCards)) {
        throw new Error('Corrupt backup format.');
      }

      onRestoreCards(parsedCards);
      setStatusMessage(`Restored ${parsedCards.length} business cards successfully!`);
    } catch (err: any) {
      console.error('Restore error:', err);
      setErrorMessage(err.message || 'Decryption failed. Check your password and Vault ID.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportEncryptedFile = async () => {
    if (!password) {
      setErrorMessage('Please enter an encryption password for the backup file.');
      return;
    }

    try {
      const payloadString = JSON.stringify(cards);
      const encrypted = await encryptData(payloadString, password);
      const checksum = await computeChecksum(payloadString);

      const backupPackage = {
        app: 'CardBase AI',
        encryptedPayload: encrypted,
        metadata: {
          cardCount: cards.length,
          createdAt: new Date().toISOString(),
          checksum,
        },
      };

      const blob = new Blob([JSON.stringify(backupPackage, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cardsnap_encrypted_backup_${cards.length}_cards_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setErrorMessage(err.message || 'Encryption failed');
    }
  };

  const handleRestoreFromFile = async () => {
    if (!restoreJsonInput.trim()) {
      setErrorMessage('Please paste your encrypted backup JSON content.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter the password used to encrypt this backup file.');
      return;
    }

    try {
      const parsedPackage = JSON.parse(restoreJsonInput);
      const ciphertext = parsedPackage.encryptedPayload || restoreJsonInput;
      const decrypted = await decryptData(ciphertext, password);
      const restored = JSON.parse(decrypted);

      if (Array.isArray(restored)) {
        onRestoreCards(restored);
        setStatusMessage(`Successfully restored ${restored.length} cards from backup file!`);
        setRestoreJsonInput('');
      } else {
        throw new Error('Invalid card data payload');
      }
    } catch (err: any) {
      setErrorMessage(`Restore failed: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-sky-600 text-white shadow-sm shadow-sky-500/20">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center">
                Secure Cloud Backup &amp; Privacy Vault
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                End-to-end AES-GCM encrypted backup ensuring full data privacy
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

        {/* Tab Selector */}
        <div className="flex px-6 border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('cloud')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'cloud'
                ? 'border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Cloud Backup Sync
          </button>
          <button
            onClick={() => setActiveTab('local_file')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'local_file'
                ? 'border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Encrypted File Export / Import
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Privacy Settings
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Master Password Bar */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-xs text-slate-900 dark:text-white flex items-center">
                <Lock className="h-3.5 w-3.5 mr-1.5 text-sky-600" />
                Vault Encryption Passphrase
              </label>
              <span className="text-[10px] text-slate-400">Client-Side PBKDF2 + AES-GCM</span>
            </div>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter master encryption passphrase..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs"
            />
            <p className="text-[10px] text-slate-500">
              Your contact data is encrypted in your browser with this password before any backup occurs.
            </p>
          </div>

          {/* Feedback messages */}
          {statusMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-800 dark:text-red-300 flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'cloud' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-sky-100 dark:border-sky-900/60 bg-sky-50/50 dark:bg-sky-950/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      Cloud Backup Vault Status
                    </div>
                    <div className="text-slate-500">
                      {settings.lastCloudBackup
                        ? `Last backed up: ${new Date(settings.lastCloudBackup).toLocaleString()}`
                        : 'No cloud backups created yet'}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-200 dark:bg-sky-900 text-sky-800 dark:text-sky-200">
                    {cards.length} Cards in Vault
                  </span>
                </div>

                {/* Cryptographic Vault Identifier Field (SEC-01 remediation) */}
                <div className="pt-2 pb-1 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                      <Key className="h-3 w-3 mr-1 text-sky-500" />
                      Cryptographic Vault ID (UUIDv4)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const newKey = generateCryptographicVaultKey();
                        setVaultKeyInput(newKey);
                        onUpdateSettings({ ...settings, cloudSyncKey: newKey });
                      }}
                      className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      Generate New ID
                    </button>
                  </div>
                  <input
                    type="text"
                    value={vaultKeyInput}
                    onChange={(e) => setVaultKeyInput(e.target.value)}
                    placeholder="vault_xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-[11px]"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Unique isolated tenant slot. Keep this ID and your passphrase to sync across multiple devices.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleCreateCloudBackup}
                    disabled={isProcessing}
                    className="py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-sky-600 hover:bg-sky-700 active:scale-98 transition-all flex items-center justify-center shadow-md shadow-sky-600/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessing ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Cloud className="h-4 w-4 mr-2" />
                    )}
                    Backup to Cloud Now
                  </button>

                  <button
                    onClick={handleRestoreCloudBackup}
                    disabled={isProcessing}
                    className="py-2.5 px-4 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center cursor-pointer"
                  >
                    <Download className="h-4 w-4 mr-2 text-sky-600" />
                    Restore from Cloud
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'local_file' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Export Encrypted Backup File (.json)
                </h4>
                <p className="text-slate-500">
                  Download an offline, password-locked snapshot containing all digitized card images and contact fields.
                </p>
                <button
                  onClick={handleExportEncryptedFile}
                  className="py-2 px-4 rounded-xl font-bold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 flex items-center cursor-pointer"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Encrypted File
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Restore from File
                </h4>
                <textarea
                  rows={3}
                  value={restoreJsonInput}
                  onChange={(e) => setRestoreJsonInput(e.target.value)}
                  placeholder="Paste contents of encrypted JSON backup file..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-[11px]"
                />
                <button
                  onClick={handleRestoreFromFile}
                  className="py-2 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center cursor-pointer"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Decrypt &amp; Restore Cards
                </button>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      Display Privacy Mode (Screen Masking)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Mask phone numbers and email addresses on the UI when working in public spaces or during presentations.
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      onUpdateSettings({
                        ...settings,
                        privacyMode: !settings.privacyMode,
                      })
                    }
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      settings.privacyMode
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {settings.privacyMode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      Auto-Cloud Encrypted Sync
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Sync encrypted snapshots after every batch scan operation.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoCloudBackup}
                    onChange={(e) =>
                      onUpdateSettings({
                        ...settings,
                        autoCloudBackup: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
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
            Close Vault
          </button>
        </div>

      </div>
    </div>
  );
};
