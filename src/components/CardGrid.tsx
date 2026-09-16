import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Grid,
  List,
  ArrowUpDown,
  Download,
  Share2,
  Trash2,
  CheckSquare,
  Square,
  Sparkles,
  Camera,
  Layers,
  Star,
  Shield,
  Plus,
  Tag,
  SlidersHorizontal
} from 'lucide-react';
import { ContactCard, CRMProvider, CategoryConfig } from '../types';
import { CardItem } from './CardItem';
import { exportToVCF, exportToCSV } from '../utils/exportUtils';
import { ExtractionEngineStatus } from './ExtractionEngineStatus';

interface CardGridProps {
  cards: ContactCard[];
  categoriesList?: CategoryConfig[];
  onOpenCategoryManager?: () => void;
  onCardClick: (card: ContactCard) => void;
  onToggleFavorite: (card: ContactCard) => void;
  onOpenQr: (card: ContactCard) => void;
  onPushToCrm: (card: ContactCard, provider: CRMProvider) => void;
  onBulkDelete: (cardIds: string[]) => void;
  onBulkCrmSync: (cardIds: string[], provider: CRMProvider) => void;
  onOpenBatchScanner: () => void;
  onOpenCameraScanner: () => void;
  privacyMode: boolean;
  isOffline?: boolean;
}

