import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  Globe,
  MapPin,
  QrCode,
  Share2,
  Download,
  Star,
  Trash2,
  Edit3,
  Check,
  RotateCw,
  Tag,
  ExternalLink,
  ShieldCheck,
  Building,
  Briefcase
} from 'lucide-react';
import { ContactCard, CRMProvider, CategoryConfig } from '../types';
import { exportToVCF, exportToCSV } from '../utils/exportUtils';
import { ContactEmailHistory } from './ContactEmailHistory';
import { CompanyBrandFrame } from './CompanyBrandFrame';
import { getBrandInfo } from '../utils/brandUtils';

interface CardDetailModalProps {
  card: ContactCard | null;
  categoriesList?: CategoryConfig[];
  onOpenCategoryManager?: () => void;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCard: (card: ContactCard) => void;
  onDeleteCard: (cardId: string) => void;
  onOpenQrCode: (card: ContactCard) => void;
  onPushToCrm: (card: ContactCard, provider: CRMProvider) => void;
  privacyMode: boolean;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  categoriesList = [],
  onOpenCategoryManager,
  isOpen,
  onClose,
  onUpdateCard,
  onDeleteCard,
  onOpenQrCode,
  onPushToCrm,
  privacyMode,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showBackSide, setShowBackSide] = useState(false);
  const [visualMode, setVisualMode] = useState<'brand' | 'scan'>('brand');
  const [formData, setFormData] = useState<ContactCard | null>(null);
  const [newTagInput, setNewTagInput] = useState('');

  React.useEffect(() => {
    if (card) {
      setFormData({ ...card });
      setIsEditing(false);
      setShowBackSide(false);
      setVisualMode('brand');
    }
  }, [card]);

  if (!isOpen || !card || !formData) return null;

  const handleSave = () => {
    onUpdateCard({
      ...formData,
      updatedAt: new Date().toISOString(),
    });
    setIsEditing(false);
  };

  const handleToggleFavorite = () => {
    const updated = { ...card, isFavorite: !card.isFavorite };
    onUpdateCard(updated);
    setFormData(updated);
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !formData.tags.includes(newTagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTagInput.trim()],
      });
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tagToRemove),
    });
  };

  const maskInfo = (text?: string) => {
    if (!text) return '';
    if (!privacyMode) return text;
    if (text.includes('@')) {
      const parts = text.split('@');
      return `${parts[0].slice(0, 2)}***@${parts[1]}`;
    }
    return `${text.slice(0, 4)} **** ${text.slice(-2)}`;
  };

  const sanitizeExternalUrl = (url?: string): string | undefined => {
    if (!url) return undefined;
    const trimmed = url.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    // Disallow dangerous URI schemes like javascript:, data:, vbscript:
    if (/^[a-z0-9+.-]+:/i.test(trimmed)) return undefined;
    return `https://${trimmed}`;
  };

  const safeWebsiteUrl = sanitizeExternalUrl(formData.website);
  const safeLinkedinUrl = sanitizeExternalUrl(formData.social?.linkedin);
  const safeTwitterUrl = sanitizeExternalUrl(formData.social?.twitter);

  const fullAddress = [
    formData.address?.street,
    formData.address?.city,
    formData.address?.state,
    formData.address?.zip,
    formData.address?.country,
  ]
    .filter(Boolean)
    .join(', ');

  const googleMapsUrl = fullAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[94vh] sm:max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Mobile Top Swipe Handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2 sm:hidden shrink-0" />

        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 pr-2">
            <button
              onClick={handleToggleFavorite}
              className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl transition-colors cursor-pointer shrink-0 ${
                formData.isFavorite
                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title={formData.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`h-5 w-5 ${formData.isFavorite ? 'fill-current' : ''}`} />
            </button>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center truncate">
                <span className="truncate">{formData.fullName}</span>
                {formData.isOfflineScanned && (
                  <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 shrink-0">
                    Offline
                  </span>
                )}
              </h2>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate">
                {formData.jobTitle || 'Executive'} • {formData.company}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Edit Details</span>
                <span className="sm:hidden">Edit</span>
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="inline-flex items-center min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                <span>Save</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 1-Tap Mobile Quick Action Bar (Call, Email, Contacts VCF, QR) */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-100/60 dark:bg-[#070b14]/80 border-b border-slate-200 dark:border-slate-800/80">
          <div className="grid grid-cols-4 gap-2">
            {formData.phone ? (
              <a
                href={`tel:${formData.phone}`}
                className="min-h-[44px] flex flex-col items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 active:scale-95 transition-all text-center"
              >
                <Phone className="h-4 w-4" />
                <span className="text-[10px] font-bold mt-0.5">Call</span>
              </a>
            ) : (
              <div className="min-h-[44px] flex flex-col items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/40 text-slate-400 opacity-50 text-center">
                <Phone className="h-4 w-4" />
                <span className="text-[10px] font-medium mt-0.5">No Phone</span>
              </div>
            )}

            {formData.email ? (
              <a
                href={`mailto:${formData.email}`}
                className="min-h-[44px] flex flex-col items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 active:scale-95 transition-all text-center"
              >
                <Mail className="h-4 w-4" />
                <span className="text-[10px] font-bold mt-0.5">Email</span>
              </a>
            ) : (
              <div className="min-h-[44px] flex flex-col items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/40 text-slate-400 opacity-50 text-center">
                <Mail className="h-4 w-4" />
                <span className="text-[10px] font-medium mt-0.5">No Email</span>
              </div>
            )}

            <button
              onClick={() => exportToVCF([formData])}
              className="min-h-[44px] flex flex-col items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 active:scale-95 transition-all text-center cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span className="text-[10px] font-bold mt-0.5">Add Contact</span>
            </button>

            <button
              onClick={() => onOpenQrCode(formData)}
              className="min-h-[44px] flex flex-col items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 active:scale-95 transition-all text-center cursor-pointer"
            >
              <QrCode className="h-4 w-4" />
              <span className="text-[10px] font-bold mt-0.5">Share QR</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left Column: Reimagined Minimalist Brand Identity & Logo Showcase */}
            <div className="md:col-span-5 space-y-4">
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {visualMode === 'brand' ? 'Brand Identity & Palette' : `Raw Scan (${showBackSide ? 'Back' : 'Front'})`}
                </span>
                
                {/* Visual View Switcher (Brand Emblem vs Raw Scan) */}
                <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px]">
                  <button
                    onClick={() => setVisualMode('brand')}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                      visualMode === 'brand'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Brand Emblem
                  </button>
                  <button
                    onClick={() => setVisualMode('scan')}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                      visualMode === 'scan'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Raw Scan
                  </button>
                </div>
              </div>

              {/* Minimalist Brand Frame Box */}
              {visualMode === 'brand' ? (
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                  <CompanyBrandFrame
                    card={formData}
                    categoryColor={
                      categoriesList?.find(
                        (c) => c.name.toLowerCase() === (formData.category || '').toLowerCase()
                      )?.color
                    }
                    size="lg"
                  />
                  {/* Brand Color Swatch Summary Strip */}
                  {(() => {
                    const brand = getBrandInfo(
                      formData,
                      categoriesList?.find(
                        (c) => c.name.toLowerCase() === (formData.category || '').toLowerCase()
                      )?.color
                    );
                    return (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/20 shrink-0"
                            style={{ backgroundColor: brand.primaryColor }}
                          />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Primary Corporate Color:
                          </span>
                        </div>
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px] px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                          {brand.primaryColor.toUpperCase()}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                /* Raw Physical Card Visual Box */
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 aspect-[1.75/1] shadow-lg flex items-center justify-center group">
                  <img
                    src={showBackSide && formData.cardBackImage ? formData.cardBackImage : formData.cardImage}
                    alt={formData.fullName}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                  />

                  {formData.cardBackImage && (
                    <button
                      onClick={() => setShowBackSide(!showBackSide)}
                      className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 text-white text-[11px] font-semibold backdrop-blur-sm hover:bg-black/90 transition-colors"
                    >
                      Show {showBackSide ? 'Front' : 'Back'}
                    </button>
                  )}
                </div>
              )}

              {/* Quick Communication Actions Bar */}
              <div className="grid grid-cols-4 gap-2">
                {formData.phone ? (
                  <a
                    href={`tel:${formData.phone}`}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 text-slate-700 dark:text-slate-200 flex flex-col items-center justify-center text-center transition-all group"
                  >
                    <Phone className="h-4 w-4 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">Call</span>
                  </a>
                ) : (
                  <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-800/20 text-slate-300 flex flex-col items-center justify-center text-center">
                    <Phone className="h-4 w-4 mb-1" />
                    <span className="text-[10px]">No Phone</span>
                  </div>
                )}

                {formData.email ? (
                  <a
                    href={`mailto:${formData.email}`}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 text-slate-700 dark:text-slate-200 flex flex-col items-center justify-center text-center transition-all group"
                  >
                    <Mail className="h-4 w-4 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">Email</span>
                  </a>
                ) : (
                  <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-800/20 text-slate-300 flex flex-col items-center justify-center text-center">
                    <Mail className="h-4 w-4 mb-1" />
                    <span className="text-[10px]">No Email</span>
                  </div>
                )}

                {googleMapsUrl ? (
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 text-slate-700 dark:text-slate-200 flex flex-col items-center justify-center text-center transition-all group"
                  >
                    <MapPin className="h-4 w-4 text-rose-600 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">Map</span>
                  </a>
                ) : (
                  <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-800/20 text-slate-300 flex flex-col items-center justify-center text-center">
                    <MapPin className="h-4 w-4 mb-1" />
                    <span className="text-[10px]">No Address</span>
                  </div>
                )}

                <button
                  onClick={() => onOpenQrCode(formData)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:border-purple-300 text-slate-700 dark:text-slate-200 flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
                >
                  <QrCode className="h-4 w-4 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold">QR Share</span>
                </button>
              </div>

              {/* CRM Synchronization Status Card */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center">
                    <Share2 className="h-3.5 w-3.5 mr-1.5 text-violet-500" />
                    CRM Sync Pipeline
                  </span>
                  <span className="text-[10px] text-slate-400">Apollo / HubSpot / Salesforce / Google</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Apollo.io CRM */}
                  <button
                    id="crm-sync-apollo-btn"
                    onClick={() => onPushToCrm(formData, 'Apollo')}
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-between border cursor-pointer transition-all ${
                      formData.crmSyncStatus?.Apollo?.synced
                        ? 'bg-violet-50 text-violet-800 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-violet-400'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                      Apollo.io
                    </span>
                    {formData.crmSyncStatus?.Apollo?.synced ? (
                      <span className="text-[10px] text-violet-600 font-bold">✓ Synced</span>
                    ) : (
                      <span className="text-[10px] text-violet-600 font-medium">Sync ➔</span>
                    )}
                  </button>

                  {/* HubSpot */}
                  <button
                    id="crm-sync-hubspot-btn"
                    onClick={() => onPushToCrm(formData, 'HubSpot')}
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-between border cursor-pointer transition-all ${
                      formData.crmSyncStatus?.HubSpot?.synced
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-orange-400'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      HubSpot
                    </span>
                    {formData.crmSyncStatus?.HubSpot?.synced ? (
                      <span className="text-[10px] text-emerald-600 font-bold">✓ Synced</span>
                    ) : (
                      <span className="text-[10px] text-orange-600 font-medium">Sync ➔</span>
                    )}
                  </button>

                  {/* Salesforce */}
                  <button
                    id="crm-sync-salesforce-btn"
                    onClick={() => onPushToCrm(formData, 'Salesforce')}
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-between border cursor-pointer transition-all ${
                      formData.crmSyncStatus?.Salesforce?.synced
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-400'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                      Salesforce
                    </span>
                    {formData.crmSyncStatus?.Salesforce?.synced ? (
                      <span className="text-[10px] text-emerald-600 font-bold">✓ Synced</span>
                    ) : (
                      <span className="text-[10px] text-sky-600 font-medium">Sync ➔</span>
                    )}
                  </button>

                  {/* Google Contacts */}
                  <button
                    id="crm-sync-google-btn"
                    onClick={() => onPushToCrm(formData, 'GoogleContacts')}
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-between border cursor-pointer transition-all ${
                      formData.crmSyncStatus?.GoogleContacts?.synced
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Google Contacts
                    </span>
                    {formData.crmSyncStatus?.GoogleContacts?.synced ? (
                      <span className="text-[10px] text-emerald-600 font-bold">✓ Synced</span>
                    ) : (
                      <span className="text-[10px] text-blue-600 font-medium">Sync ➔</span>
                    )}
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Contact Details (Read/Edit) */}
            <div className="md:col-span-7 space-y-4">
              
              {!isEditing ? (
                /* Read View */
                <div className="space-y-4 text-sm">
                  
                  {/* Category & Confidence Badge */}
                  <div className="flex items-center justify-between">
                    {(() => {
                      const matchedCat = categoriesList.find(
                        (c) => c.name.toLowerCase() === (formData.category || '').toLowerCase()
                      );
                      const catColor = matchedCat?.color || '#2563eb';
                      return (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: catColor }}
                          />
                          {formData.category || 'General'}
                        </span>
                      );
                    })()}
                    <span className="text-xs font-semibold text-slate-500">
                      OCR Confidence: <strong className="text-emerald-600">{formData.confidenceScore}%</strong>
                    </span>
                  </div>

                  {/* Core Attributes */}
                  <div className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30">
                    
                    {formData.email && (
                      <div className="flex items-start space-x-3">
                        <Mail className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-[11px] text-slate-400">Email Address</div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {maskInfo(formData.email)}
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.phone && (
                      <div className="flex items-start space-x-3">
                        <Phone className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-[11px] text-slate-400">Primary Phone</div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {maskInfo(formData.phone)}
                          </div>
                        </div>
                      </div>
                    )}

                    {safeWebsiteUrl && (
                      <div className="flex items-start space-x-3">
                        <Globe className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-[11px] text-slate-400">Website</div>
                          <a
                            href={safeWebsiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                          >
                            {formData.website} <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      </div>
                    )}

                    {fullAddress && (
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-[11px] text-slate-400">Physical Address</div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {fullAddress}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Social Handles */}
                  {(safeLinkedinUrl || safeTwitterUrl) && (
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 flex items-center space-x-4 text-xs font-semibold">
                      {safeLinkedinUrl && (
                        <a
                          href={safeLinkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          LinkedIn Profile ➔
                        </a>
                      )}
                      {safeTwitterUrl && (
                        <a
                          href={safeTwitterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-600 dark:text-sky-400 hover:underline"
                        >
                          Twitter / X ➔
                        </a>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Tags &amp; Labels
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  {formData.notes && (
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Meeting &amp; Card Notes
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                        {formData.notes}
                      </div>
                    </div>
                  )}

                  {/* Gmail & Communication History Integration */}
                  <div className="pt-2">
                    <ContactEmailHistory card={formData} privacyMode={privacyMode} />
                  </div>
                </div>
              ) : (
                /* Edit Form */
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Website
                      </label>
                      <input
                        type="url"
                        value={formData.website || ''}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                          Category / Industry
                        </label>
                        {onOpenCategoryManager && (
                          <button
                            type="button"
                            onClick={onOpenCategoryManager}
                            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            + Customize
                          </button>
                        )}
                      </div>
                      <div className="mt-1 flex gap-2">
                        <select
                          value={
                            categoriesList.some((c) => c.name === formData.category)
                              ? formData.category
                              : 'custom'
                          }
                          onChange={(e) => {
                            if (e.target.value !== 'custom') {
                              setFormData({ ...formData, category: e.target.value });
                            }
                          }}
                          className="w-1/2 px-2.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="custom">-- Custom Name --</option>
                          {categoriesList.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={formData.category || ''}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          placeholder="Or type custom category..."
                          className="w-1/2 px-2.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Fields */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-3">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={formData.address?.street || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, street: e.target.value },
                          })
                        }
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300">City</label>
                      <input
                        type="text"
                        value={formData.address?.city || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, city: e.target.value },
                          })
                        }
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300">State / Zip</label>
                      <input
                        type="text"
                        value={formData.address?.state || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, state: e.target.value },
                          })
                        }
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Country</label>
                      <input
                        type="text"
                        value={formData.address?.country || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, country: e.target.value },
                          })
                        }
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Tags Editor */}
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Manage Tags
                    </label>
                    <div className="flex flex-wrap gap-1.5 mt-1 mb-2">
                      {formData.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded text-xs bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center"
                        >
                          {t}
                          <button
                            onClick={() => handleRemoveTag(t)}
                            className="ml-1 text-slate-400 hover:text-red-500"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        placeholder="Add new tag..."
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                      <button
                        onClick={handleAddTag}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Notes Editor */}
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Notes</label>
                    <textarea
                      rows={3}
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm(`Delete card for ${formData.fullName}?`)) {
                onDeleteCard(formData.id);
                onClose();
              }
            }}
            className="inline-flex items-center text-xs font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete Card
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => exportToVCF([formData])}
              className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 mr-1 text-blue-600" />
              Download vCard (.vcf)
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
