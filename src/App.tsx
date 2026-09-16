import React, { useState, useEffect } from 'react';
import { ContactCard, CategoryConfig, CRMConfig, CRMProvider, UserBillingState } from './types';
import {
  loadCardsFromStorage,
  saveCardsToStorage,
  loadSettings,
  saveSettings,
  loadCategoriesFromStorage,
  saveCategoriesToStorage,
  loadCrmConfigs,
  saveCrmConfigs,
  loadEncryptedCrmConfigs,
  resetCategoriesToDefault,
  loadBilling,
  AppSettings
} from './utils/storage';
import { exportToCSV, exportToVCF, printCards } from './utils/exportUtils';
import { generateSampleCardSvg } from './utils/sampleCards';
import { Navbar } from './components/Navbar';
import { BatchScanner } from './components/BatchScanner';
import { CameraScanner } from './components/CameraScanner';
import { CardGrid } from './components/CardGrid';
import { CardDetailModal } from './components/CardDetailModal';
import { QrCodeModal } from './components/QrCodeModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { CrmSyncModal } from './components/CrmSyncModal';
import { PricingModal } from './components/PricingModal';
import { AndroidBottomNav, AndroidTab } from './components/AndroidBottomNav';

export const App: React.FC = () => {
  // App State
  const [cards, setCards] = useState<ContactCard[]>(() => loadCardsFromStorage());
  const [categories, setCategories] = useState<CategoryConfig[]>(() => loadCategoriesFromStorage());
  const [crmConfigs, setCrmConfigs] = useState<CRMConfig[]>(() => loadCrmConfigs());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [billing, setBilling] = useState<UserBillingState>(() => loadBilling());
  const [androidTab, setAndroidTab] = useState<AndroidTab>('leads');

  // Modals
  const [isBatchScannerOpen, setIsBatchScannerOpen] = useState(false);
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isCrmSyncOpen, setIsCrmSyncOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [selectedCardForDetail, setSelectedCardForDetail] = useState<ContactCard | null>(null);
  const [selectedCardForQr, setSelectedCardForQr] = useState<ContactCard | null>(null);

  // Network Offline Status
  const [isSystemOffline, setIsSystemOffline] = useState(!navigator.onLine);

  // Sync state to LocalStorage
  useEffect(() => {
    saveCardsToStorage(cards);
  }, [cards]);

  useEffect(() => {
    saveCategoriesToStorage(categories);
  }, [categories]);

  useEffect(() => {
    saveCrmConfigs(crmConfigs);
  }, [crmConfigs]);

  // Decrypt CRM credentials on mount using local session/device PIN
  useEffect(() => {
    loadEncryptedCrmConfigs().then((decrypted) => {
      setCrmConfigs(decrypted);
    });
  }, []);

  useEffect(() => {
    saveSettings(settings);
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsSystemOffline(false);
    const handleOffline = () => setIsSystemOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Card Mutators
  const handleSaveBatchCards = (newCards: ContactCard[]) => {
    setCards((prev) => [...newCards, ...prev]);
  };

  const handleSaveSingleCard = (newCard: ContactCard) => {
    setCards((prev) => [newCard, ...prev]);
  };

  const handleAddNewManualCard = () => {
    const now = new Date().toISOString();
    const newCard: ContactCard = {
      id: 'manual_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      fullName: 'New Contact',
      jobTitle: '',
      company: '',
      email: '',
      phone: '',
      address: { full: '' },
      website: '',
      category: 'General',
      tags: ['Manual'],
      notes: '',
      social: {},
      cardImage: generateSampleCardSvg('New Contact', 'Title', 'Company', 'email@example.com', '+1 (555) 000-0000', 'example.com'),
      confidenceScore: 100,
      scannedAt: now,
      updatedAt: now,
      isFavorite: false,
      crmSyncStatus: {},
    };
    setSelectedCardForDetail(newCard);
  };

  const handleUpdateCard = (updatedCard: ContactCard) => {
    setCards((prev) => {
      const exists = prev.some((c) => c.id === updatedCard.id);
      if (exists) {
        return prev.map((c) => (c.id === updatedCard.id ? updatedCard : c));
      } else {
        return [updatedCard, ...prev];
      }
    });
    if (selectedCardForDetail?.id === updatedCard.id) {
      setSelectedCardForDetail(updatedCard);
    }
  };

  const handleDeleteCard = (cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    if (selectedCardForDetail?.id === cardId) {
      setSelectedCardForDetail(null);
    }
  };

  const handleBulkDelete = (cardIds: string[]) => {
    setCards((prev) => prev.filter((c) => !cardIds.includes(c.id)));
  };

  const handleToggleFavorite = (card: ContactCard) => {
    handleUpdateCard({ ...card, isFavorite: !card.isFavorite });
  };

  const handleUpdateCardCategory = (oldCategoryName: string, newCategoryName: string) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.category === oldCategoryName) {
          return { ...c, category: newCategoryName };
        }
        return c;
      })
    );
  };

  // CRM Sync Handlers
  const handlePushSingleCardToCrm = async (card: ContactCard, provider: CRMProvider) => {
    try {
      const isAlreadySynced = card.crmSyncStatus?.[provider]?.synced;
      const updatedCard: ContactCard = {
        ...card,
        crmSyncStatus: {
          ...card.crmSyncStatus,
          [provider]: {
            synced: !isAlreadySynced,
            syncedAt: !isAlreadySynced ? new Date().toISOString() : undefined,
            remoteId: !isAlreadySynced ? `${provider.toLowerCase()}_${Math.random().toString(36).substring(2, 8)}` : undefined,
            provider,
          },
        },
      };
      handleUpdateCard(updatedCard);
    } catch (err) {
      console.error(`Failed to push to ${provider}:`, err);
    }
  };

  const handleBulkCrmSync = (cardIds: string[], provider: CRMProvider = 'Apollo') => {
    setIsCrmSyncOpen(true);
  };

  const handleCardsSyncedFromModal = (updatedCards: ContactCard[], provider: CRMProvider) => {
    setCards(updatedCards);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070a12] text-slate-900 dark:text-slate-100 font-sans transition-colors">
      
      {/* Sleek Minimal Navigation Bar */}
      <Navbar
        cards={cards}
        cardCount={cards.length}
        onOpenBatchScanner={() => setIsBatchScannerOpen(true)}
        onOpenSingleScanner={() => setIsCameraScannerOpen(true)}
        onAddNewManualCard={handleAddNewManualCard}
        onOpenCrmSync={() => setIsCrmSyncOpen(true)}
        onOpenPricing={() => setIsPricingOpen(true)}
        billing={billing}
        darkMode={settings.darkMode}
        onToggleDarkMode={() =>
          setSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }))
        }
        onExportCSV={() => exportToCSV(cards)}
        onExportVCF={() => exportToVCF(cards)}
        onPrint={() => printCards(cards)}
      />

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-safe-nav md:pb-6">
        <CardGrid
          cards={cards}
          categoriesList={categories}
          onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
          onCardClick={(card) => setSelectedCardForDetail(card)}
          onToggleFavorite={handleToggleFavorite}
          onOpenQr={(card) => setSelectedCardForQr(card)}
          onPushToCrm={handlePushSingleCardToCrm}
          onBulkDelete={handleBulkDelete}
          onBulkCrmSync={handleBulkCrmSync}
          onOpenBatchScanner={() => setIsBatchScannerOpen(true)}
          onOpenCameraScanner={() => setIsCameraScannerOpen(true)}
          privacyMode={settings.privacyMode}
          isOffline={isSystemOffline}
        />
      </main>

      {/* Native Android Material Bottom Navigation Bar (Mobile) */}
      <AndroidBottomNav
        activeTab={androidTab}
        leadCount={cards.length}
        onTabChange={(tab) => {
          setAndroidTab(tab);
          if (tab === 'scanner') {
            setIsBatchScannerOpen(true);
          } else if (tab === 'integrations') {
            setIsCrmSyncOpen(true);
          }
        }}
        onOpenPricing={() => setIsPricingOpen(true)}
        isPro={billing.isSubscribed || billing.plan === 'pro'}
      />

      {/* 10-in-1 Multi-Card Batch Scanner Modal */}
      <BatchScanner
        isOpen={isBatchScannerOpen}
        onClose={() => setIsBatchScannerOpen(false)}
        onSaveBatchCards={handleSaveBatchCards}
        isOffline={isSystemOffline}
      />

      {/* Single Card Camera Scanner */}
      <CameraScanner
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onSaveCard={handleSaveSingleCard}
        isOffline={isSystemOffline}
      />

      {/* Card Detail & Editing Modal */}
      <CardDetailModal
        card={selectedCardForDetail}
        categoriesList={categories}
        onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
        isOpen={!!selectedCardForDetail}
        onClose={() => setSelectedCardForDetail(null)}
        onUpdateCard={handleUpdateCard}
        onDeleteCard={handleDeleteCard}
        onOpenQrCode={(card) => setSelectedCardForQr(card)}
        onPushToCrm={handlePushSingleCardToCrm}
        privacyMode={settings.privacyMode}
      />

      {/* Instant vCard Live QR Modal */}
      <QrCodeModal
        card={selectedCardForQr}
        isOpen={!!selectedCardForQr}
        onClose={() => setSelectedCardForQr(null)}
      />

      {/* Category Customization Modal */}
      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={categories}
        cards={cards}
        onSaveCategories={(updatedCats) => setCategories(updatedCats)}
        onUpdateCardCategory={handleUpdateCardCategory}
        onResetCategories={() => setCategories(resetCategoriesToDefault())}
      />

      {/* CRM Synchronization Gateway Modal */}
      <CrmSyncModal
        isOpen={isCrmSyncOpen}
        onClose={() => setIsCrmSyncOpen(false)}
        crmConfigs={crmConfigs}
        onUpdateCrmConfigs={(updated) => setCrmConfigs(updated)}
        cards={cards}
        onCardsSynced={handleCardsSyncedFromModal}
      />

      {/* Pricing & Event Passes Modal */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        billing={billing}
        onBillingUpdated={(updatedBilling) => setBilling(updatedBilling)}
      />

    </div>
  );
};

export default App;
