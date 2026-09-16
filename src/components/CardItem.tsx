import React from 'react';
import {
  Phone,
  Mail,
  Globe,
  Star,
  QrCode,
  Share2,
  Check,
  Building,
  MoreVertical,
  ExternalLink,
  MapPin
} from 'lucide-react';
import { ContactCard, CRMProvider } from '../types';
import { CompanyBrandFrame } from './CompanyBrandFrame';

interface CardItemProps {
  card: ContactCard;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onClick: (card: ContactCard) => void;
  onToggleFavorite: (card: ContactCard) => void;
  onOpenQr: (card: ContactCard) => void;
  onPushToCrm: (card: ContactCard, provider: CRMProvider) => void;
  privacyMode: boolean;
  viewMode: 'grid' | 'list';
  categoryColor?: string;
}

export const CardItem: React.FC<CardItemProps> = ({
  card,
  isSelected,
  onToggleSelect,
  onClick,
  onToggleFavorite,
  onOpenQr,
  onPushToCrm,
  privacyMode,
  viewMode,
  categoryColor,
}) => {
  const maskInfo = (text?: string) => {
    if (!text) return '';
    if (!privacyMode) return text;
    if (text.includes('@')) {
      const parts = text.split('@');
      return `${parts[0].slice(0, 2)}***@${parts[1]}`;
    }
    return `${text.slice(0, 4)} **** ${text.slice(-2)}`;
  };

  const hasCrmSync = (Object.values(card.crmSyncStatus || {}) as any[]).some((s) => Boolean(s?.synced));

  if (viewMode === 'list') {
    return (
      <div
        id={`card-list-item-${card.id}`}
        onClick={() => onClick(card)}
        className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 sm:gap-4 ${
          isSelected
            ? 'border-blue-500 bg-blue-50/60 dark:bg-[#0e162a] shadow-sm'
            : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090d16] hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
        }`}
      >
        <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(card.id)}
            onClick={(e) => e.stopPropagation()}
            className="h-5 w-5 rounded-md border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
          />

          <CompanyBrandFrame
            card={card}
            categoryColor={categoryColor}
            size="sm"
          />

          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                {card.fullName}
              </span>
              {card.isFavorite && (
                <Star className="h-3.5 w-3.5 text-amber-500 fill-current shrink-0" />
              )}
              {card.isOfflineScanned && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                  Offline
                </span>
              )}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold truncate mt-0.5">
              {card.jobTitle || 'Executive'} • <span className="text-slate-600 dark:text-slate-300 font-medium">{card.company}</span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-4 lg:space-x-6 text-xs text-slate-500 dark:text-slate-400">
          {card.email && <span className="truncate max-w-[180px]">✉ {maskInfo(card.email)}</span>}
          {card.phone && <span>☎ {maskInfo(card.phone)}</span>}
          {card.category && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 shrink-0">
              {categoryColor && (
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: categoryColor }}
                />
              )}
              {card.category}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
          {card.phone && (
            <a
              href={`tel:${card.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Call Contact"
            >
              <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </a>
          )}

          {card.email && (
            <a
              href={`mailto:${card.email}`}
              onClick={(e) => e.stopPropagation()}
              className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Send Email"
            >
              <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </a>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenQr(card);
            }}
            className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Show vCard QR Code"
          >
            <QrCode className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(card);
            }}
            className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Toggle Favorite"
          >
            <Star className={`h-4 w-4 ${card.isFavorite ? 'text-amber-500 fill-current' : ''}`} />
          </button>
        </div>
      </div>
    );
  }

  // Grid Card View
  return (
    <div
      id={`card-grid-item-${card.id}`}
      onClick={() => onClick(card)}
      className={`group rounded-2xl sm:rounded-3xl border transition-all cursor-pointer flex flex-col overflow-hidden ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-[#0e162a] shadow-md'
          : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090d16] hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg shadow-xs'
      }`}
    >
      {/* Reimagined Company Brand Identity Frame */}
      <div className="relative overflow-hidden border-b border-slate-200/80 dark:border-slate-800/80">
        <CompanyBrandFrame
          card={card}
          categoryColor={categoryColor}
          size="md"
        />

        {/* Top Floating Controls */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-auto z-20">
          <div
            onClick={(e) => e.stopPropagation()}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center -m-1.5"
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(card.id)}
              className="h-5 w-5 rounded-md border-white/50 bg-black/50 text-blue-500 focus:ring-blue-500 shadow-sm cursor-pointer"
            />
          </div>

          <div className="flex items-center space-x-1.5">
            {hasCrmSync && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white backdrop-blur-sm shadow-sm flex items-center border border-white/10"
                title="Synced to CRM"
              >
                <Check className="h-3 w-3 mr-0.5" /> CRM
              </span>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(card);
              }}
              className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white transition-colors cursor-pointer"
              title="Toggle Favorite"
              aria-label="Toggle Favorite"
            >
              <Star
                className={`h-4 w-4 ${
                  card.isFavorite ? 'text-amber-400 fill-current' : 'text-white/80'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Card Content Details */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-start justify-between gap-1">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
              {card.fullName}
            </h3>
            {card.category && (
              <span className="ml-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 shrink-0 inline-flex items-center gap-1.5">
                {categoryColor && (
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: categoryColor }}
                  />
                )}
                {card.category}
              </span>
            )}
          </div>

          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 truncate mt-0.5">
            {card.jobTitle || 'Executive'}
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
            {card.company}
          </p>
        </div>

        {/* Contact Snippets with direct tap triggers */}
        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
          {card.email && (
            <a
              href={`mailto:${card.email}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center text-[11px] truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-0.5"
            >
              <Mail className="h-3 w-3 mr-1.5 text-slate-400 shrink-0" />
              <span className="truncate">{maskInfo(card.email)}</span>
            </a>
          )}
          {card.phone && (
            <a
              href={`tel:${card.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center text-[11px] truncate hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-0.5"
            >
              <Phone className="h-3 w-3 mr-1.5 text-slate-400 shrink-0" />
              <span>{maskInfo(card.phone)}</span>
            </a>
          )}
        </div>

        {/* Footer Tags & QR Action */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-wrap gap-1 max-w-[70%] overflow-hidden h-5">
            {card.tags?.slice(0, 2).map((t) => (
              <span
                key={t}
                className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 truncate"
              >
                {t}
              </span>
            ))}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenQr(card);
            }}
            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Show vCard QR Code"
            aria-label="Show vCard QR Code"
          >
            <QrCode className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