export const CardGrid: React.FC<CardGridProps> = ({
  cards,
  categoriesList = [],
  onOpenCategoryManager,
  onCardClick,
  onToggleFavorite,
  onOpenQr,
  onPushToCrm,
  onBulkDelete,
  onBulkCrmSync,
  onOpenBatchScanner,
  onOpenCameraScanner,
  privacyMode,
  isOffline = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'company'>('newest');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'favorites' | 'offline' | 'synced'>('all');

  // Category Color Map & Category list with counts
  const categoryColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    categoriesList.forEach((c) => {
      map[c.name] = c.color;
    });
    return map;
  }, [categoriesList]);

  // Categories list with counts
  const displayCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    cards.forEach((c) => {
      const cat = c.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const list: Array<{ name: string; color: string; count: number }> = [];
    const seen = new Set<string>();

    categoriesList.forEach((cat) => {
      seen.add(cat.name);
      list.push({
        name: cat.name,
        color: cat.color,
        count: counts[cat.name] || 0,
      });
    });

    Object.keys(counts).forEach((catName) => {
      if (!seen.has(catName)) {
        list.push({
          name: catName,
          color: '#64748b',
          count: counts[catName] || 0,
        });
      }
    });

    return list;
  }, [categoriesList, cards]);

  // Filtered & Sorted Cards
  const filteredCards = useMemo(() => {
    return cards
      .filter((card) => {
        // Text Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            card.fullName.toLowerCase().includes(q) ||
            card.company.toLowerCase().includes(q) ||
            card.jobTitle?.toLowerCase().includes(q) ||
            card.email?.toLowerCase().includes(q) ||
            card.phone?.toLowerCase().includes(q) ||
            card.category?.toLowerCase().includes(q) ||
            card.tags.some((t) => t.toLowerCase().includes(q)) ||
            card.notes?.toLowerCase().includes(q);

          if (!matches) return false;
        }

        // Category Filter
        if (activeCategory !== 'all' && card.category !== activeCategory) {
          return false;
        }

        // Status Filter
        if (filterType === 'favorites' && !card.isFavorite) return false;
        if (filterType === 'offline' && !card.isOfflineScanned) return false;
        if (filterType === 'synced') {
          const isSynced = (Object.values(card.crmSyncStatus || {}) as any[]).some((s) => Boolean(s?.synced));
          if (!isSynced) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.fullName.localeCompare(b.fullName);
        if (sortBy === 'company') return a.company.localeCompare(b.company);
        if (sortBy === 'oldest') return new Date(a.scannedAt).getTime() - new Date(b.scannedAt).getTime();
        // newest
        return new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime();
      });
  }, [cards, searchQuery, activeCategory, filterType, sortBy]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredCards.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCards.map((c) => c.id));
    }
  };

  const selectedCards = cards.filter((c) => selectedIds.includes(c.id));

  return (
    <div className="space-y-4 sm:space-y-5">
      
      {/* Android Dual-Engine OCR Status & Quick Action Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <ExtractionEngineStatus isOffline={isOffline} />
        
        <div className="flex items-center space-x-2 self-end sm:self-auto text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium">
            {cards.length} {cards.length === 1 ? 'Contact' : 'Contacts'} Synced
          </span>
        </div>
      </div>

      {/* Top Search & Filter Bar */}
      <div className="bg-white dark:bg-[#090d16] p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-3.5 sm:space-y-4">
        
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts, company, job title, email, notes..."
              className="w-full min-h-[44px] pl-10 pr-9 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 min-h-[32px] min-w-[32px] flex items-center justify-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Controls: View Switcher, Sort & Filters */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end w-full lg:w-auto gap-2 text-xs">
            
            {/* Filter Pill Selector */}
            <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setFilterType('all')}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                All ({cards.length})
              </button>
              <button
                onClick={() => setFilterType('favorites')}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterType === 'favorites'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                ★ Favorites
              </button>
              <button
                onClick={() => setFilterType('synced')}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterType === 'synced'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                CRM Synced
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center space-x-1 pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="min-h-[36px] bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer pr-1"
              >
                <option value="newest">Newest Scanned</option>
                <option value="oldest">Oldest Scanned</option>
                <option value="name">Contact Name</option>
                <option value="company">Company</option>
              </select>
            </div>

            {/* View Mode Grid/List */}
            <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-400'
                }`}
                title="Grid View"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-400'
                }`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Categories Filter Strip */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/80 gap-2.5">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0 flex items-center gap-1">
              <Tag className="w-3 h-3" /> Categories:
            </span>
            <button
              onClick={() => setActiveCategory('all')}
              className={`min-h-[34px] px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#0c1220] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              All Categories
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                {cards.length}
              </span>
            </button>
            
            {displayCategories.map((cat) => {
              const isSelected = activeCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(isSelected ? 'all' : cat.name)}
                  className={`min-h-[34px] px-2.5 py-1 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : 'bg-slate-100 dark:bg-[#0c1220] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span>{cat.name}</span>
                  {cat.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-white/20 dark:bg-slate-900/20'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}>
                      {cat.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Manage / Customize Categories button */}
          {onOpenCategoryManager && (
            <button
              id="btn-open-category-manager"
              onClick={onOpenCategoryManager}
              className="min-h-[36px] shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Customize and add categories"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Customize</span>
            </button>
          )}
        </div>

      </div>

      {/* Bulk Action Dock (Fixed floating thumb dock on mobile, sticky bar on desktop) */}
      {selectedIds.length > 0 && (
        <div className="fixed sm:sticky bottom-4 sm:bottom-auto sm:top-20 inset-x-3 sm:inset-x-auto z-40 bg-slate-950/95 dark:bg-[#070b14]/95 backdrop-blur-xl text-white p-3 sm:p-4 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 animate-in slide-in-from-bottom sm:slide-in-from-top duration-200 border border-slate-700/80 dark:border-slate-800">
          <div className="flex items-center space-x-3 text-xs font-bold justify-between sm:justify-start">
            <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-extrabold">
              {selectedIds.length} Selected
            </span>
            <button
              onClick={handleSelectAll}
              className="text-slate-300 hover:text-white underline cursor-pointer text-xs"
            >
              {selectedIds.length === filteredCards.length ? 'Deselect All' : 'Select All Filtered'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => exportToVCF(selectedCards)}
              className="min-h-[42px] px-3 py-2 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Download className="h-4 w-4 mr-1.5 text-blue-400 shrink-0" />
              <span>.VCF ({selectedIds.length})</span>
            </button>

            <button
              onClick={() => exportToCSV(selectedCards)}
              className="min-h-[42px] px-3 py-2 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Download className="h-4 w-4 mr-1.5 text-emerald-400 shrink-0" />
              <span>.CSV</span>
            </button>

            <button
              onClick={() => onBulkCrmSync(selectedIds, 'HubSpot')}
              className="min-h-[42px] px-3 py-2 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-sm transition-colors cursor-pointer"
            >
              <Share2 className="h-4 w-4 mr-1.5 shrink-0" />
              <span>Push CRM</span>
            </button>

            <button
              onClick={() => {
                if (confirm(`Delete ${selectedIds.length} selected cards?`)) {
                  onBulkDelete(selectedIds);
                  setSelectedIds([]);
                }
              }}
              className="min-h-[42px] px-3 py-2 rounded-xl font-bold bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4 mr-1 shrink-0" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Cards List / Grid Rendering */}
      {filteredCards.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredCards.map((card) => (
              <CardItem
                key={card.id}
                card={card}
                isSelected={selectedIds.includes(card.id)}
                onToggleSelect={handleToggleSelect}
                onClick={onCardClick}
                onToggleFavorite={onToggleFavorite}
                onOpenQr={onOpenQr}
                onPushToCrm={onPushToCrm}
                privacyMode={privacyMode}
                viewMode="grid"
                categoryColor={categoryColorMap[card.category]}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredCards.map((card) => (
              <CardItem
                key={card.id}
                card={card}
                isSelected={selectedIds.includes(card.id)}
                onToggleSelect={handleToggleSelect}
                onClick={onCardClick}
                onToggleFavorite={onToggleFavorite}
                onOpenQr={onOpenQr}
                onPushToCrm={onPushToCrm}
                privacyMode={privacyMode}
                viewMode="list"
                categoryColor={categoryColorMap[card.category]}
              />
            ))}
          </div>
        )
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 space-y-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Layers className="h-7 w-7" />
          </div>

          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {searchQuery || activeCategory !== 'all'
                ? 'No matching business cards found'
                : 'Your Digitized Card Vault is Empty'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {searchQuery || activeCategory !== 'all'
                ? 'Try resetting your search query or category filters.'
                : 'Digitize your pile of physical business cards with 10-card batch OCR or direct live camera scanning.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenBatchScanner}
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              1 Picture 10 Cards Batch OCR
            </button>
            <button
              onClick={onOpenCameraScanner}
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Camera className="h-4 w-4 mr-1.5 text-blue-600" />
              Scan Single Card Camera
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
